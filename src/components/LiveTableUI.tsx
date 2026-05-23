'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from './Avatar';
import { cn } from '@/lib/utils';
import { UserPlus, Heart, Flame, Smile, ThumbsUp, PartyPopper } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  isSpeaking?: boolean;
  isTyping?: boolean;
  variant?: number;
  level?: number;
  reputationTag?: string | null;
  badges?: string[];
  xpGained?: boolean;
}

interface LiveTableUIProps {
  members: Member[];
  myId: string;
  maxCapacity?: number;
  className?: string;
  onEmojiReact?: (targetUserId: string, emoji: string) => void;
  xpGained?: boolean;
}

interface FloatingEmoji {
  id: string;
  userId: string;
  emoji: string;
  xOffset: number;
}

const EMOJIS = ['👍', '🔥', '❤️', '😂', '🎉'];

export default function LiveTableUI({ 
  members, 
  myId, 
  maxCapacity = 12, 
  className,
  onEmojiReact,
  xpGained 
}: LiveTableUIProps) {
  const slots = Array.from({ length: maxCapacity });
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);

  // Trigger floating emoji when onEmojiReact is called locally
  const handleEmojiClick = (targetUserId: string, emoji: string) => {
    if (onEmojiReact) {
      onEmojiReact(targetUserId, emoji);
    }
    // Add local float effect immediately
    addFloatingEmoji(targetUserId, emoji);
    setSelectedMemberId(null);
  };

  const addFloatingEmoji = (targetUserId: string, emoji: string) => {
    const newEmoji: FloatingEmoji = {
      id: `emoji-${Date.now()}-${Math.random()}`,
      userId: targetUserId,
      emoji,
      xOffset: (Math.random() - 0.5) * 30 // Random horizontal jitter
    };
    setFloatingEmojis(prev => [...prev, newEmoji]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== newEmoji.id));
    }, 2000);
  };

  return (
    <div className={cn("relative w-full aspect-square max-w-[500px] mx-auto flex items-center justify-center", className)}>
      {/* The Table */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="absolute w-[60%] h-[60%] rounded-full bg-white/5 border border-white/10 shadow-[0_0_50px_rgba(250,204,21,0.05)] flex items-center justify-center z-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-50" />
        <div className="text-white/10 font-black italic text-4xl uppercase tracking-widest select-none">
          Chat<span className="text-yellow-400/10 not-italic">Jeen</span>
        </div>
      </motion.div>

      {/* Avatars */}
      <div className="absolute inset-0 z-10">
        <AnimatePresence>
          {slots.map((_, index) => {
            const angle = (index * 360) / maxCapacity;
            const radius = 42; // percentage from center
            const x = 50 + radius * Math.cos((angle - 90) * (Math.PI / 180));
            const y = 50 + radius * Math.sin((angle - 90) * (Math.PI / 180));

            const member = members[index];

            return (
              <motion.div
                key={member ? member.id : `seat-${index}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                style={{ 
                  left: `${x}%`, 
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)' 
                }}
                className="absolute"
              >
                {member ? (
                  <div className="relative group">
                    {/* Clickable Avatar Wrapper */}
                    <div 
                      onClick={() => member.id !== myId && setSelectedMemberId(selectedMemberId === member.id ? null : member.id)}
                      className={cn(
                        "cursor-pointer transition-transform hover:scale-105 active:scale-95",
                        selectedMemberId === member.id && "ring-2 ring-yellow-400 rounded-full"
                      )}
                    >
                      <Avatar 
                        userId={member.id}
                        name={member.name}
                        isSpeaking={member.isSpeaking}
                        isTyping={member.isTyping}
                        level={member.level || 1}
                        reputationTag={member.reputationTag}
                        badges={member.badges || []}
                        xpGained={member.xpGained || (member.id === myId && xpGained)}
                      />
                    </div>

                    {/* Floating Reaction Emojis for this User */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none z-30">
                      {floatingEmojis.filter(fe => fe.userId === member.id).map(fe => (
                        <motion.div
                          key={fe.id}
                          initial={{ y: 0, opacity: 1, scale: 0.8, x: fe.xOffset }}
                          animate={{ y: -80, opacity: 0, scale: 1.4 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="absolute text-3xl select-none"
                        >
                          {fe.emoji}
                        </motion.div>
                      ))}
                    </div>

                    {/* Emoji Reaction Picker Popover */}
                    <AnimatePresence>
                      {selectedMemberId === member.id && (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0, y: 10 }}
                          animate={{ scale: 1, opacity: 1, y: 0 }}
                          exit={{ scale: 0.8, opacity: 0, y: 10 }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-black/90 backdrop-blur-md border border-white/20 rounded-full py-1.5 px-3 flex gap-2 shadow-2xl z-50 whitespace-nowrap"
                        >
                          {EMOJIS.map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => handleEmojiClick(member.id, emoji)}
                              className="text-xl hover:scale-130 active:scale-90 transition-transform duration-150"
                            >
                              {emoji}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center text-white/10 hover:border-white/20 hover:text-white/20 transition-colors group cursor-pointer">
                     <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
