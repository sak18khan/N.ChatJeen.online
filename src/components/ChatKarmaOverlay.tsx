'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ThumbsUp, ThumbsDown, Star, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { supabase } from '@/lib/supabaseClient';

interface ChatKarmaOverlayProps {
  partnerId: string;
  onClose: () => void;
  onNext: () => void;
}

export default function ChatKarmaOverlay({ partnerId, onClose, onNext }: ChatKarmaOverlayProps) {
  const [voted, setVoted] = useState<'up' | 'down' | null>(null);

  const handleVote = async (type: 'up' | 'down') => {
    setVoted(type);
    
    // Increment/Decrement Karma in users_stats
    const amount = type === 'up' ? 1 : -1;
    
    // We update the partner's stats
    const { error } = await supabase.rpc('increment_karma', { 
        user_id_param: partnerId, 
        amount_param: amount 
    });

    if (error) {
        // Fallback if RPC isn't available: direct update
        // Note: In a production app, this should be a protected server-side increment
        const { data: currentStats } = await supabase
            .from('users_stats')
            .select('karma')
            .eq('id', partnerId)
            .maybeSingle();
        
        await supabase
            .from('users_stats')
            .upsert({ 
                id: partnerId, 
                karma: (currentStats?.karma || 0) + amount,
                last_active: new Date().toISOString()
            });
    }

    // Auto-proceed after a delay if upvoted
    if (type === 'up') {
        setTimeout(onNext, 1500);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-card/90 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 max-w-md w-full shadow-[0_32px_80px_rgba(0,0,0,0.5)] text-center relative overflow-hidden"
      >
        {/* Premium Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/10 rounded-full blur-[80px]" />
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-muted-foreground/40 hover:text-foreground transition-all h-10 w-10 flex items-center justify-center hover:bg-white/5 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10 space-y-8">
          <div className="space-y-3">
             <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 mb-4">
                <Sparkles className="w-6 h-6" />
             </div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Was this a <span className="text-primary not-italic">Vibe?</span></h2>
            <p className="text-sm text-muted-foreground/60 font-medium max-w-[200px] mx-auto leading-relaxed">Rate the stranger to build their algorithmic reputation.</p>
          </div>

          <div className="flex justify-center gap-8 py-6">
            <AnimatePresence mode="wait">
              {!voted ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: -5, y: -5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleVote('down')}
                    className="w-24 h-24 rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-2 text-muted-foreground/40 hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-all group shadow-xl"
                  >
                    <ThumbsDown className="w-8 h-8 group-hover:fill-destructive/10" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Nah</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 5, y: -5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleVote('up')}
                    className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center gap-2 text-primary hover:bg-primary/20 transition-all group shadow-[0_15px_30px_rgba(92,230,92,0.15)]"
                  >
                    <ThumbsUp className="w-8 h-8 group-hover:fill-primary/10" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Elite</span>
                  </motion.button>
                </>
              ) : voted === 'up' ? (
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-[0_20px_50px_rgba(92,230,92,0.5)]">
                    <Sparkles className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-primary font-black uppercase tracking-[0.2em] text-xs">Vibe Endorsed</p>
                    <p className="text-[10px] text-muted-foreground font-bold italic tracking-wider">Algorithmic Match Boosted</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="w-24 h-24 rounded-full bg-destructive/20 border border-destructive/30 flex items-center justify-center text-destructive">
                    <X className="w-10 h-10" />
                  </div>
                  <p className="text-destructive font-black uppercase tracking-[0.2em] text-xs">Vibe Rejected</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pt-6 flex flex-col gap-4">
             <Button 
                onClick={onNext}
                className="w-full bg-primary text-primary-foreground font-black uppercase tracking-widest h-14 rounded-2xl shadow-[0_15px_30px_-5px_rgba(92,230,92,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
             >
                Initiate New Link
             </Button>
             <button 
                onClick={onClose}
                className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] hover:text-foreground transition-colors group flex items-center justify-center gap-2"
              >
                Return to Dashboard
                <div className="w-4 h-[1px] bg-muted-foreground/20 group-hover:bg-foreground/40 transition-all" />
              </button>
          </div>
        </div>

        {/* Floating background elements */}
        {voted === 'up' && (
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ y: 100, x: Math.random() * 300 - 150, opacity: 0 }}
                        animate={{ y: -200, opacity: [0, 1, 0] }}
                        transition={{ duration: 1.5, delay: i * 0.1, repeat: Infinity }}
                        className="absolute bottom-0 text-primary"
                    >
                        <Star className="w-4 h-4 fill-current" />
                    </motion.div>
                ))}
            </div>
        )}
      </motion.div>
    </motion.div>
  );
}
