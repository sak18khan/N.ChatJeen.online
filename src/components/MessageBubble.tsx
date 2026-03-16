'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
}

export default function MessageBubble({ message, isMe }: MessageBubbleProps) {
  const isSystem = message.sender_id === '00000000-0000-0000-0000-000000000000';

  if (isSystem) {
    return (
      <div className="flex justify-center w-full my-4">
        <div className="bg-muted px-4 py-1.5 rounded-full border border-border text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20 
      }}
      className={cn(
        "flex w-full mb-6",
        isMe ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "relative max-w-[85%] sm:max-w-[75%] px-5 py-3.5 rounded-2xl shadow-xl transition-all duration-300",
          isMe 
            ? "bg-gradient-to-br from-primary/90 to-primary text-primary-foreground rounded-tr-none shadow-primary/10" 
            : "bg-card/40 backdrop-blur-xl border border-border/50 text-foreground rounded-tl-none ring-1 ring-white/5 shadow-black/5"
        )}
      >
        <p className="whitespace-pre-wrap break-words leading-relaxed font-medium text-[15px] sm:text-base">
          {message.content}
        </p>
        
        <div className={cn(
          "mt-1.5 text-[10px] font-bold uppercase tracking-widest opacity-40 flex items-center gap-1.5",
          isMe ? "justify-end" : "justify-start"
        )}>
          <span>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {isMe && <div className="w-1 h-1 rounded-full bg-primary-foreground/40" />}
        </div>
      </div>
    </motion.div>
  );
}
