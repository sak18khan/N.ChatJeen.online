'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Info, X, Zap, Loader2, Flag, Sparkles, Clock, Globe, ShieldCheck, RefreshCw, Trophy } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import MessageBubble from './MessageBubble';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { generateIcebreaker } from '@/lib/groq';
import Toast from './Toast';
import { findMatch } from '@/lib/matching';
import { detectIdentity, UserIdentity } from '@/lib/identity';
import ChatKarmaOverlay from './ChatKarmaOverlay';

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
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

    supabase.channel(`chat_room:${roomId}`).send({
      type: 'broadcast',
      event: 'partner_skipped',
      payload: { senderId: myId }
    });

    setStatus('connecting');
    setMessages([]);
    setSecondsConnected(0);
    setShowKarma(false);
    setPartnerIdentity(null);
    setPartnerId(null);
    await supabase
      .from('users_temp')
      .update({ status: 'waiting' })
      .eq('id', myId);

    // 2. Find new match
    const newRoom = await findMatch(myId, mode);
    if (newRoom) {
      setRoomId(newRoom.id);
      setStatus('connected');
      window.history.replaceState(null, '', `/${mode}/${newRoom.id}?me=${myId}`);
    } else {
        const channel = supabase
        .channel(`user:${myId}_rematch`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'users_temp',
          filter: `id=eq.${myId}`
        }, async (payload) => {
          if (payload.new.status === 'matched') {
            const { data: roomData } = await supabase
              .from('rooms')
              .select('id')
              .or(`user1.eq.${myId},user2.eq.${myId}`)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
            
            if (roomData) {
              setRoomId(roomData.id);
              setStatus('connected');
              window.history.replaceState(null, '', `/${mode}/${roomData.id}?me=${myId}`);
              supabase.removeChannel(channel);
            }
          }
        })
        .subscribe();
    }
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

    const channel = supabase.channel(`chat_room:${roomId}`);
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
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
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
    const content = inputText;
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
    <div className="flex flex-col w-full relative transition-all duration-300 h-[92vh] sm:h-[90vh] max-w-4xl mx-auto my-0 sm:my-8">
      
      {/* BRANDING TOP: MINIMAL & ELEGANT */}
      {variant === 'full' && (
        <div className="flex items-center justify-between px-6 mb-6 h-12 shrink-0">
            <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => window.location.href = '/'}>
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
      )}

      <div className="flex-1 flex flex-col bg-card/60 backdrop-blur-2xl border border-white/10 rounded-none sm:rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden relative">
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

        {/* Connection Header and Info Bar only in full mode */}
        {variant === 'full' && (
          <>
            {/* Connection Header: Premium & Informative */}
            <div className="px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                <div className="flex items-center gap-5">
                <div className="relative group">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center text-primary font-black text-2xl border border-white/10 overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-500">
                        {status === 'connecting' ? <RefreshCw className="w-7 h-7 animate-spin opacity-50" /> : (partnerIdentity?.flag || 'S')}
                    </div>
                    <motion.div 
                        initial={false}
                        animate={{ 
                            backgroundColor: status === 'connected' ? "var(--primary)" : status === 'connecting' ? "#f59e0b" : "#ef4444",
                            scale: status === 'connected' ? [1, 1.2, 1] : 1
                        }}
                        transition={{ repeat: status === 'connected' ? Infinity : 0, duration: 2 }}
                        className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-[3px] border-card shadow-lg" 
                    />
                </div>
                <div>
                    <div className="flex items-center gap-2 sm:gap-3 mb-1">
                        <h2 className="font-extrabold text-lg sm:text-xl text-foreground tracking-tight leading-none">
                            {status === 'connecting' ? 'Initialising Link...' : (partnerIdentity?.name || 'Anonymous Stranger')}
                        </h2>
                        {partnerIdentity?.title && (
                            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-[9px] font-black uppercase tracking-[0.1em] text-primary border border-primary/20">
                                {partnerIdentity.title}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5",
                            status === 'connected' ? "text-primary" : "text-muted-foreground/60"
                        )}>
                            {status === 'connected' ? (
                                <>
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    Securely Connected
                                </>
                            ) : status === 'connecting' ? 'Establishing Tunnel...' : 'Session Ended'}
                        </div>
                        {status === 'connected' && (
                            <div className="flex items-center gap-1.5 text-muted-foreground/60 text-[10px] font-bold uppercase tracking-widest pl-4 border-l border-white/10">
                                <Clock className="w-3 h-3 text-primary/60" />
                                {formatTime(secondsConnected)}
                            </div>
                        )}
                    </div>
                </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-4">
                <Button variant="ghost" size="sm" onClick={onReport} className="text-muted-foreground/60 hover:text-destructive hover:bg-destructive/5 h-10 sm:h-12 px-3 sm:px-5 rounded-xl transition-all font-bold uppercase tracking-widest text-[9px] sm:text-[10px]">
                    <Flag className="w-4 h-4 sm:mr-2" />
                    <span className="hidden md:inline">Report</span>
                </Button>
                <Button 
                    onClick={handleSkip} 
                    disabled={status === 'connecting'}
                    className="bg-primary text-primary-foreground hover:opacity-90 h-10 sm:h-12 px-4 sm:px-8 font-black text-[10px] sm:text-xs uppercase tracking-[0.15em] rounded-xl shadow-[0_10px_20px_-5px_rgba(92,230,92,0.3)] transition-all active:scale-95 disabled:opacity-50"
                >
                    {status === 'connecting' ? <RefreshCw className="w-4 h-4 animate-spin sm:mr-2" /> : null}
                    {status === 'connecting' ? 'Syncing...' : 'Skip / Next'}
                </Button>
                </div>
            </div>

            {/* Info Bar: Sleek & Subtle */}
            <div className="px-4 sm:px-8 py-2 sm:py-3 bg-white/5 border-b border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-3 text-[10px] font-black text-primary/40 uppercase tracking-[0.2em]">
                        <Globe className="w-3.5 h-3.5" />
                        {partnerIdentity ? (
                            <motion.span 
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2"
                            >
                                <span className="text-foreground/80">{partnerIdentity.flag}</span>
                                <span className="text-foreground/80">{partnerIdentity.countryInitial} MATCH</span>
                                <span className="opacity-40">/</span>
                                <span className="text-primary/60">{mode.toUpperCase()} MODE</span>
                            </motion.span>
                        ) : (
                            <span>GLOBAL MATCH : {mode.toUpperCase()} MODE</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Identity Encrypted</span>
                    </div>
            </div>
          </>
        )}

        {/* Message Area */}
        <div 
            ref={scrollRef}
            className={cn(
                "flex-1 overflow-y-auto space-y-4 bg-background/50 scroll-smooth",
                variant === 'minimal' ? "p-4" : "px-6 py-8"
            )}
        >
            {status === 'connecting' ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                    <div className="w-16 h-16 rounded-full border-4 border-accent border-t-primary animate-spin" />
                    <div className="space-y-1">
                        <p className="font-bold text-lg">Finding your next conversation...</p>
                        <p className="text-sm text-muted-foreground">Pairing you with a verified stranger</p>
                    </div>
                </div>
            ) : status === 'disconnected' ? (
                <div className="flex flex-col items-center justify-center h-full gap-8 text-center animate-in fade-in zoom-in duration-700 p-8">
                    <div className="p-16 border border-white/5 rounded-[3rem] bg-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <X className="w-16 h-16 text-destructive/40 mx-auto mb-6 transition-transform group-hover:scale-110 group-hover:rotate-90 duration-500" />
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter text-foreground mb-3">Link <span className="text-destructive">Terminated</span></h3>
                        <p className="text-muted-foreground/60 max-w-xs mx-auto text-sm font-medium leading-relaxed">The peer has disconnected from the secure tunnel. Your session has safely expired.</p>
                        <Button 
                            onClick={handleSkip}
                            className="mt-10 bg-primary text-primary-foreground font-black uppercase tracking-widest px-12 h-16 rounded-2xl shadow-[0_20px_40px_-10px_rgba(92,230,92,0.4)] transition-all hover:scale-105 active:scale-95"
                        >
                            Establish New Link
                        </Button>
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
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex justify-start items-center gap-2 text-muted-foreground ml-2"
                        >
                            <div className="flex gap-1">
                                <motion.div animate={{ opacity:[0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                                <motion.div animate={{ opacity:[0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                                <motion.div animate={{ opacity:[0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider">Stranger is typing...</span>
                        </motion.div>
                    )}
                </>
            )}
        </div>

        {/* Input Area: Floating Bar Design */}
        {status === 'connected' && (
            <div className="p-4 sm:p-8 border-t border-white/5 bg-gradient-to-b from-transparent to-white/5 pb-8 sm:pb-8">
                <div className="max-w-4xl mx-auto flex items-center gap-3 sm:gap-4 relative">
                    <div className="relative pb-1">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className={cn(
                                "text-muted-foreground/60 rounded-2xl h-12 w-12 sm:h-14 sm:w-14 hover:bg-white/10 flex-shrink-0 transition-all duration-300", 
                                showEmojiPicker && "text-primary bg-primary/10 border border-primary/20 rotate-12"
                            )}
                        >
                            <Smile className="w-6 h-6 sm:w-7 sm:h-7" />
                        </Button>
                        <AnimatePresence>
                            {showEmojiPicker && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.9, x: -20 }}
                                    animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.9, x: -20 }}
                                    className="absolute bottom-20 left-0 z-50 p-4 bg-card/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] grid grid-cols-6 gap-3 w-72"
                                >
                                    {COMMON_EMOJIS.map(emoji => (
                                        <motion.button 
                                            key={emoji} 
                                            whileHover={{ scale: 1.2, rotate: 5 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => addEmoji(emoji)} 
                                            className="text-2xl hover:bg-white/10 rounded-xl p-2 transition-colors"
                                        >
                                            {emoji}
                                        </motion.button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    
                    <div className="flex-1 relative group">
                        <textarea
                            ref={inputRef as any}
                            rows={1}
                            value={inputText}
                            onChange={(e) => {
                                handleInputChange(e as any);
                                // Auto-resize height
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                    (e.target as any).style.height = 'auto';
                                }
                            }}
                            placeholder="Type a message..."
                            className="w-full bg-white/5 border border-white/10 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium transition-all outline-none text-foreground placeholder:text-muted-foreground/20 disabled:opacity-50 resize-none min-h-[48px] sm:min-h-[56px] max-h-32 scrollbar-none"
                        />
                        <div className="absolute inset-0 rounded-2xl pointer-events-none border border-primary/0 group-focus-within:border-primary/20 transition-all duration-500" />
                    </div>

                    <div className="flex items-center gap-3 pb-1">
                        {variant === 'full' && (
                            <Button 
                                onClick={async () => {
                                    setIsGeneratingIcebreaker(true);
                                    await generateIcebreaker(roomId);
                                    setIsGeneratingIcebreaker(false);
                                }}
                                disabled={isGeneratingIcebreaker}
                                variant="outline"
                                className="hidden sm:flex items-center gap-2.5 rounded-2xl px-6 h-14 border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-primary/30 transition-all group"
                            >
                                {isGeneratingIcebreaker ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Zap className="w-4 h-4 text-primary group-hover:fill-primary/20" />}
                                <span>Icebreaker</span>
                            </Button>
                        )}
                        <motion.div
                            animate={inputText.trim() ? { scale: [1, 1.05, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <Button
                                onClick={handleSend}
                                disabled={!inputText.trim()}
                                className={cn(
                                    "bg-primary text-primary-foreground hover:opacity-95 rounded-2xl shadow-[0_10px_20px_-5px_rgba(92,230,92,0.3)] transition-all active:scale-90 flex items-center justify-center shrink-0 disabled:opacity-30 disabled:shadow-none",
                                    variant === 'minimal' ? "w-12 h-12" : "w-14 h-14"
                                )}
                            >
                                <Send className={cn("rotate-45 -translate-y-0.5 -translate-x-0.5 transition-transform", inputText.trim() && "scale-110", variant === 'minimal' ? "w-5 h-5" : "w-6 h-6")} />
                            </Button>
                        </motion.div>
                    </div>
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
