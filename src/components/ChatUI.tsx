'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Info, X, Zap, Loader2, Flag, Sparkles, Clock, Globe, ShieldCheck, RefreshCw, Trophy, UserCircle, Image, Lock, Palette } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { generateIcebreaker } from '@/lib/groq';
import Toast from './Toast';
import { updatePing } from '@/lib/matching';
import { detectIdentity, UserIdentity } from '@/lib/identity';
import ChatKarmaOverlay from './ChatKarmaOverlay';
import Link from 'next/link';
import { rtdb } from '@/lib/firebaseClient';
import { ref, onValue, push, set, update, off, remove, get } from 'firebase/database';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: number;
}

interface ChatUIProps {
  roomId: string;
  myId: string;
  onSkip: () => void;
  onReport: () => void;
  mode: 'text';
  variant?: 'full' | 'minimal';
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

const COMMON_EMOJIS = ["😊", "😂", "🥰", "😎", "🤔", "🙌", "✨", "🔥", "❤️", "👍", "👋", "🎉", "🤣", "🥺", "💀", "👀", "💯", "😭"];

const THEMES = [
  { id: 'gold', name: 'Neon Gold 💛', class: 'bg-yellow-400 text-black', text: 'text-yellow-400' },
  { id: 'purple', name: 'Cosmic Purple 💜', class: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white', text: 'text-violet-400' },
  { id: 'blue', name: 'Arctic Blue 💙', class: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white', text: 'text-cyan-400' },
  { id: 'rose', name: 'Sunset Rose 💖', class: 'bg-gradient-to-r from-rose-500 to-orange-500 text-white', text: 'text-rose-400' }
];

export default function ChatUI({ roomId, myId, onSkip, onReport, mode, variant = 'full' }: ChatUIProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [lastMessageSent, setLastMessageSent] = useState(0);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [isGeneratingIcebreaker, setIsGeneratingIcebreaker] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>('connected');
  const [secondsConnected, setSecondsConnected] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('gold');
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  
  // Q&A / Debate matching context
  const [matchQuestion, setMatchQuestion] = useState<string | null>(null);
  const [myAnswer, setMyAnswer] = useState<string | null>(null);
  const [partnerAnswer, setPartnerAnswer] = useState<string | null>(null);
  const [debateTopic, setDebateTopic] = useState<string | null>(null);
  const [myStance, setMyStance] = useState<string | null>(null);
  const [partnerStance, setPartnerStance] = useState<string | null>(null);

  // Gamification states
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [activeEffect, setActiveEffect] = useState<'confetti' | 'sparks' | null>(null);
  
  const [myIdentity, setMyIdentity] = useState<UserIdentity | null>(null);
  const [partnerIdentity, setPartnerIdentity] = useState<UserIdentity | null>(null);
  const [showKarma, setShowKarma] = useState(false);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate Level and Progress
  useEffect(() => {
    // Load persisted XP
    const savedXp = Number(localStorage.getItem('chatjeen_xp') || '0');
    setXp(savedXp);
  }, []);

  useEffect(() => {
    // Level brackets: Lvl 1 (0 XP), Lvl 2 (100 XP), Lvl 3 (250 XP), Lvl 4 (500 XP), Lvl 5 (1000 XP)
    let currentLvl = 1;
    if (xp >= 1000) currentLvl = 5;
    else if (xp >= 500) currentLvl = 4;
    else if (xp >= 250) currentLvl = 3;
    else if (xp >= 100) currentLvl = 2;
    
    if (currentLvl !== level && level > 1) {
      setToast({ message: `🎉 LEVEL UP! You reached Level ${currentLvl}!`, type: 'success' });
    }
    setLevel(currentLvl);
    localStorage.setItem('chatjeen_xp', String(xp));
  }, [xp, level]);

  const addXp = (amount: number) => {
    setXp(prev => prev + amount);
  };

  // --- IMAGE UPLOAD LOGIC ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (level < 3) {
      setToast({ message: 'Lock: Unlock image sharing at Level 3 by chatting!', type: 'info' });
      return;
    }

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
        const img = new window.Image();
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

            // Send via Firebase
            const messagesRef = ref(rtdb, `rooms/${roomId}/messages`);
            const newMsgRef = push(messagesRef);
            await set(newMsgRef, {
              id: newMsgRef.key,
              sender_id: myId,
              content: `[IMAGE]${resizedBase64}`,
              created_at: Date.now()
            });

            addXp(15); // Bonus XP for sharing photos

            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        img.src = base64Str;
    };
    reader.readAsDataURL(file);
  };

