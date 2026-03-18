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
        // Create a premium gradient for the visualizer
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, 'rgba(92, 230, 92, 0.2)');
        gradient.addColorStop(1, 'rgba(92, 230, 92, 1)');
        
        ctx.fillStyle = gradient;
        // Round top corners slightly by faking it or just use rectangles
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
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
      // Explicitly call play to handle strict browser autoplay policies (e.g. Safari iOS)
      audioRef.current.play().catch(e => console.warn('Autoplay prevented by browser:', e));
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center justify-center gap-8 p-8 sm:p-12 bg-[#0A0A0A]/90 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-xl w-full mx-auto relative overflow-hidden transition-all"
    >
      <audio ref={audioRef} autoPlay playsInline />
      
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full -ml-32 -mb-32 blur-3xl animate-pulse" />

      {/* HEADER: Partner Info & Timer */}
      <div className="w-full flex items-center justify-between px-2 mb-2 z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-primary text-2xl border border-white/10 shadow-inner">
            {partnerIdentity?.flag || '🌐'}
          </div>
          <div className="flex flex-col">
            <h3 className="font-bold text-base text-white tracking-wide">
              {partnerIdentity?.name || 'Searching Network...'}
            </h3>
            <p className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em]",
                status === 'disconnected' ? "text-red-500" : "text-primary/80"
            )}>
              {status === 'disconnected' ? 'Connection Lost' : status === 'connected' ? 'Secure Link Active' : 'Establishing...'}
            </p>
          </div>
        </div>
        
        <AnimatePresence>
          {status === 'connected' && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold font-mono border border-primary/20 shadow-[0_0_15px_rgba(92,230,92,0.1)]"
            >
              <Clock className="w-4 h-4" />
              {formatTime(seconds)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Visual Indicator Area */}
      <div className="relative group cursor-pointer my-4">
        <motion.div 
            animate={status === 'connected' && !isMuted ? { scale: [1, 1.05, 1] } : { scale: 1 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className={cn(
                "w-56 h-56 rounded-full bg-[#111] flex flex-col items-center justify-center transition-all duration-700 relative z-10 border border-white/5",
                !isMuted && status === 'connected' && "ring-[4px] ring-primary/30 ring-offset-[8px] ring-offset-[#0A0A0A] shadow-[0_0_80px_rgba(92,230,92,0.15)]",
                status === 'disconnected' && "ring-[4px] ring-red-500/30 ring-offset-[8px] ring-offset-[#0A0A0A] shadow-[0_0_80px_rgba(239,68,68,0.15)]"
            )}
        >
          {status === 'disconnected' ? (
              <PhoneOff className="w-20 h-20 text-red-500 transition-all duration-700 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
          ) : (
              <Volume2 className={cn("w-20 h-20 text-primary transition-all duration-700 drop-shadow-[0_0_15px_rgba(92,230,92,0.5)]", (isMuted || status !== 'connected') && "opacity-20 scale-75 drop-shadow-none")} />
          )}
          
          <div className="absolute bottom-8 w-full px-10">
            <AudioVisualizer stream={remoteStream} />
          </div>
        </motion.div>
        
        {status === 'connected' && !isMuted && (
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full border-2 border-primary/40 z-0"
          />
        )}
      </div>

      <div className="text-center space-y-3 w-full z-10">
        <div className="flex flex-col items-center gap-2">
          <motion.h2 
            animate={status !== 'connected' && status !== 'disconnected' ? { opacity: [0.4, 1, 0.4] } : { opacity: 1 }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={cn(
                "text-2xl font-black uppercase italic tracking-tighter",
                status === 'disconnected' ? "text-red-500" : "text-white"
            )}
          >
              {status === 'disconnected' ? "Partner Left" : isMuted ? "Signal Muted" : status === 'connected' ? "Voice Channel 01" : "Syncing Node..."}
          </motion.h2>
          <div className={cn(
              "h-1 w-16 rounded-full",
              status === 'disconnected' ? "bg-gradient-to-r from-transparent via-red-500/50 to-transparent" : "bg-gradient-to-r from-transparent via-primary/50 to-transparent"
          )} />
        </div>
      </div>

      <div className="flex items-center gap-4 z-10 w-full mt-4">
        <Button
          onClick={onToggleMute}
          variant="outline"
          className={cn(
            "flex-1 h-16 rounded-2xl border-white/10 transition-all active:scale-95 flex flex-col gap-1 items-center justify-center bg-white/5",
            isMuted ? "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20" : "hover:bg-white/10 text-white/70 hover:text-white"
          )}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          <span className="text-[9px] font-black uppercase tracking-widest">{isMuted ? 'Unmute' : 'Mute'}</span>
        </Button>

        <Button
            onClick={onSkip}
            className="flex-[2] h-16 rounded-2xl bg-primary hover:bg-primary/90 text-black font-black text-sm uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(92,230,92,0.3)] hover:shadow-[0_0_30px_rgba(92,230,92,0.5)] active:scale-95 flex items-center justify-center gap-3 group transition-all"
        >
            Next Stranger 
            <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <ArrowRight className="w-5 h-5" />
            </motion.div>
        </Button>

        <Button
          onClick={onEnd}
          variant="ghost"
          className="w-16 h-16 rounded-2xl border border-white/5 bg-white/5 text-white/50 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:scale-95 flex items-center justify-center"
        >
          <PhoneOff className="w-6 h-6" />
        </Button>
      </div>

      {/* Security Footer */}
      <div className="flex items-center justify-between w-full pt-6 border-t border-white/5 mt-2 z-10">
        <div className="flex items-center gap-2 text-white/40 font-bold text-[9px] uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>Encrypted Tunnel Active</span>
        </div>
        
        <Button variant="ghost" size="icon" onClick={onReport} className="w-8 h-8 text-white/30 hover:text-red-500 bg-white/5 border border-white/5 hover:bg-red-500/10">
          <Flag className="w-3.5 h-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}
