'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, PhoneOff, Volume2, Info, ShieldCheck, Clock, ArrowRight, Flag } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { UserIdentity } from '@/lib/identity';

interface VoiceControlsProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onEnd: () => void;
  onSkip: () => void;
  onReport: () => void;
  remoteStream: MediaStream | null;
  partnerIdentity: UserIdentity | null;
  status: 'connecting' | 'connected' | 'disconnected';
}

function AudioVisualizer({ stream }: { stream: MediaStream | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!stream || !canvasRef.current) return;

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let animationId: number;

    const draw = () => {
      if (!ctx) return;
      animationId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = `rgba(92, 230, 92, ${0.2 + (dataArray[i]/255)})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      audioCtx.close();
    };
  }, [stream]);

  return <canvas ref={canvasRef} className="w-full h-12 opacity-50" width={200} height={50} />;
}

export default function VoiceControls({ 
  isMuted, 
  onToggleMute, 
  onEnd, 
  onSkip,
  onReport,
  remoteStream, 
  partnerIdentity,
  status 
}: VoiceControlsProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (audioRef.current && remoteStream) {
      audioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (status === 'connected') {
      const interval = setInterval(() => setSeconds((s: number) => s + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8 sm:p-12 bg-card/80 backdrop-blur-2xl border border-border rounded-[2.5rem] shadow-2xl max-w-xl w-full mx-auto relative overflow-hidden transition-all">
      <audio ref={audioRef} autoPlay />
      
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl animate-pulse" />

      {/* HEADER: Partner Info & Timer */}
      <div className="w-full flex items-center justify-between px-2 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-primary text-xl border border-primary/10">
            {partnerIdentity?.flag || '🌐'}
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground leading-tight">
              {partnerIdentity?.name || 'Searching...'}
            </h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">
              {status === 'connected' ? 'Secure Link Active' : 'Establishing...'}
            </p>
          </div>
        </div>
        
        {status === 'connected' && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold font-mono border border-primary/20 transition-all scale-110">
            <Clock className="w-3.5 h-3.5" />
            {formatTime(seconds)}
          </div>
        )}
      </div>

      {/* Visual Indicator Area */}
      <div className="relative group cursor-pointer">
        <div className={cn(
            "w-48 h-48 rounded-full bg-accent/50 flex flex-col items-center justify-center transition-all duration-700 relative z-10",
            !isMuted && status === 'connected' && "ring-[10px] ring-primary/20 ring-offset-[12px] ring-offset-background shadow-[0_0_60px_rgba(92,230,92,0.15)]"
        )}>
          <Volume2 className={cn("w-20 h-20 text-primary transition-all duration-500", (isMuted || status !== 'connected') && "opacity-20 scale-90")} />
          
          <div className="absolute bottom-6 w-full px-8">
            <AudioVisualizer stream={remoteStream} />
          </div>
        </div>
        
        {status === 'connected' && !isMuted && (
          <motion.div 
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 rounded-full border-[6px] border-primary/30 z-0"
          />
        )}
      </div>

      <div className="text-center space-y-4 w-full">
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">
              {isMuted ? "Signal Muted" : status === 'connected' ? "Voice Channel 01" : "Syncing..."}
          </h2>
          <div className="h-1 w-12 bg-primary/20 rounded-full" />
        </div>
      </div>

      <div className="flex items-center gap-4 z-10 w-full">
        <Button
          onClick={onToggleMute}
          variant="outline"
          className={cn(
            "flex-1 h-16 rounded-2xl border-border transition-all active:scale-95 flex flex-col gap-1 items-center justify-center",
            isMuted ? "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive" : "hover:bg-accent/50 hover:text-primary"
          )}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          <span className="text-[9px] font-black uppercase tracking-widest">{isMuted ? 'Unmute' : 'Mute'}</span>
        </Button>

        <Button
            onClick={onSkip}
            className="flex-[2] h-16 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:opacity-90 active:scale-95 flex items-center justify-center gap-2 group"
        >
            Next Stranger <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>

        <Button
          onClick={onEnd}
          variant="ghost"
          className="w-16 h-16 rounded-2xl border border-destructive/20 text-destructive hover:bg-destructive hover:text-white transition-all active:scale-95 flex items-center justify-center"
        >
          <PhoneOff className="w-6 h-6" />
        </Button>
      </div>

      {/* Security Footer */}
      <div className="flex items-center justify-between w-full pt-4 border-t border-border/50">
        <div className="flex items-center gap-2 text-muted-foreground font-bold text-[9px] uppercase tracking-widest bg-muted/30 px-3 py-1.5 rounded-lg border border-border">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>Encrypted Tunnel</span>
        </div>
        
        <Button variant="ghost" size="icon" onClick={onReport} className="w-8 h-8 text-muted-foreground hover:text-destructive">
          <Flag className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
