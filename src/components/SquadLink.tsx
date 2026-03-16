'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, Check, Users, Gift, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

export default function SquadLink({ userId }: { userId: string }) {
  const [copied, setCopied] = useState(false);
  const squadLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/join/${userId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(squadLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 rounded-3xl p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-24 h-24 rotate-12" />
        </div>

        <div className="relative z-10 space-y-6">
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Viral Loops</span>
                </div>
                <h3 className="text-3xl font-black uppercase italic tracking-tight leading-none">
                    Build Your <span className="text-primary not-italic">Squad</span>
                </h3>
                <p className="text-sm text-muted-foreground font-medium max-w-xs">
                    Share your unique link. When friends join, you both get <span className="text-primary font-bold">+50 ChatKarma</span> and unlock exclusive 2D skins.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 bg-background/50 border border-border rounded-xl px-4 py-3 font-mono text-xs flex items-center justify-between group/link cursor-pointer hover:bg-background transition-colors" onClick={copyToClipboard}>
                    <span className="truncate opacity-60 italic">{squadLink}</span>
                    {copied ? <Check className="w-4 h-4 text-primary shrink-0" /> : <Copy className="w-4 h-4 text-muted-foreground shrink-0 group-hover/link:text-primary transition-colors" />}
                </div>
                <Button 
                    onClick={copyToClipboard}
                    className="bg-primary text-primary-foreground font-black uppercase tracking-widest px-8 h-12 rounded-xl shadow-[0_0_20px_rgba(92,230,92,0.2)] hover:shadow-[0_0_30px_rgba(92,230,92,0.4)] transition-all"
                >
                    {copied ? 'Copied!' : 'Copy Link'}
                </Button>
            </div>

            <div className="flex items-center gap-4 pt-2">
                <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-bold">
                            {['A','J','K','L'][i-1]}
                        </div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-card bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-black">
                        +12
                    </div>
                </div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    12 Friends Joined via Squad Links
                </p>
            </div>
        </div>
    </div>
  );
}
