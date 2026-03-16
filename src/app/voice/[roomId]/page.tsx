'use client';

import { Suspense, use, useRef, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import VoiceControls from '@/components/VoiceControls';
import { WebRTCManager } from '@/lib/webrtc';
import { supabase } from '@/lib/supabaseClient';
import { findMatch } from '@/lib/matching';
import { detectIdentity, UserIdentity } from '@/lib/identity';
import Toast from '@/components/Toast';

export default function VoicePage({ params }: { params: Promise<{ roomId: string }> }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VoiceContent params={params} />
    </Suspense>
  );
}

function VoiceContent({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const searchParams = useSearchParams();
  const myId = searchParams.get('me');
  const router = useRouter();
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [myIdentity, setMyIdentity] = useState<UserIdentity | null>(null);
  const [partnerIdentity, setPartnerIdentity] = useState<UserIdentity | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  const webrtcRef = useRef<WebRTCManager | null>(null);
  const channelRef = useRef<any>(null);
  const rematchChannelRef = useRef<any>(null);

  // 1. Identity Detection - Only run once
  useEffect(() => {
    if (!myId) return;
    async function initIdentity() {
        try {
            const identity = await detectIdentity(myId!);
            setMyIdentity(identity);
        } catch (err) {
            console.error('Identity Detection Error:', err);
        }
    }
    initIdentity();
  }, [myId]);

  // 2. Room & WebRTC Lifecycle
  useEffect(() => {
    if (!myId) {
      router.push('/');
      return;
    }

    // Init WebRTC & Room info
    async function initVoice() {
      console.log('Voice session initializing for room:', roomId);
      try {
          const { data: roomData, error: roomError } = await supabase
            .from('rooms')
            .select('user1, user2')
            .eq('id', roomId)
            .maybeSingle();
          
          let isInitiator = false;
          if (roomData) {
              isInitiator = roomData.user1 === myId;
          } else {
              // Fallback for test rooms or missing data: use roomId as a seed
              // Simple deterministic choice: if roomId starts with a-f, user1 is initiator
              isInitiator = /^[0-7]/.test(roomId);
              console.warn('Room data missing, using fallback initiator logic:', isInitiator);
          }
          
          console.log('Is Initiator:', isInitiator);
          
          const manager = new WebRTCManager(roomId, myId!);
          webrtcRef.current = manager;
          manager.init(isInitiator, (stream) => {
              console.log('Remote stream received');
              setRemoteStream(stream);
              setStatus('connected');
          });
      } catch (err) {
          console.error('Voice Init Error:', err);
          setToast({ message: "Failed to initialize voice. Try skipping.", type: "error" });
      }
    }
    initVoice();

    // Setup Identity Sync Channel
    const channel = supabase.channel(`voice_room:${roomId}`);
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'identity_sync' }, (payload) => {
        if (payload.payload.userId !== myId) {
            console.log('Received partner identity:', payload.payload.identity);
            setPartnerIdentity(payload.payload.identity);
        }
      })
      .on('broadcast', { event: 'partner_skipped' }, (payload) => {
        if (payload.payload.senderId !== myId) {
            console.log('Partner skipped');
            setStatus('disconnected');
            setPartnerIdentity(null);
        }
      })
      .subscribe((subStatus) => {
          if (subStatus === 'SUBSCRIBED' && myIdentity) {
              channel.send({
                  type: 'broadcast',
                  event: 'identity_sync',
                  payload: { userId: myId, identity: myIdentity }
              });
          }
      });

    return () => {
        console.log('Cleaning up voice session for room:', roomId);
        webrtcRef.current?.destroy();
        supabase.removeChannel(channel);
        if (rematchChannelRef.current) {
            supabase.removeChannel(rematchChannelRef.current);
        }
    };
  }, [roomId, myId, router, myIdentity]); // Added myIdentity to sync when it arrives

  // 3. Heartbeat identity sync to ensure delivery
  useEffect(() => {
    if (myIdentity && status === 'connected' && channelRef.current) {
        const interval = setInterval(() => {
            channelRef.current.send({
                type: 'broadcast',
                event: 'identity_sync',
                payload: { userId: myId, identity: myIdentity }
            });
        }, 5000);
        return () => clearInterval(interval);
    }
  }, [myIdentity, status, myId]);

  const handleSkip = async () => {
    console.log('Skipping current user...');
    setStatus('connecting');
    setPartnerIdentity(null);
    setRemoteStream(null);
    setToast({ message: "Finding a new stranger...", type: "info" });
    
    // 1. Clean up previous rematch listener
    if (rematchChannelRef.current) {
        supabase.removeChannel(rematchChannelRef.current);
        rematchChannelRef.current = null;
    }

    // 2. Broadcast skip to partner
    if (channelRef.current) {
        try {
            channelRef.current.send({
              type: 'broadcast',
              event: 'partner_skipped',
              payload: { senderId: myId }
            });
        } catch (e) {
            console.warn('Failed to broadcast skip:', e);
        }
    }

    // 3. Reset webrtc
    webrtcRef.current?.destroy();
    webrtcRef.current = null;

    // 4. Find new match
    try {
        const newRoom = await findMatch(myId!, 'voice');
        if (newRoom) {
          console.log('New match found immediately:', newRoom.id);
          router.replace(`/voice/${newRoom.id}?me=${myId}`);
        } else {
            console.log('No immediate match. Waiting for database update...');
            // Wait for match via realtime update
            const waitChannel = supabase.channel(`user:${myId}_voice_rematch`);
            
            waitChannel.on('postgres_changes', {
              event: 'UPDATE',
              schema: 'public',
              table: 'users_temp',
              filter: `id=eq.${myId}`
            }, async (payload) => {
              console.log('User update received:', payload.new.status);
              if (payload.new.status === 'matched') {
                const { data: roomData } = await supabase
                  .from('rooms')
                  .select('id')
                  .or(`user1.eq.${myId},user2.eq.${myId}`)
                  .order('created_at', { ascending: false })
                  .limit(1)
                  .single();
                
                if (roomData) {
                  console.log('Match found via realtime:', roomData.id);
                  router.replace(`/voice/${roomData.id}?me=${myId}`);
                  supabase.removeChannel(waitChannel);
                  rematchChannelRef.current = null;
                }
              }
            });

            waitChannel.subscribe();
            rematchChannelRef.current = waitChannel;
        }
    } catch (err) {
        console.error('Skip/Match Error:', err);
        setToast({ message: "Matching error. Please refresh.", type: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-6">
      {/* BRANDING TOP: MINIMAL & ELEGANT */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-8 h-12 shrink-0">
            <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => router.push('/')}>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-all">
                    <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <h1 className="text-xl font-black text-foreground tracking-tighter uppercase italic">Chat<span className="text-primary not-italic">Jeen</span></h1>
            </div>
            
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span>Protocol Active</span>
                </div>
            </div>
        </div>
      </div>
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
      </div>

      <VoiceControls 
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        onEnd={() => router.push('/')}
        onSkip={handleSkip}
        onReport={() => {
            console.log('Reporting user...');
            setToast({ message: "User reported. Finding you a new match...", type: "info" });
            setTimeout(handleSkip, 1500);
        }}
        remoteStream={remoteStream}
        partnerIdentity={partnerIdentity}
        status={status}
      />

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