  // --- TIMER & PASSIVE XP LOGIC ---
  useEffect(() => {
    let timerInterval: NodeJS.Timeout;
    if (status === 'connected') {
      timerInterval = setInterval(() => {
        setSecondsConnected(prev => {
          const next = prev + 1;
          // Give 5 XP every 15 seconds
          if (next % 15 === 0) {
            addXp(5);
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [status]);
  
  // --- HEARTBEAT & ACTIVE PRESENCE LOGIC ---
  useEffect(() => {
    let heartbeatInterval: NodeJS.Timeout;
    if (status === 'connected' && myId) {
      // Mark active at room creation
      set(ref(rtdb, `rooms/${roomId}/active/${myId}`), Date.now());

      heartbeatInterval = setInterval(() => {
        updatePing(myId);
        set(ref(rtdb, `rooms/${roomId}/active/${myId}`), Date.now());
      }, 5000);
    }
    return () => clearInterval(heartbeatInterval);
  }, [status, myId, roomId]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // --- TYPING INDICATOR SENDING ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    
    // Broadcast typing status via Firebase RTDB
    set(ref(rtdb, `rooms/${roomId}/typing/${myId}`), true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      set(ref(rtdb, `rooms/${roomId}/typing/${myId}`), false);
    }, 2000);
  };
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- SYNC SKIP LOGIC ---
  const handleSkip = async () => {
    if (!showKarma && partnerId && (secondsConnected > 15 || messages.length > 5)) {
        setShowKarma(true);
        return; 
    }

    // Write skip action
    await set(ref(rtdb, `rooms/${roomId}/actions/${myId}/skip`), true);
    
    // Cleanup room
    remove(ref(rtdb, `rooms/${roomId}`));
    window.location.href = `/matching?mode=${mode}`;
  };

  // --- TRIGGER FULLSCREEN SCREEN EFFECTS ---
  const triggerScreenEffect = async (effect: 'confetti' | 'sparks') => {
    if (level < 5) {
      setToast({ message: 'Effects are unlocked at Level 5!', type: 'info' });
      return;
    }
    // Set locally and sync to Firebase for partner
    await set(ref(rtdb, `rooms/${roomId}/actions/${myId}/effect`), {
      type: effect,
      timestamp: Date.now()
    });
    // Trigger locally
    playScreenEffect(effect);
  };

  const playScreenEffect = (effect: 'confetti' | 'sparks') => {
    setActiveEffect(effect);
    setTimeout(() => setActiveEffect(null), 3000);
  };

  // --- EMOJI PICKER LOGIC ---
  const addEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  // --- MAIN SUBSCRIPTION LOGIC ---
  useEffect(() => {
    let unsubscribeMessages: () => void;
    let unsubscribeActive: () => void;
    let unsubscribeTyping: () => void;
    let unsubscribeActions: () => void;

    const setupRoom = async (retries = 3) => {
      const roomRef = ref(rtdb, `rooms/${roomId}`);
      const snap = await get(roomRef);
      if (!snap.exists()) {
        if (retries > 0) {
          setTimeout(() => setupRoom(retries - 1), 500);
          return;
        }
        setStatus('disconnected');
        return;
      }

      const roomData = snap.val();
      const pId = roomData.user1 === myId ? roomData.user2 : roomData.user1;
      setPartnerId(pId);

      // Load matching contexts
      if (roomData.vibe === 'Debate' && roomData.debate) {
        setDebateTopic(roomData.debate.topic);
        setMyStance(roomData.debate.stances[myId]);
        setPartnerStance(roomData.debate.stances[pId]);
      } else if (roomData.answers) {
        const myAns = roomData.answers[myId];
        const partnerAns = roomData.answers[pId];
        if (myAns) {
          setMatchQuestion(myAns.question);
          setMyAnswer(myAns.answer);
        }
        if (partnerAns) {
          setPartnerAnswer(partnerAns.answer);
        }
      }

      // Load initial partner identity
      const partnerIdent = await detectIdentity(pId);
      setPartnerIdentity(partnerIdent);

      // Subscribe to messages
      const msgsRef = ref(rtdb, `rooms/${roomId}/messages`);
      unsubscribeMessages = onValue(msgsRef, (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const sorted = Object.values(val).sort((a: any, b: any) => a.created_at - b.created_at) as Message[];
          setMessages(sorted);
        } else {
          setMessages([]);
        }
      });

      // Subscribe to typing indicators
      const typingRef = ref(rtdb, `rooms/${roomId}/typing/${pId}`);
      unsubscribeTyping = onValue(typingRef, (snapshot) => {
        if (snapshot.exists()) {
          setIsOtherTyping(snapshot.val() === true);
        } else {
          setIsOtherTyping(false);
        }
      });

      // Subscribe to active/heartbeat indicator to detect partner disconnects
      const partnerActiveRef = ref(rtdb, `rooms/${roomId}/active/${pId}`);
      unsubscribeActive = onValue(partnerActiveRef, (snapshot) => {
        if (snapshot.exists()) {
          // Reset disconnect timer on activity
          resetDisconnectTimer();
        }
      });

      // Subscribe to actions (skips, screen effects)
      const actionsRef = ref(rtdb, `rooms/${roomId}/actions/${pId}`);
      unsubscribeActions = onValue(actionsRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (data.skip === true) {
            setStatus('disconnected');
            if (secondsConnected > 15 || messages.length > 5) {
              setShowKarma(true);
            }
          }
          if (data.effect && Date.now() - data.effect.timestamp < 3000) {
            playScreenEffect(data.effect.type);
          }
        }
      });
    };

    setupRoom();

    let disconnectTimer: NodeJS.Timeout;
    const resetDisconnectTimer = () => {
      if (disconnectTimer) clearTimeout(disconnectTimer);
      disconnectTimer = setTimeout(() => {
        console.log("Partner inactive for 15s. Disconnecting.");
        setStatus('disconnected');
        if (secondsConnected > 15 || messages.length > 5) {
          setShowKarma(true);
        }
      }, 15000);
    };

    return () => {
      if (unsubscribeMessages) unsubscribeMessages();
      if (unsubscribeTyping) unsubscribeTyping();
      if (unsubscribeActive) unsubscribeActive();
      if (unsubscribeActions) unsubscribeActions();
      if (disconnectTimer) clearTimeout(disconnectTimer);
    };
  }, [roomId, myId]);

  // --- IDENTITY DETECTION ---
  useEffect(() => {
    async function initIdentity() {
        const identity = await detectIdentity(myId);
        setMyIdentity(identity);
    }
    initIdentity();
  }, [myId]);

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
    
    // NSFW Censorship & Contact sharing block filters
    let content = inputText;
    
    // Bad word list
    const badWords = ['fuck', 'shit', 'bitch', 'asshole', 'nigger', 'faggot', 'horny', 'sex', 'sexting', 'nude'];
    badWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        content = content.replace(regex, '***');
    });

    // Contact details filter for Level < 3
    if (level < 3) {
      const contactPattern = /\b(snapchat|snap|insta|instagram|kik|telegram|whatsapp|phone|number|snap\?|insta\?)\b/gi;
      const handlePattern = /@\w+/g;
      
      if (contactPattern.test(inputText) || handlePattern.test(inputText)) {
        setToast({ 
          message: "🔒 Contact sharing is locked until Level 3 to prevent immediate spam/sexting!", 
          type: 'error' 
        });
        return;
      }
    }

    setInputText('');
    
    // Sync typing to false
    set(ref(rtdb, `rooms/${roomId}/typing/${myId}`), false);

    const messagesRef = ref(rtdb, `rooms/${roomId}/messages`);
    const newMsgRef = push(messagesRef);
    await set(newMsgRef, {
      id: newMsgRef.key,
      sender_id: myId,
      content: content,
      created_at: Date.now()
    });

    addXp(10); // Reward 10 XP for sending messages
  };

