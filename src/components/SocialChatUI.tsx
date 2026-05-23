'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, ArrowLeft, Smile, Zap, Flame, Trophy, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LiveTableUI from './LiveTableUI';
import MessageBubble from './MessageBubble';
import { cn } from '@/lib/utils';
import { rtdb } from '@/lib/firebaseClient';
import { ref, onValue, push, set, remove, get, update, off, onChildAdded } from 'firebase/database';
import { generateAlias, SessionStats, calculateLevel, getXPForAction, checkForBadges, getReputationTag } from '@/lib/session';

interface Message {
  id: string;
  social_room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_name?: string;
}

interface UserState {
  id: string;
  name: string;
  isTyping: boolean;
  isSpeaking: boolean;
  lastActive: number;
  xp: number;
  karma: number;
  level: number;
  badges: string[];
  reputationTag: string | null;
}

interface SocialChatUIProps {
  roomId: string;
  userId: string;
}

export default function SocialChatUI({ roomId, userId }: SocialChatUIProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [members, setMembers] = useState<UserState[]>([]);
  const [roomTopic, setRoomTopic] = useState('Social Room');
  const [isTyping, setIsTyping] = useState(false);
  const [xpGained, setXpGained] = useState(false);
  const [myStats, setMyStats] = useState<SessionStats>({
    xp: 0,
    karma: 0,
    level: 1,
    alias: '',
    variant: 0,
    startTime: Date.now(),
    messageCount: 0,
    reactionCount: 0,
    badges: []
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Identity
  useEffect(() => {
    const savedAlias = localStorage.getItem(`chatjeen_alias_${userId}`) || generateAlias();
    localStorage.setItem(`chatjeen_alias_${userId}`, savedAlias);
    setMyStats(prev => ({ ...prev, alias: savedAlias }));
  }, [userId]);

  // Firebase Realtime Subscriptions & Occupant Presence
  useEffect(() => {
    if (!myStats.alias) return;

    // 1. Fetch Room Info
    const roomRef = ref(rtdb, `social_rooms/${roomId}`);
    get(roomRef).then((snap) => {
      if (snap.exists()) {
        setRoomTopic(snap.val().topic || 'Social Room');
      }
    });

    // 2. Register occupant
    const myOccupantRef = ref(rtdb, `social_rooms/${roomId}/occupants/${userId}`);
    const updateMyOccupancy = () => {
      set(myOccupantRef, {
        id: userId,
        name: myStats.alias,
        isTyping,
        isSpeaking: false,
        lastActive: Date.now(),
        xp: myStats.xp,
        level: myStats.level,
        karma: myStats.karma,
        badges: myStats.badges,
        reputationTag: getReputationTag(myStats)
      });
    };
    updateMyOccupancy();

    // Heartbeat update every 10s
    const heartbeat = setInterval(() => {
      update(myOccupantRef, { lastActive: Date.now() });
    }, 10000);

    // 3. Listen to occupants
    const occupantsRef = ref(rtdb, `social_rooms/${roomId}/occupants`);
    const unsubscribeOccupants = onValue(occupantsRef, (snapshot) => {
      if (snapshot.exists()) {
        const occupants = snapshot.val() as Record<string, any>;
        const now = Date.now();
        // Filter out stale users who haven't pinged in 30 seconds
        const activeUsers = Object.values(occupants)
          .filter(u => now - (u.lastActive || 0) < 30000)
          .map(u => ({
            id: u.id,
            name: u.name || 'Anonymous',
            isTyping: u.isTyping || false,
            isSpeaking: u.isSpeaking || false,
            lastActive: u.lastActive || now,
            xp: u.xp || 0,
            level: u.level || 1,
            karma: u.karma || 0,
            badges: u.badges || [],
            reputationTag: u.reputationTag || null
          }));
        setMembers(activeUsers);
      } else {
        setMembers([]);
      }
    });

    // 4. Listen to messages
    const messagesRef = ref(rtdb, `social_rooms/${roomId}/messages`);
    const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const msgs = snapshot.val() as Record<string, any>;
        const sortedMsgs = Object.values(msgs).sort((a, b) => Number(a.created_at) - Number(b.created_at));
        setMessages(sortedMsgs as Message[]);
      } else {
        setMessages([]);
      }
    });

    // 5. Listen to floating reactions
    const reactionsRef = ref(rtdb, `social_rooms/${roomId}/reactions`);
    const joinTime = Date.now();
    const unsubscribeReactions = onChildAdded(reactionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const reaction = snapshot.val();
        // Only trigger if reaction is new (after joining)
        if (reaction.timestamp > joinTime) {
          handleReceivedReaction(reaction);
        }
      }
    });

    return () => {
      clearInterval(heartbeat);
      unsubscribeOccupants();
      unsubscribeMessages();
      unsubscribeReactions();
      remove(myOccupantRef); // Remove our seat
    };
  }, [roomId, userId, myStats.alias, myStats.xp, myStats.level, myStats.karma, myStats.badges]);

  // Sync typing status to Firebase
  useEffect(() => {
    if (!myStats.alias) return;
    const myOccupantRef = ref(rtdb, `social_rooms/${roomId}/occupants/${userId}`);
    update(myOccupantRef, { isTyping });
  }, [isTyping, roomId, userId, myStats.alias]);

  // XP Gains & Level Up Logic
  const addXP = (amount: number) => {
    setMyStats(prev => {
      const newXP = prev.xp + amount;
      const { level: newLevel } = calculateLevel(newXP);
      const newBadges = checkForBadges({ ...prev, xp: newXP, level: newLevel });
      
      const updatedStats = { 
        ...prev, 
        xp: newXP, 
        level: newLevel,
        badges: Array.from(new Set([...prev.badges, ...newBadges]))
      };

      return updatedStats;
    });

    setXpGained(true);
    setTimeout(() => setXpGained(false), 1000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const messagesRef = ref(rtdb, `social_rooms/${roomId}/messages`);
      const newMsgRef = push(messagesRef);
      await set(newMsgRef, {
        id: newMsgRef.key,
        social_room_id: roomId,
        sender_id: userId,
        sender_name: myStats.alias,
        content: newMessage.trim(),
        created_at: Date.now()
      });

      setNewMessage('');
      setMyStats(prev => ({ ...prev, messageCount: prev.messageCount + 1 }));
      addXP(getXPForAction('message'));
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleReceivedReaction = (payload: any) => {
    // If the reaction targets us, we get karma/XP
    if (payload.targetUserId === userId) {
      setMyStats(prev => ({ ...prev, karma: prev.karma + 1, reactionCount: prev.reactionCount + 1 }));
      addXP(getXPForAction('reaction'));
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Energy Calculation (Based on recent message frequency)
  const roomEnergy = useMemo(() => {
    const now = Date.now();
    const recentMessages = messages.filter(m => {
      const age = now - Number(m.created_at);
      return age < 60000; // last minute
    });
    if (recentMessages.length > 15) return '🔥 High';
    if (recentMessages.length > 5) return '🟡 Medium';
    return '🔵 Low';
  }, [messages]);

  // Leaderboard Calculation
  const leaderboard = useMemo(() => {
    return [...members].sort((a, b) => b.xp - a.xp).slice(0, 3);
  }, [members]);

  const handleEmojiReact = async (targetUserId: string, emoji: string) => {
    try {
      const reactionsRef = ref(rtdb, `social_rooms/${roomId}/reactions`);
      const newReactionRef = push(reactionsRef);
      await set(newReactionRef, {
        id: newReactionRef.key,
        senderId: userId,
        targetUserId,
        emoji,
        timestamp: Date.now()
      });

      // If we reacted, we get a small amount of XP for engaging
      addXP(5);
    } catch (err) {
      console.error('Failed to react:', err);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-black text-white overflow-hidden font-sans selection:bg-yellow-400/30">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-black/50 backdrop-blur-md border-b border-white/5 relative z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/')}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black italic tracking-tighter uppercase">{roomTopic}</h1>
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
                    <Users className="w-3 h-3" /> {members.length} SEATED
                </div>
                <div className={cn(
                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 border",
                    roomEnergy.includes('High') ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-blue-500/10 text-white/40 border-white/10"
                )}>
                    {roomEnergy} ENERGY
                </div>
            </div>
          </div>
        </div>

        {/* My Quick Stats Bubble */}
        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-2">
            <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Your Persistence</span>
                <span className="text-xs font-black text-yellow-400">{myStats.xp} XP • Lvl {myStats.level}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-black">
                <Trophy className="w-4 h-4" />
            </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-gradient-radial from-yellow-400/[0.02] to-transparent">
        
        {/* Left Stats/Leaderboard (Desktop Only) */}
        <div className="hidden lg:flex w-64 flex-col gap-6 p-6 border-r border-white/5">
            <section className="space-y-4">
                <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" /> Room Leaders
                </h3>
                <div className="space-y-3">
                    {leaderboard.map((m, i) => (
                        <div key={m.id} className="flex items-center gap-3 group">
                            <div className={cn(
                                "w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black",
                                i === 0 ? "bg-yellow-400 text-black" : "bg-white/5 text-white/40"
                            )}>
                                {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-white truncate">{m.name}</div>
                                <div className="text-[9px] font-bold text-white/20">Lv. {m.level} • {m.xp} XP</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>

        {/* Center Table Area */}
        <div className="flex-1 relative flex flex-col border-r border-white/5">
          <div className="flex-1 relative min-h-[300px]">
            <LiveTableUI 
                members={members} 
                maxCapacity={12} 
                myId={userId}
                onEmojiReact={handleEmojiReact}
                xpGained={xpGained}
            />
          </div>

          {/* Social Notification Area */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
             <AnimatePresence>
                {xpGained && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-yellow-400 text-black px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl"
                    >
                        +XP Gained!
                    </motion.div>
                )}
             </AnimatePresence>
          </div>
        </div>

        {/* Right Chat Sidebar */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col bg-black/40 backdrop-blur-xl">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pt-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-white/20 gap-4 opacity-50">
                <Smile className="w-12 h-12" />
                <p className="text-xs font-black uppercase tracking-widest">Break the silence...</p>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble 
                  key={msg.id} 
                  message={msg} 
                  isMe={msg.sender_id === userId} 
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-black border-t border-white/5">
            <form onSubmit={handleSendMessage} className="relative group">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  if (!isTyping) {
                    setIsTyping(true);
                  }
                  
                  if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                  typingTimeoutRef.current = setTimeout(() => {
                    setIsTyping(false);
                  }, 2000);
                }}
                placeholder="Share a thought..."
                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-4 text-sm focus:outline-none focus:border-yellow-400/50 transition-all placeholder:text-white/20 group-hover:bg-white/10"
              />
              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className="absolute right-2 top-2 p-2.5 bg-yellow-400 text-black rounded-2xl hover:bg-yellow-300 disabled:opacity-50 disabled:hover:bg-yellow-400 transition-all active:scale-90"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
