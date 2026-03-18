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
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 30,
        mass: 0.8
      }}
      className={cn(
        "flex w-full px-4 mb-2",
        isMe ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] px-4 py-2.5 rounded-[1.25rem] text-[15px] leading-snug shadow-sm transition-all duration-300",
          isMe 
            ? "bg-yellow-400 text-black font-semibold rounded-br-[0.25rem] shadow-[0_4px_15px_rgba(250,204,21,0.2)]" 
            : "bg-white/10 backdrop-blur-md text-white/90 rounded-bl-[0.25rem] border border-white/10",
          message.content.startsWith('[IMAGE]') && "p-1 bg-transparent !shadow-none !backdrop-blur-none !border-none"
        )}
      >
        {message.content.startsWith('[IMAGE]') ? (
          <img 
            src={message.content.replace('[IMAGE]', '')} 
            alt="Shared image" 
            className="max-h-[300px] max-w-full rounded-xl object-contain shadow-lg"
          />
        ) : (
          <p className="whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}
      </div>
    </motion.div>
  );
}