  const handleAiIcebreaker = async () => {
    if (level < 3) {
      setToast({ message: 'Unlock AI Icebreaker at Level 3!', type: 'info' });
      return;
    }
    setIsGeneratingIcebreaker(true);
    await generateIcebreaker(roomId);
    setIsGeneratingIcebreaker(false);
  };

  const handleReportClick = () => {
    setShowReportModal(true);
  };

  const submitReport = async () => {
    if (!selectedReportReason) return;
    
    // Close modal immediately
    setShowReportModal(false);
    
    setToast({ message: "Report submitted. Finding new chat...", type: 'success' });
    
    try {
      // 1. Post to REST API
      await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: selectedReportReason,
          sessionId: roomId,
          reporterId: myId,
          timestamp: Date.now()
        })
      });

      // 2. Perform direct database logging (same as existing mechanism)
      if (partnerId) {
        const reportsRef = ref(rtdb, `reports/${partnerId}`);
        const newReportRef = push(reportsRef);
        await set(newReportRef, {
          id: newReportRef.key,
          roomId,
          reason: selectedReportReason,
          timestamp: Date.now()
        });

        const countSnap = await get(ref(rtdb, `reports_count/${partnerId}`));
        const newCount = (countSnap.val() || 0) + 1;
        await set(ref(rtdb, `reports_count/${partnerId}`), newCount);

        if (newCount >= 3) {
          await set(ref(rtdb, `shadowbans/${partnerId}`), true);
        }
      }
    } catch (e) {
      console.error("Error submitting report:", e);
    }
    
    setSelectedReportReason('');
    
    // Skip to next partner immediately
    handleSkip();
  };

  return (
    <div className="flex flex-col w-full relative transition-all duration-300 h-screen h-[100dvh] max-w-4xl mx-auto my-0 bg-black overflow-hidden select-none">
      
      {/* SCREEN EFFECTS OVERLAY */}
      <AnimatePresence>
        {activeEffect === 'confetti' && (
          <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden bg-black/10">
            {Array.from({ length: 45 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  y: -50, 
                  x: Math.random() * window.innerWidth, 
                  rotate: 0,
                  scale: Math.random() * 0.6 + 0.6
                }}
                animate={{ 
                  y: window.innerHeight + 50,
                  x: `calc(${Math.random() * 100}% + ${Math.random() * 200 - 100}px)`,
                  rotate: 720
                }}
                transition={{ duration: Math.random() * 1.5 + 1.5, ease: 'linear' }}
                className={cn(
                  "absolute w-4 h-4 rounded-sm",
                  ['bg-red-500', 'bg-yellow-400', 'bg-blue-500', 'bg-green-500', 'bg-pink-500'][Math.floor(Math.random() * 5)]
                )}
              />
            ))}
          </div>
        )}
        {activeEffect === 'sparks' && (
          <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden bg-yellow-400/5">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  y: window.innerHeight / 2 + Math.random() * 100 - 50, 
                  x: window.innerWidth / 2 + Math.random() * 100 - 50, 
                  scale: 0.1,
                  opacity: 1
                }}
                animate={{ 
                  y: Math.random() * window.innerHeight,
                  x: Math.random() * window.innerWidth,
                  scale: Math.random() * 2 + 1,
                  opacity: 0
                }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="absolute w-2 h-2 rounded-full bg-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.8)]"
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* HEADER: LOGO & STATUS */}
      <header className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10 px-4 h-14 flex items-center justify-center shrink-0">
          <Link href="/" className="flex flex-col items-center hover:opacity-80 transition-opacity">
              <h1 className="text-base font-black italic tracking-tighter uppercase text-white">Chat<span className="text-yellow-400 not-italic">Jeen</span></h1>
              <span className="text-[10px] text-white/40 font-medium">www.chatjeen.online</span>
          </Link>
      </header>

      {/* GAMIFICATION LEVEL BAR */}
      <div className="bg-[#111] border-b border-white/5 px-4 py-2 flex items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">LEVEL {level}</span>
          <span className="text-[10px] text-yellow-400 font-bold">({xp} XP)</span>
        </div>
        <div className="flex-1 max-w-xs h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-yellow-400 transition-all duration-500 rounded-full" 
            style={{ width: `${Math.min(100, (xp / (level * 250)) * 100)}%` }}
          />
        </div>
        <span className="text-[9px] text-white/40 font-semibold">Unlock bubs at Level 2!</span>
      </div>

      <div className="flex-1 flex flex-col bg-black border-none overflow-hidden relative">
        
        {/* MATCH DETAILS OR CONTEXT CARD */}
        {variant === 'full' && status === 'connected' && (
          <div className="mx-4 mt-4 flex flex-col gap-2">
            {/* User details */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col gap-3 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-white/40 shrink-0">
                        <UserCircle className="w-8 h-8" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl leading-none">{partnerIdentity?.flag || '🌐'}</span>
                            <h2 className="font-bold text-base text-white truncate">
                              {partnerIdentity?.name || 'Anonymous'}
                              {level >= 4 && partnerIdentity?.title && (
                                <span className="ml-2 text-[9px] text-yellow-400 border border-yellow-400/30 rounded-full px-1.5 py-0.5 uppercase font-black tracking-widest">{partnerIdentity.title}</span>
                              )}
                            </h2>
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

            {/* Q&A / Debate context card */}
            {debateTopic ? (
              <div className="bg-[#FF4B4B]/10 border border-[#FF4B4B]/20 rounded-xl p-3 flex flex-col gap-1.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#FF4B4B]">Debate Mode</span>
                <p className="text-xs font-bold text-white leading-relaxed">Topic: {debateTopic}</p>
                <div className="flex items-center justify-between text-[10px] text-white/60 font-semibold border-t border-white/5 pt-1.5">
                  <span>You: <strong className="text-white">{myStance}</strong></span>
                  <span>Partner: <strong className="text-white">{partnerStance}</strong></span>
                </div>
              </div>
            ) : matchQuestion && (
              <div className="bg-yellow-400/5 border border-yellow-400/10 rounded-xl p-3 flex flex-col gap-1.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-yellow-400">Answer Revealed</span>
                <p className="text-xs font-semibold text-white/80">Question: "{matchQuestion}"</p>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-white/50 font-semibold border-t border-white/5 pt-1.5 gap-1.5">
                  <span>You answered: <strong className="text-yellow-400">"{myAnswer}"</strong></span>
                  <span>Partner answered: <strong className="text-yellow-400">"{partnerAnswer || 'Waiting...'}"</strong></span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CHAT BUBBLE STREAM */}
        <div 
            ref={scrollRef}
            className={cn(
                "flex-1 overflow-y-auto space-y-4 bg-black scroll-smooth scrollbar-none",
                variant === 'minimal' ? "p-4" : "px-4 py-4"
            )}
        >
            {status === 'disconnected' ? (
                <div className="flex flex-col items-center justify-start h-full pt-10 px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="w-full bg-[#111111] border border-white/5 rounded-2xl p-6 flex flex-col gap-4 text-left">
                         <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-[#FF4B4B]" />
                            <p className="text-sm font-medium text-white/80">Partner has left the chat.</p>
                         </div>
                         
                         <div className="flex items-center gap-6 mt-2 ml-5">
                            <button onClick={handleReportClick} className="text-xs font-bold text-white/30 hover:text-white/50 transition-colors uppercase tracking-wider underline">Report abuse</button>
                            <button className="text-xs font-bold text-white/30 hover:text-white/50 transition-colors uppercase tracking-wider underline">Feedback</button>
                         </div>
                    </div>
                    <div className="flex-1" />
                    <div className="w-full pb-10 flex flex-col items-center gap-4">
                        <button 
                            onClick={handleSkip}
                            className="w-full bg-[#FF4B4B] text-white font-black text-lg py-5 rounded-[1.5rem] shadow-[0_15px_30px_rgba(250,204,21,0.15)] active:scale-95 transition-all uppercase tracking-widest"
                        >
                            Restart
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                          <div 
                            key={msg.id}
                            className={cn(
                              "flex w-full mb-3",
                              msg.sender_id === myId ? "justify-end" : "justify-start"
                            )}
                          >
                            <div 
                              className={cn(
                                "max-w-[70%] px-4 py-3 rounded-[1.25rem] text-sm font-semibold select-text",
                                msg.sender_id === myId 
                                  ? cn(THEMES.find(t => t.id === selectedTheme)?.class, "rounded-tr-[0.25rem]") 
                                  : "bg-[#1A1A1A] text-white/90 border border-white/5 rounded-tl-[0.25rem]"
                              )}
                            >
                              {msg.content.startsWith('[IMAGE]') ? (
                                <img 
                                  src={msg.content.replace('[IMAGE]', '')} 
                                  alt="Shared photo" 
                                  className="rounded-lg max-h-[250px] object-cover pointer-events-auto"
                                />
                              ) : (
                                <span>{msg.content}</span>
                              )}
                            </div>
                          </div>
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

        {/* INPUT PANEL */}
        {status === 'connected' && (
            <div className="p-4 sm:p-6 bg-black/40 backdrop-blur-xl border-t border-white/10 pb-8 flex flex-col gap-3">
                
                {/* TOOLBAR: ICEBREAKERS & THEMES */}
                <div className="flex items-center gap-2 select-none">
                  {/* AI Icebreaker button */}
                  <button
                    disabled={level < 3 || isGeneratingIcebreaker}
                    onClick={handleAiIcebreaker}
                    className={cn(
                      "px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5",
                      level >= 3 
                        ? "bg-yellow-400/10 border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/20" 
                        : "bg-white/5 border-white/10 text-white/20 cursor-not-allowed"
                    )}
                  >
                    <Sparkles className="w-3 h-3" />
                    {isGeneratingIcebreaker ? 'Generating...' : level >= 3 ? 'AI Icebreaker' : 'AI Icebreaker (Lvl 3)'}
                  </button>

                  {/* Theme Selector */}
                  {level >= 2 ? (
                    <div className="relative">
                      <button
                        onClick={() => setShowThemePicker(!showThemePicker)}
                        className="p-1.5 rounded-full border bg-white/5 border-white/10 text-white/60 hover:bg-white/10 transition-colors"
                        title="Theme Bubble Gradient"
                      >
                        <Palette className="w-3.5 h-3.5" />
                      </button>
                      <AnimatePresence>
                        {showThemePicker && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                            className="absolute bottom-full left-0 mb-2 bg-[#111] border border-white/10 rounded-2xl p-3 shadow-2xl flex flex-col gap-2 z-50"
                          >
                            {THEMES.map(theme => (
                              <button
                                key={theme.id}
                                onClick={() => {
                                  setSelectedTheme(theme.id);
                                  setShowThemePicker(false);
                                }}
                                className={cn(
                                  "px-3 py-1.5 rounded-xl text-left text-xs font-bold transition-all",
                                  theme.class,
                                  selectedTheme === theme.id && "ring-2 ring-white"
                                )}
                              >
                                {theme.name}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <span className="text-[9px] text-white/20 font-bold uppercase tracking-wider">Themes unlock at Level 2</span>
                  )}

                  {/* Screen Effects Panel */}
                  {level >= 5 && (
                    <div className="flex gap-1.5 ml-auto">
                      <button 
                        onClick={() => triggerScreenEffect('confetti')}
                        className="px-2.5 py-1 rounded-full border bg-white/5 border-white/10 text-white/50 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
                      >
                        🎉 Confetti
                      </button>
                      <button 
                        onClick={() => triggerScreenEffect('sparks')}
                        className="px-2.5 py-1 rounded-full border bg-white/5 border-white/10 text-white/50 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
                      >
                        ✨ Sparks
                      </button>
                    </div>
                  )}
                </div>

                {/* TEXT INPUT ROW */}
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
                            ref={inputRef}
                            type="text"
                            value={inputText}
                            onChange={handleInputChange}
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

                        {/* Lock Overlay on Image share */}
                        <input 
                            type="file" 
                            accept="image/*" 
                            ref={fileInputRef} 
                            onChange={handleImageUpload} 
                            className="hidden" 
                        />
                        <button 
                            className="absolute right-4 z-10 text-white/20 hover:text-white/40 transition-colors flex items-center"
                            onClick={() => level >= 3 ? fileInputRef.current?.click() : setToast({ message: 'Unlock image sharing at Level 3!', type: 'info' })}
                        >
                            {level >= 3 ? <Image className="w-5 h-5" /> : <Lock className="w-4 h-4 text-white/10" />}
                        </button>
                    </div>

                    {/* SEND BUTTON */}
                    <button
                        onClick={handleSend}
                        disabled={!inputText.trim()}
                        className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 disabled:opacity-30",
                            inputText.trim() 
                              ? cn(THEMES.find(t => t.id === selectedTheme)?.class, "shadow-[0_0_15px_rgba(250,204,21,0.15)]") 
                              : "bg-[#1A1A1A] text-white/40"
                        )}
                    >
                        <Send className="w-5 h-5 translate-x-0.5 -translate-y-0.5 rotate-45" />
                    </button>
                </div>
            </div>
        )}
      </div>

      {status === 'connected' && (
        <button 
          onClick={handleReportClick}
          className="absolute bottom-[100px] right-4 z-40 bg-[#111]/80 hover:bg-black border border-white/10 hover:border-red-500/30 text-white/40 hover:text-red-500 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-all shadow-xl backdrop-blur-md"
        >
          <Flag className="w-3.5 h-3.5 fill-current/10" />
          <span>Report</span>
        </button>
      )}

      {showReportModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 select-none">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-[#111] border border-white/10 rounded-[2.5rem] p-6 shadow-2xl relative"
          >
            <h3 className="text-base font-black uppercase italic tracking-tight mb-4 text-white flex items-center gap-2">
              <Flag className="w-4 h-4 text-red-500" /> Report User
            </h3>
            <p className="text-white/40 text-[11px] font-medium mb-6">
              Select a reason for reporting this user. Spam or inappropriate behavior will result in a shadowban.
            </p>
            
            <div className="flex flex-col gap-2 mb-6">
              {['Spam', 'Inappropriate content', 'Harassment', 'Underage concern', 'Other'].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReportReason(reason)}
                  className={cn(
                    "w-full py-3 px-4 rounded-xl text-xs font-bold text-left border transition-colors",
                    selectedReportReason === reason
                      ? "bg-red-500/10 border-red-500 text-red-500"
                      : "bg-black/40 border-white/10 text-white/50 hover:bg-white/5"
                  )}
                >
                  {reason}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setSelectedReportReason('');
                }}
                className="py-3 rounded-full border border-white/10 text-white/60 text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!selectedReportReason}
                onClick={submitReport}
                className="py-3 rounded-full bg-red-500 hover:bg-red-400 disabled:opacity-40 disabled:hover:bg-red-500 text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/15"
              >
                Submit
              </button>
            </div>
          </motion.div>
        </div>
      )}

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
