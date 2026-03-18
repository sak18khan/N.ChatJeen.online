'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Info, X, Zap, Loader2, Flag, Sparkles, Clock, Globe, ShieldCheck, RefreshCw, Trophy, Menu, UserCircle, Image } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import MessageBubble from './MessageBubble';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { generateIcebreaker } from '@/lib/groq';
import Toast from './Toast';
import { findMatch } from '@/lib/matching';
import { detectIdentity, UserIdentity } from '@/lib/identity';
import ChatKarmaOverlay from './ChatKarmaOverlay';
import Link from 'next/link';

interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface ChatUIProps {
  roomId: string;
  myId: string;
  onSkip: () => void;
  onReport: () => void;
  mode: 'text' | 'voice';
  variant?: 'full' | 'minimal';
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

const COMMON_EMOJIS = ["😊", "😂", "🥰", "😎", "🤔", "🙌", "✨", "🔥", "❤️", "👍", "👋", "🎉", "🤣", "🥺", "💀", "👀", "💯", "😭"];

export default function ChatUI({ roomId: initialRoomId, myId, onSkip, onReport, mode, variant = 'full' }: ChatUIProps) {
  const [roomId, setRoomId] = useState(initialRoomId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [lastMessageSent, setLastMessageSent] = useState(0);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [isGeneratingIcebreaker, setIsGeneratingIcebreaker] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>('connected');
  const [secondsConnected, setSecondsConnected] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [myIdentity, setMyIdentity] = useState<UserIdentity | null>(null);
  const [partnerIdentity, setPartnerIdentity] = useState<UserIdentity | null>(null);
  const [showKarma, setShowKarma] = useState(false);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- IMAGE UPLOAD LOGIC ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        setToast({ message: 'Only image files are allowed.', type: 'error' });
        return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
        const base64Str = event.target?.result as string;
        
        // Resize image to prevent massive base64 payloads
        const img = new globalThis.Image();
        img.onload = async () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width = Math.round((width * MAX_HEIGHT) / height);
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            
            const resizedBase64 = canvas.toDataURL('image/jpeg', 0.7);

            // Send via database
            const { error } = await supabase
              .from('messages')
              .insert({
                room_id: roomId,
                sender_id: myId,
                content: `[IMAGE]${resizedBase64}`
              });

            if (error) console.error('Error sending image:', error);
            
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        img.src = base64Str;
    };
    reader.readAsDataURL(file);
  };

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (status === 'connected') {
      timerIntervalRef.current = setInterval(() => {
        setSecondsConnected(prev => {
          const next = prev + 1;
          if (next === 300) { // 5 minutes
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 5000);
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [status]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // --- TYPING INDICATOR SENDING ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    
    // Broadcast typing status
    supabase.channel(`chat_room:${roomId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: myId, isTyping: true }
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      supabase.channel(`chat_room:${roomId}`).send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: myId, isTyping: false }
      });
    }, 2000);
  };

  // --- SYNC SKIP LOGIC ---
  const handleSkip = async () => {
    // Show karma if session was meaningful and not already showing
    if (!showKarma && partnerId && (secondsConnected > 15 || messages.length > 5)) {
        setShowKarma(true);
        return; // Wait for user to rate or close
    }

    // Inform partner
    supabase.channel(`chat_room:${roomId}`).send({
      type: 'broadcast',
      event: 'partner_skipped',
      payload: { senderId: myId }
    });
    
    // Redirect back to the dedicated matchmaker page, which handles inserting into 
    // the queue, heartbeat pings, and loading states automatically!
    window.location.href = `/matching?mode=${mode}`;
  };

  // --- EMOJI PICKER LOGIC ---
  const addEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const channelRef = useRef<any>(null);

  // --- MAIN SUBSCRIPTION LOGIC ---
  useEffect(() => {
    const fetchRoomAndMessages = async () => {
      // ... same logic
      const { data: msgData } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });
      if (msgData) setMessages(msgData);

      const { data: roomData } = await supabase
        .from('rooms')
        .select('user1, user2')
        .eq('id', roomId)
        .single();
      
      if (roomData) {
        const id = roomData.user1 === myId ? roomData.user2 : roomData.user1;
        setPartnerId(id);
      }
    };

    fetchRoomAndMessages();

    // 15 SECOND FALLBACK TIMEOUT FOR GHOST CONNECTIONS
    let ghostTimeout: NodeJS.Timeout | null = null;
    if (status === 'connected' && !partnerIdentity) {
        ghostTimeout = setTimeout(() => {
            console.log('Ghost connection timeout reached. Partner never fully joined. Skipping...');
            setToast({ message: "Partner failed to connect. Finding someone else...", type: 'info' });
            handleSkip(); // Find a new match automatically
        }, 15000);
    }

    const channel = supabase.channel(`chat_room:${roomId}`, {
        config: {
            presence: { key: myId }
        }
    });

    channelRef.current = channel;

    channel
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${roomId}`
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.userId !== myId) {
          setIsOtherTyping(payload.payload.isTyping);
        }
      })
      .on('broadcast', { event: 'partner_skipped' }, (payload) => {
          if (payload.payload.senderId !== myId) {
              if (ghostTimeout) clearTimeout(ghostTimeout);
              setStatus('disconnected');
              setPartnerIdentity(null);
              if (secondsConnected > 15 || messages.length > 5) {
                setShowKarma(true);
              }
          }
      })
      .on('broadcast', { event: 'identity_sync' }, (payload) => {
        if (payload.payload.userId !== myId) {
            console.log('Received partner identity:', payload.payload.identity);
            if (ghostTimeout) clearTimeout(ghostTimeout); // Clear ghost timeout when identity is received
            setPartnerIdentity(payload.payload.identity);
        }
      })
      .on('broadcast', { event: 'request_identity' }, (payload) => {
        if (payload.payload.userId !== myId && myIdentity) {
            channel.send({
                type: 'broadcast',
                event: 'identity_sync',
                payload: { userId: myId, identity: myIdentity }
            });
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        // If the other person leaves presence (e.g. closes tab, drops connection)
        if (key !== myId) {
            console.log('Partner left presence via channel drop', key);
            if (ghostTimeout) clearTimeout(ghostTimeout);
            setStatus('disconnected');
            // Assuming this implies they skipped or refreshed
            if (secondsConnected > 15 || messages.length > 5) {
                setShowKarma(true);
            }
        }
      })
      .subscribe(async (subStatus) => {
        if (subStatus === 'SUBSCRIBED') {
            await channel.track({ online: true });
            // Signal presence and request identity from partner
            channel.send({
                type: 'broadcast',
                event: 'request_identity',
                payload: { userId: myId }
            });
            // Also send ours just in case
            if (myIdentity) {
                channel.send({
                    type: 'broadcast',
                    event: 'identity_sync',
                    payload: { userId: myId, identity: myIdentity }
                });
            }
        }
      });

    return () => {
        if (ghostTimeout) clearTimeout(ghostTimeout);
        supabase.removeChannel(channel);
        channelRef.current = null;
    };
  }, [roomId, myId, myIdentity]);

  // --- IDENTITY DETECTION ---
  useEffect(() => {
    async function initIdentity() {
        const identity = await detectIdentity(myId);
        setMyIdentity(identity);
    }
    initIdentity();
  }, [myId]);

  // Broadcast our identity with heartbeats to ensure delivery
  useEffect(() => {
    if (myIdentity && status === 'connected' && channelRef.current) {
        const send = () => {
            if (channelRef.current) {
                channelRef.current.send({
                    type: 'broadcast',
                    event: 'identity_sync',
                    payload: { userId: myId, identity: myIdentity }
                });
            }
        };

        send(); // Send immediately
        
        // Heartbeat for reliability at start of match
        const heartbeat = setInterval(send, 3000);
        const timeout = setTimeout(() => clearInterval(heartbeat), 15000);

        return () => {
            clearInterval(heartbeat);
            clearTimeout(timeout);
        };
    }
  }, [myIdentity, status, roomId]); // Added roomId to reset heartbeat on switch

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOtherTyping]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    // Anti-spam filters
    const now = Date.now();
    if (now - lastMessageSent < 700) {
       setToast({ message: "Sending too fast! Please slow down.", type: 'info' });
       return;
    }
    if (inputText.length > 500) {
       setToast({ message: "Message is too long. Max 500 characters.", type: 'error' });
       return;
    }

    setLastMessageSent(now);
    
    // Basic obscenity filter (client-side mitigation)
    const badWords = ['fuck', 'shit', 'bitch', 'asshole', 'nigger', 'faggot'];
    let content = inputText;
    badWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        content = content.replace(regex, '***');
    });

    setInputText('');
    
    supabase.channel(`chat_room:${roomId}`).send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: myId, isTyping: false }
    });

    const { error } = await supabase
      .from('messages')
      .insert({
        room_id: roomId,
        sender_id: myId,
        content: content
      });

    if (error) console.error('Error sending message:', error);
  };

  return (
    <div className="flex flex-col w-full relative transition-all duration-300 h-screen h-[100dvh] max-w-4xl mx-auto my-0 bg-black overflow-hidden">
      
      {/* NEW HEADER: STICKY & MINIMAL */}
      <header className="sticky top-0 z-50 bg-[#000000] border-b border-white/10 px-4 h-14 flex items-center justify-center shrink-0">
          <Link href="/" className="flex flex-col items-center hover:opacity-80 transition-opacity">
              <h1 className="text-base font-black italic tracking-tighter uppercase text-white">Chat<span className="text-yellow-400 not-italic">Jeen</span></h1>
              <span className="text-[10px] text-white/40 font-medium">www.chatjeen.online</span>
          </Link>
      </header>

      <div className="flex-1 flex flex-col bg-black border-none overflow-hidden relative">
        <AnimatePresence>
            {showCelebration && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
                >
                    <div className="bg-primary text-primary-foreground px-8 py-4 rounded-full shadow-2xl flex items-center gap-3">
                        <Trophy className="w-6 h-6" />
                        <span className="font-bold text-lg">5 Minute Milestone Reached! 🎉</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* MATCH PROFILE CARD: SLEEK & INTEGRATED */}
        {variant === 'full' && status === 'connected' && (
          <div className="mx-4 mt-6 mb-2">
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 flex flex-col gap-3 shadow-lg relative overflow-hidden">
                {/* Subtle background glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-white/40 shrink-0">
                        <UserCircle className="w-8 h-8" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl leading-none">{partnerIdentity?.flag || '🌐'}</span>
                            <h2 className="font-bold text-base text-white truncate">{partnerIdentity?.name || 'Anonymous'}</h2>
                        </div>
                        <div className="flex items-center gap-3 w-full">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-[#5CE65C] shadow-[0_0_8px_rgba(92,230,92,0.5)]" />
                                <span className="text-xs font-medium text-[#5CE65C]">Connected</span>
                            </div>
                            <div className="w-1 h-1 rounded-full bg-white/20" />
                            <span className="text-xs font-medium text-white/50 truncate">
                                {partnerIdentity?.country || 'Global Match'}
                            </span>
                            <div className="ml-auto flex items-center gap-1.5 text-white/40">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="text-xs font-mono">{formatTime(secondsConnected)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        )}

        <div 
            ref={scrollRef}
            className={cn(
                "flex-1 overflow-y-auto space-y-4 bg-black scroll-smooth scrollbar-none",
                variant === 'minimal' ? "p-4" : "px-4 py-4"
            )}
        >
            {status === 'connecting' ? (
                <div className="flex flex-col items-center justify-center h-full gap-6 text-center animate-in fade-in duration-500">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-[#FF4B4B]/10 flex items-center justify-center">
                            <motion.div 
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.2, 0.5] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                className="absolute inset-0 rounded-full bg-[#FF4B4B]/20"
                            />
                            <div className="w-4 h-4 rounded-full bg-[#FF4B4B] shadow-[0_0_15px_rgba(255,75,75,0.6)]" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white tracking-tight">Pairing...</h3>
                        <p className="text-xs text-white/30 font-medium">Pairing time: about 1 minute</p>
                    </div>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 px-6 py-2.5 rounded-full border border-white/10 text-xs font-bold text-white/50 hover:bg-white/5 transition-all"
                    >
                        Cancel Pairing
                    </button>
                </div>
            ) : status === 'disconnected' ? (
                <div className="flex flex-col items-center justify-start h-full pt-10 px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* DISCONNECTED STATUS BOX */}
                    <div className="w-full bg-[#111111] border border-white/5 rounded-2xl p-6 flex flex-col gap-4 text-left">
                         <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-[#FF4B4B]" />
                            <p className="text-sm font-medium text-white/80">Partner has left the chat.</p>
                         </div>
                         
                         <div className="flex items-center gap-6 mt-2 ml-5">
                            <button className="text-xs font-bold text-white/30 hover:text-white/50 transition-colors uppercase tracking-wider underline">Report abuse</button>
                            <button className="text-xs font-bold text-white/30 hover:text-white/50 transition-colors uppercase tracking-wider underline">Feedback</button>
                         </div>
                    </div>

                    <div className="flex-1" />
                    
                    {/* RESTART BUTTON AT THE BOTTOM */}
                    <div className="w-full pb-10 flex flex-col items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white/20">
                            <Menu className="w-4 h-4 rotate-90" />
                        </div>
                        <button 
                            onClick={handleSkip}
                            className="w-full bg-[#FF4B4B] text-white font-black text-lg py-5 rounded-[1.5rem] shadow-[0_15px_30px_rgba(255,75,75,0.2)] active:scale-95 transition-all uppercase tracking-widest"
                        >
                            Restart
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                        <MessageBubble 
                            key={msg.id} 
                            message={msg} 
                            isMe={msg.sender_id === myId} 
                        />
                        ))}
                    </AnimatePresence>
                    
                    {isOtherTyping && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start w-full px-4 mb-2"
                        >
                            <div className="bg-[#1A1A1A] px-4 py-2.5 rounded-[1.25rem] rounded-bl-[0.25rem] flex items-center gap-2 text-white/70 shadow-sm border border-white/5">
                                <div className="flex gap-1.5 h-4 items-center">
                                    <motion.div animate={{ scale:[1, 1.2, 1], opacity:[0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }} className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                                    <motion.div animate={{ scale:[1, 1.2, 1], opacity:[0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                                    <motion.div animate={{ scale:[1, 1.2, 1], opacity:[0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                                </div>
                                <span className="text-xs font-medium pl-1">typing...</span>
                            </div>
                        </motion.div>
                    )}
                </>
            )}
        </div>

        {/* NEW FOOTER AREA: MATCHING REFERENCE */}
        {status === 'connected' && (
            <div className="p-4 sm:p-6 bg-[#000000] border-t border-white/5 pb-8">
                <div className="flex items-center gap-3">
                    {/* LEAVE BUTTON */}
                    <button 
                        onClick={handleSkip}
                        className="text-[#FF4B4B] font-bold text-sm px-2 py-2 hover:opacity-80 transition-all uppercase tracking-wider"
                    >
                        Leave
                    </button>

                    {/* CENTERED INPUT FIELD */}
                    <div className="flex-1 relative flex items-center">
                        <button 
                            className="absolute left-4 z-10 text-white/20 hover:text-white/40 transition-colors"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                            <Smile className="w-5 h-5" />
                        </button>
                        
                        <input
                            ref={inputRef as any}
                            type="text"
                            value={inputText}
                            onChange={(e) => handleInputChange(e as any)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSend();
                                }
                            }}
                            placeholder="Type a message..."
                            className="w-full bg-[#1A1A1A] border-none rounded-full pl-12 pr-12 py-3.5 text-sm text-white placeholder:text-white/20 focus:ring-0 outline-none"
                        />

                        {showEmojiPicker && (
                            <div className="absolute bottom-full left-0 mb-4 bg-[#1A1A1A] border border-white/10 rounded-2xl p-3 shadow-2xl flex flex-wrap gap-2 w-[280px] z-50">
                                {COMMON_EMOJIS.map(emoji => (
                                    <button 
                                        key={emoji} 
                                        onClick={() => addEmoji(emoji)}
                                        className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg text-xl transition-colors"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        )}

                        <input 
                            type="file" 
                            accept="image/*" 
                            ref={fileInputRef} 
                            onChange={handleImageUpload} 
                            className="hidden" 
                        />
                        <button 
                            className="absolute right-4 z-10 text-white/20 hover:text-white/40 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Image className="w-5 h-5" />
                        </button>
                    </div>

                    {/* SEND BUTTON */}
                    <button
                        onClick={handleSend}
                        disabled={!inputText.trim()}
                        className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 disabled:opacity-30",
                            inputText.trim() ? "bg-[#FACC15] text-black shadow-[0_0_15px_rgba(250,204,21,0.3)]" : "bg-[#1A1A1A] text-white/40"
                        )}
                    >
                        <Send className="w-5 h-5 translate-x-0.5 -translate-y-0.5 rotate-45" />
                    </button>
                </div>
            </div>
        )}
      </div>
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        {showKarma && partnerId && (
            <ChatKarmaOverlay 
                partnerId={partnerId} 
                onClose={() => setShowKarma(false)} 
                onNext={handleSkip} 
            />
        )}
      </AnimatePresence>
    </div>
  );
}
