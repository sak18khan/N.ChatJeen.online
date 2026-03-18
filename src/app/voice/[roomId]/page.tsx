'use client';

import { Suspense, use, useRef, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import VoiceControls from '@/components/VoiceControls';
import { PeerJSManager } from '@/lib/webrtc';
import { supabase } from '@/lib/supabaseClient';
import { findMatch } from '@/lib/matching';
import { detectIdentity, UserIdentity } from '@/lib/identity';
import Toast from '@/components/Toast';

// Firebase imports for identity and skips
import { rtdb, fbConnectionErr } from '@/lib/firebaseClient';
import { ref, onValue, set, remove, onDisconnect, off } from 'firebase/database';

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
  
  const webrtcRef = useRef<PeerJSManager | null>(null);
  const rematchChannelRef = useRef<any>(null);

  // Monitor Firebase Connection Errors
  useEffect(() => {
    const errorInterval = setInterval(() => {
        if (fbConnectionErr && !toast?.message.includes(fbConnectionErr)) {
            setToast({ message: fbConnectionErr, type: 'error' });
        }
    }, 1000);
    return () => clearInterval(errorInterval);
  }, [toast]);

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

    let isMounted = true;

    // Init WebRTC & Room info
    async function initVoice() {
      console.log('Voice session initializing for room:', roomId);
      try {
          let roomData = null;
          let retries = 5;
          while (retries > 0 && isMounted) {
              const { data } = await supabase
                  .from('rooms')
                  .select('user1, user2')
                  .eq('id', roomId)
                  .maybeSingle();
              if (data) {
                  roomData = data;
                  break;
              }
              console.warn('[VoicePage] Room data not found, retrying...');
              await new Promise(r => setTimeout(r, 600));
              retries--;
          }

          if (!isMounted) return;
          
          let isInitiator = false;
          if (roomData) {
              isInitiator = roomData.user1 === myId;
          } else {
              console.error('[VoicePage] CRITICAL: Room data missing after retries! Connection will likely fail.');
              isInitiator = /^[0-7]/.test(roomId);
          }
          
          console.log('Is Initiator:', isInitiator);
          
          const manager = new PeerJSManager(roomId, myId!);
          webrtcRef.current = manager;
          manager.init(isInitiator, null, (stream) => {
              console.log('Remote stream received');
              if (isMounted) {
                  setRemoteStream(stream);
                  setStatus('connected');
              }
          }, (err) => {
              console.error('PeerJS init error:', err);
              if (!isMounted) return;
              if (err.includes('Microphone')) {
                  setToast({ message: "Microphone access is required to use Voice Chat.", type: "error" });
              } else {
                  setToast({ message: "Failed to initialize voice. Try skipping.", type: "error" });
              }
              setStatus('disconnected');
          });
      } catch (err: any) {
          console.error('Voice Room Setup Error:', err);
      }
    }
    initVoice();

    // Setup Identity Sync and Skip Channel via Firebase RTDB
    const identitiesRef = ref(rtdb, `rooms/${roomId}/identities`);
    const skippedRef = ref(rtdb, `rooms/${roomId}/skipped`);

    const onIdentityAdded = onValue(identitiesRef, (snapshot) => {
        const identities = snapshot.val() || {};
        for (const [uid, identity] of Object.entries(identities)) {
            if (uid !== myId && isMounted) {
                console.log('Received partner identity:', identity);
                setPartnerIdentity(identity as UserIdentity);
            }
        }
    });

    const onPartnerSkipped = onValue(skippedRef, (snapshot) => {
        const skips = snapshot.val() || {};
        const partnerSkipped = Object.keys(skips).find(uid => uid !== myId);
        if (partnerSkipped && isMounted) {
            console.log('Partner skipped');
            setStatus('disconnected');
            setPartnerIdentity(null);
        }
    });

    return () => {
        isMounted = false;
        console.log('Cleaning up voice session for room:', roomId);
        webrtcRef.current?.destroy();
        
        // Cleanup Firebase Listeners
        off(identitiesRef, 'value', onIdentityAdded);
        off(skippedRef, 'value', onPartnerSkipped);
        
        const myIdentityRef = ref(rtdb, `rooms/${roomId}/identities/${myId}`);
        remove(myIdentityRef).catch(e => console.error(e));
        
        if (rematchChannelRef.current) {
            supabase.removeChannel(rematchChannelRef.current);
        }
    };
  }, [roomId, myId, router]);

  // 3. Status sync and Identity broadcasting
  useEffect(() => {
    // Broadcast identity as soon as we have it so the UI shows 'Connecting to [Name]...'
    if (myIdentity && myId && roomId) {
        const myIdentityRef = ref(rtdb, `rooms/${roomId}/identities/${myId}`);
        // ensure it clears on disconnect
        onDisconnect(myIdentityRef).remove().catch(e => console.error(e));
        set(myIdentityRef, myIdentity);
    }
  }, [myIdentity, myId, roomId]);

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

    // 2. Broadcast skip to partner via Firebase
    try {
        const mySkipRef = ref(rtdb, `rooms/${roomId}/skipped/${myId}`);
        await set(mySkipRef, true);
    } catch (e) {
        console.warn('Failed to broadcast skip:', e);
    }

    // 3. Reset webrtc
    webrtcRef.current?.destroy();
    webrtcRef.current = null;

    // 4. Redirect to the dedicated matchmaker page to handle queue insertion & heartbeats
    window.location.href = '/matching?mode=voice';
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

