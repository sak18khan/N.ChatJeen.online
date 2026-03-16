'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Mic, ShieldCheck, Zap, Laptop, Heart, Target, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabaseClient';
import { findMatch, ChatMode } from '@/lib/matching';
import TestimonialCard from '@/components/TestimonialCard';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const [isMatching, setIsMatching] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [matchingMode, setMatchingMode] = useState<ChatMode | null>(null);
  const router = useRouter();

  const handleStart = async (mode: ChatMode) => {

    router.push(`/matching?mode=${mode}`);
  };

  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden selection:bg-primary/30">
      {/* GLOBAL DYNAMIC BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] animate-pulse [animation-delay:2s]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        {/* Subtle Grid System */}
        <div className="absolute inset-0" 
             style={{ 
               backgroundImage: `radial-gradient(circle at 1px 1px, rgba(92, 230, 92, 0.05) 1px, transparent 0)`,
               backgroundSize: '40px 40px' 
             }} 
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center gap-24 px-6 py-12 md:py-24">
        
        {/* PREMIUM HERO SECTION */}
        <header className="w-full flex flex-col items-center text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="group relative inline-flex items-center gap-2.5 px-5 py-2 bg-accent/40 backdrop-blur-md text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-primary/20 shadow-xl"
          >
            <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <div className="absolute inset-0 rounded-full bg-primary/10 blur-md group-hover:bg-primary/20 transition-all" />
            <span className="relative">10,482 Active Strangers Online</span>
          </motion.div>
          
          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.85] text-foreground"
            >
              Chat<span className="text-primary not-italic drop-shadow-[0_0_25px_rgba(92,230,92,0.4)]">Jeen</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed"
            >
              The world's most <span className="text-foreground">secure and anonymous chat experiment</span>. Connect, speak, and evolve without masks.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-6 pt-4"
          >
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/70">
              <ShieldCheck className="w-4 h-4" />
              <span>Full End-to-End Anonymity</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/70">
              <Zap className="w-4 h-4" />
              <span>No Registration Required</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/70">
              <Target className="w-4 h-4" />
              <span>Smart Interest Matching</span>
            </div>
          </motion.div>
        </header>

        {/* MODE SELECTION: THE TUNNELS */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {[
            { 
              mode: 'text' as const, 
              icon: MessageCircle, 
              label: 'Tunnel: Text', 
              desc: 'Secure, real-time messaging with like-minded strangers.',
              stats: 'Avg. Match: 2s',
              color: 'primary'
            },
            { 
              mode: 'voice' as const, 
              icon: Mic, 
              label: 'Tunnel: Voice', 
              desc: 'High-fidelity encrypted calls. Connect with humanity.',
              stats: 'Avg. Match: 5s',
              color: 'primary'
            },
          ].map((item, idx) => (
            <motion.button
              key={item.mode}
              initial={{ opacity: 0, x: idx === 0 ? -40 : 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + (idx * 0.2), type: "spring", stiffness: 100 }}
              onClick={() => handleStart(item.mode)}
              className="group relative flex flex-col items-start text-left p-6 md:p-12 bg-card/40 backdrop-blur-xl border border-border rounded-[2.5rem] md:rounded-[3rem] overflow-hidden transition-all hover:border-primary/50 hover:shadow-[0_0_50px_rgba(92,230,92,0.15)] active:scale-[0.98]"
            >
              {/* Background Glow Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-primary/5 rounded-full blur-[80px] group-hover:bg-primary/10 transition-colors" />

              <div className="relative z-10 w-full flex justify-between items-start mb-12">
                <div className="w-20 h-20 rounded-2xl bg-accent flex items-center justify-center text-primary transition-transform group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(92,230,92,0.3)]">
                  <item.icon className="w-10 h-10" />
                </div>
                <div className="px-3 py-1 bg-primary/10 rounded-lg text-[9px] font-black text-primary uppercase tracking-widest border border-primary/20">
                  {item.stats}
                </div>
              </div>

              <div className="relative z-10 space-y-4">
                <h3 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-foreground group-hover:text-primary transition-colors">
                  {item.label}
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed font-medium max-w-xs">
                  {item.desc}
                </p>
                
                <div className="pt-6 flex items-center gap-3 text-primary font-black text-xs uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100 transition-opacity">
                  Initiate Link <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>

              {/* Decorative lightstreak */}
              <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent transform translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
            </motion.button>
          ))}
        </div>

        {/* HOW IT WORKS: THE PATH */}
        <section className="w-full space-y-20 pt-12">
            <header className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                    Protocol <span className="text-primary not-italic">Workflow</span>
                </h2>
                <p className="text-muted-foreground text-lg font-medium">Three phases to establish a secure link.</p>
            </header>

            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24">
                {/* Visual Connector Path */}
                <div className="hidden md:block absolute top-[4.5rem] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-border to-transparent z-0 overflow-hidden">
                    <motion.div 
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="w-1/2 h-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" 
                    />
                </div>
                
                {[
                    { step: "01", title: "Select Interface", desc: "Choose your preferred tunnel: Text-only for focus, or Voice for fidelity.", icon: Zap },
                    { step: "02", title: "Global Sync", desc: "Our engine scans the network for the most compatible stranger.", icon: Laptop },
                    { step: "03", title: "Establish Link", desc: "Encrypted handshake completes and your session begins instantly.", icon: Heart }
                ].map((item, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.2 }}
                        className="relative z-10 flex flex-col items-center text-center space-y-6 group"
                    >
                        <div className="relative w-24 h-24 rounded-3xl bg-card border-2 border-border flex items-center justify-center text-primary group-hover:border-primary/50 group-hover:shadow-[0_0_30px_rgba(92,230,92,0.2)] transition-all duration-500 overflow-hidden">
                            <div className="absolute inset-0 bg-primary/5 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full" />
                            <span className="relative text-3xl font-black italic">{item.step}</span>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-2xl font-black uppercase tracking-tight italic text-foreground">{item.title}</h3>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-[200px] mx-auto opacity-70 group-hover:opacity-100 transition-opacity">
                                {item.desc}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>

        {/* THE FEATURE GRID: CORE MODULES */}
        <section className="w-full space-y-16 pt-12">
            <header className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                    Core <span className="text-primary not-italic">Modules</span>
                </h2>
                <p className="text-muted-foreground text-lg font-medium">Standard features built for absolute privacy.</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                    { title: "Stateless Link", desc: "No databases, no logs. Each session is unique and disappears forever when you leave.", icon: Zap },
                    { title: "Deep Privacy", desc: "We don't just hide your name; we protect your digital footprint from end to end.", icon: ShieldCheck },
                    { title: "Smart Matching", desc: "Advanced algorithmic pairing that prioritizes quality over quantity.", icon: Target },
                    { title: "Instant Reset", desc: "Not liking the connection? One click resets the link and finds your next match.", icon: Mic }, 
                    { title: "Premium Stack", desc: "Built with Next.js and Supabase for real-time, low-latency performance.", icon: Laptop },
                    { title: "Always Free", desc: "No subscriptions or hidden fees. Premium social networking belongs to everyone, for free.", icon: Zap }
                ].map((feature, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="p-10 bg-card/50 backdrop-blur-sm border border-border rounded-[2.5rem] hover:border-primary/30 hover:bg-card transition-all group overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/10 transition-colors" />
                        <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(92,230,92,0.2)] transition-all">
                            <feature.icon className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-extrabold mb-4 uppercase tracking-tighter italic text-foreground">{feature.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed font-semibold opacity-80">{feature.desc}</p>
                    </motion.div>
                ))}
            </div>
        </section>

        {/* TESTIMONIALS: REPUTATION */}
        <section className="w-full space-y-20 pb-12">
            <header className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                    Stranger <span className="text-primary not-italic">Feedback</span>
                </h2>
                <p className="text-muted-foreground text-lg font-medium">Validating the anonymous experience.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { author: "E. Mitchell", role: "Verified Ghost", content: "The level of engineering and privacy focus here is unparalleled. A breath of fresh air in anonymous social circles.", rating: 5 },
                    { author: "S. Chen", role: "Digital Nomad", content: "Beautiful interface, seamless experience. The anonymity actually leads to more meaningful deep-dives.", rating: 5 },
                    { author: "M. Rossi", role: "Network Entity", content: "Low latency, high quality. The voice tunnel is impeccably built. Finally, a platform that respects the user.", rating: 5 },
                ].map((testimonial, i) => (
                    <TestimonialCard 
                        key={i}
                        {...testimonial}
                        delay={i * 0.1}
                    />
                ))}
            </div>
        </section>

        {/* PREMIUM FOOTER */}
        <footer className="w-full pt-16 border-t border-border mt-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-24 mb-16">
                <div className="space-y-6 col-span-1 md:col-span-2">
                    <h3 className="text-4xl font-black uppercase italic tracking-tighter text-foreground">Chat<span className="text-primary not-italic">Jeen</span></h3>
                    <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-sm">
                        Reimagining human connection for the digital age. Secure, anonymous, and forever free.
                    </p>
                </div>
                
                <div className="space-y-8">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Platform</h4>
                    <div className="flex flex-col gap-4 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                        <Link href="/features" className="hover:text-primary transition-colors">Core Features</Link>
                        <Link href="/comparison/omegle-alternative" className="hover:text-primary transition-colors">The Alternative</Link>
                        <Link href="/safety" className="hover:text-primary transition-colors">Safety Center</Link>
                    </div>
                </div>

                <div className="space-y-8">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Compliance</h4>
                    <div className="flex flex-col gap-4 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                        <Link href="/guidelines" className="hover:text-primary transition-colors">Guidelines</Link>
                        <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-primary transition-colors">Terms of Use</Link>
                    </div>
                </div>
            </div>
            
            <div className="py-12 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.4em] opacity-40">
                    © 2026 CHATJEEN PROTOCOL. UNIT-01.
                </div>
                <div className="flex items-center gap-8 text-[10px] text-primary/40 font-black uppercase tracking-[0.2em]">
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" /> Network: Stable</span>
                    <span>Global Nodes: Active</span>
                </div>
            </div>
        </footer>
      </div>
    </main>
  );
}
