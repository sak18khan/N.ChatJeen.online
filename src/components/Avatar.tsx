'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { User, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  userId: string;
  isSpeaking?: boolean;
  isTyping?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  name?: string;
  level?: number;
  reputationTag?: string | null;
  badges?: string[];
  xpGained?: boolean; // Trigger pulse
}

const COLORS = [
  'bg-yellow-400', 'bg-rose-500', 'bg-blue-500', 'bg-emerald-500', 
  'bg-violet-500', 'bg-orange-500', 'bg-cyan-400', 'bg-fuchsia-500'
];

export default function Avatar({ 
  userId, 
  isSpeaking, 
  isTyping, 
  size = 'md', 
  className,
  name,
  level = 1,
  reputationTag,
  badges = [],
  xpGained
}: AvatarProps) {
  const colorIndex = parseInt(userId.replace(/\D/g, '') || '0') % COLORS.length;
  const bgColor = COLORS[colorIndex];

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  return (
    <div className={cn("relative flex flex-col items-center gap-3", className)}>
      {/* Reputation Tag (Floating above) */}
      <AnimatePresence>
        {reputationTag && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-widest text-yellow-400 shadow-xl"
          >
            {reputationTag}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        {/* Speaking/XP Glow */}
        <AnimatePresence>
          {(isSpeaking || xpGained) && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 0.3 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className={cn(
                "absolute inset-0 rounded-full blur-xl",
                xpGained ? "bg-white" : "bg-yellow-400"
              )}
            />
          )}
        </AnimatePresence>

        {/* Level Badge */}
        <motion.div 
          className="absolute -top-1 -right-1 z-20 w-6 h-6 rounded-full bg-[#1A1A1A] border-2 border-[#111111] ring-2 ring-yellow-400/50 flex items-center justify-center text-[10px] font-black text-yellow-400 shadow-lg"
          whileHover={{ scale: 1.2 }}
        >
          {level}
        </motion.div>

        {/* Main Avatar Circle */}
        <motion.div
          animate={isSpeaking ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.5 }}
          className={cn(
            sizeClasses[size],
            "rounded-full p-1 border-2 transition-colors duration-500",
            isSpeaking ? "border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.4)]" : "border-white/10",
            bgColor
          )}
        >
          <div className="w-full h-full rounded-full bg-black/20 flex items-center justify-center text-white/90">
             <User className={cn(size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-8 h-8' : 'w-12 h-12')} />
          </div>
        </motion.div>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg border border-gray-200"
            >
              <div className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                    className="w-1 h-1 bg-gray-400 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Name Tag */}
      {name && (
        <div className="flex flex-col items-center gap-1">
          <span className="text-[11px] font-black text-white/90 uppercase tracking-widest bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/5">
            {name}
          </span>
          
          {/* Micro Badges */}
          {badges.length > 0 && (
            <div className="flex gap-1">
              {badges.map((badge, i) => (
                <div key={i} className="w-4 h-4 rounded-md bg-white/5 border border-white/10 flex items-center justify-center transition-transform hover:scale-125 cursor-help" title={badge}>
                   <Zap className="w-2.5 h-2.5 text-yellow-400" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
