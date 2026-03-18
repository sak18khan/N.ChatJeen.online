'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Mic, ShieldCheck, Zap, Laptop, Heart, Target, ArrowRight, Menu, Star, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabaseClient';
import { findMatch, ChatMode } from '@/lib/matching';
import TestimonialCard from '@/components/TestimonialCard';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const [matchingMode, setMatchingMode] = useState<ChatMode>('text');
  const router = useRouter();

  const handleStart = () => {
    router.push(`/matching?mode=${matchingMode}`);
  };

  return (
    <main className="min-h-screen bg-black text-white relative flex flex-col selection:bg-yellow-400/30">
      
      {/* 1. STICKY HEADER (MATCHING CHAT UI) */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5 px-4 h-14 flex items-center justify-center shrink-0">
          <Link href="/" className="flex flex-col items-center hover:opacity-80 transition-opacity">
              <h1 className="text-base font-black italic tracking-tighter uppercase text-white">Chat<span className="text-yellow-400 not-italic">Jeen</span></h1>
              <span className="text-[10px] text-white/40 font-medium">www.chatjeen.online</span>
          </Link>
      </header>

      {/* 2. FIRST FOLD: HERO SECTION (FULL HEIGHT) */}
      <section className="relative h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-yellow-400/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex flex-col items-center gap-10 w-full max-w-sm relative z-10">
          
          {/* Glowing Icon Hub */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative"
          >
            <div className="w-32 h-32 rounded-full bg-yellow-400/5 border border-yellow-400/10 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border border-yellow-400/20 animate-pulse scale-110" />
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-[0_0_30px_rgba(250,204,21,0.3)] flex items-center justify-center">
                <MessageCircle className="w-10 h-10 text-black fill-black/10" />
              </div>
            </div>
            {/* Tiny orbit dots */}
            <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-yellow-400/40 blur-[2px]" />
            <div className="absolute -bottom-4 -left-2 w-2 h-2 rounded-full bg-yellow-400/20" />
          </motion.div>

          {/* Core Branding */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            className="text-center space-y-4"
          >
            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic">Chatjeen</h2>
            <div className="flex items-center justify-center gap-2">
              <span className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em]">Meet New People</span>
              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            </div>
          </motion.div>

          {/* Status Indicator */}
          <div className="px-4 py-2 bg-[#111111] border border-white/5 rounded-full flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#5CE65C] shadow-[0_0_10px_rgba(92,230,92,0.5)]" />
            <span className="text-[11px] font-bold text-white/60">10,482 online now</span>
          </div>

          {/* Mode Selection */}
          <div className="w-full flex p-1.5 bg-[#111111] rounded-2xl border border-white/5">
            <button 
              onClick={() => setMatchingMode('text')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl transition-all duration-300",
                matchingMode === 'text' ? "bg-yellow-400 text-black font-black" : "text-white/40 font-bold hover:text-white/60"
              )}
            >
              <MessageCircle className={cn("w-4 h-4", matchingMode === 'text' && "fill-black/10")} />
              <span className="text-sm">Text</span>
            </button>
            <button 
              onClick={() => setMatchingMode('voice')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl transition-all duration-300",
                matchingMode === 'voice' ? "bg-yellow-400 text-black font-black" : "text-white/40 font-bold hover:text-white/60"
              )}
            >
              <Mic className={cn("w-4 h-4", matchingMode === 'voice' && "fill-black/10")} />
              <span className="text-sm">Audio</span>
            </button>
          </div>

          {/* Start CTA */}
          <button 
            onClick={handleStart}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black text-lg py-5 rounded-[1.5rem] shadow-[0_15px_30px_rgba(250,204,21,0.2)] active:scale-95 transition-all uppercase tracking-widest mt-4"
          >
            Start Chatting
          </button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <span className="text-[9px] font-black uppercase tracking-widest">Scroll to Learn More</span>
          <div className="w-[1px] h-6 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* 3. CONTENT BELOW THE FOLD */}
      <div className="bg-black relative z-10 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-24 px-6 py-24">
          
          {/* HOW IT WORKS: THE PATH */}
          <section className="w-full space-y-20">
              <header className="text-center space-y-4">
                  <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                      How It <span className="text-yellow-400 not-italic">Works</span>
                  </h2>
                  <p className="text-white/40 text-lg font-medium">Three simple steps to start chatting safely.</p>
              </header>

              <div className="relative grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24">
                  {[
                      { step: "01", title: "Choose Your Mode", desc: "Select text for quiet messaging or audio for a more personal connection.", icon: Zap },
                      { step: "02", title: "Instant Match", desc: "Our smart algorithm instantly connects you with someone new.", icon: Laptop },
                      { step: "03", title: "Start Chatting", desc: "Your private, secure session begins immediately. Have fun!", icon: Heart }
                  ].map((item, i) => (
                      <motion.div 
                          key={i}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.2 }}
                          className="relative z-10 flex flex-col items-center text-center space-y-6 group"
                      >
                          <div className="relative w-24 h-24 rounded-3xl bg-[#111111] border-2 border-white/5 flex items-center justify-center text-yellow-400 group-hover:border-yellow-400/20 group-hover:shadow-[0_0_30px_rgba(250,204,21,0.1)] transition-all duration-500 overflow-hidden">
                              <span className="relative text-3xl font-black italic">{item.step}</span>
                          </div>
                          <div className="space-y-3">
                              <h3 className="text-2xl font-black uppercase tracking-tight italic text-white">{item.title}</h3>
                              <p className="text-sm text-white/40 font-medium leading-relaxed max-w-[200px] mx-auto opacity-70 group-hover:opacity-100 transition-opacity">
                                  {item.desc}
                              </p>
                          </div>
                      </motion.div>
                  ))}
              </div>
          </section>

          {/* THE FEATURE GRID: CORE MODULES */}
          <section className="w-full space-y-16">
              <header className="text-center space-y-4">
                  <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                      Why Choose <span className="text-yellow-400 not-italic">ChatJeen?</span>
                  </h2>
                  <p className="text-white/40 text-lg font-medium">Everything you need for a safe and fun experience.</p>
              </header>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[
                      { title: "100% Private", desc: "We don't store your chats. Every session is unique and disappears when you leave.", icon: Zap },
                      { title: "Stay Anonymous", desc: "Your identity is hidden, ensuring a secure and pressure-free environment to chat.", icon: ShieldCheck },
                      { title: "Instantly Connect", desc: "No waiting around. We instantly pair you with someone eager to talk.", icon: Target },
                      { title: "Total Control", desc: "Not feeling the vibe? A single click skips to a brand new conversation.", icon: Mic }, 
                      { title: "Lightning Fast", desc: "Enjoy smooth, lag-free text and high-quality voice calls seamlessly.", icon: Laptop },
                      { title: "Always Free", desc: "No hidden fees, ever. Connect with the world without spending a dime.", icon: Zap }
                  ].map((feature, i) => (
                      <motion.div 
                          key={i}
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                          className="p-10 bg-[#111111] border border-white/5 rounded-[2.5rem] hover:border-yellow-400/20 transition-all group overflow-hidden relative"
                      >
                          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-yellow-400 mb-8 transition-all">
                              <feature.icon className="w-7 h-7" />
                          </div>
                          <h3 className="text-xl font-extrabold mb-4 uppercase tracking-tighter italic text-white">{feature.title}</h3>
                          <p className="text-white/40 text-sm leading-relaxed font-semibold opacity-80">{feature.desc}</p>
                      </motion.div>
                  ))}
              </div>
          </section>

          {/* TESTIMONIALS: REPUTATION */}
          <section className="w-full space-y-16 flex flex-col items-center">
              {/* Top Badge */}
              <div className="flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/5 bg-[#111111] text-sm font-medium">
                  <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                      <span className="text-white font-bold text-[13px] uppercase tracking-widest">Live Feedback</span>
                  </span>
                  <div className="w-[1px] h-3.5 bg-white/20 mx-1" />
                  <span className="text-white/40 text-[13px] font-bold">From Real Users</span>
              </div>

              <header className="text-center space-y-6 max-w-2xl px-4">
                  <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white uppercase leading-none">
                      Real <span className="text-yellow-400 not-italic">Connections</span>
                      <br />
                      <span className="text-white">Real Stories</span>
                  </h2>
                  <p className="text-white/40 text-[15px] font-medium leading-relaxed max-w-xl mx-auto">
                      Hear from thousands of users who have found meaningful conversations and genuine interactions on ChatJeen every day.
                  </p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto pt-4">
                  {[
                      { 
                          author: "Alex", 
                          age: 24, 
                          avatarColor: "#eab308",
                          content: "I've tried numerous random chat sites, but this one is by far the cleanest. The text matches are instant, and the community feels incredibly safe." 
                      },
                      { 
                          author: "Sarah", 
                          age: 21, 
                          avatarColor: "#ec4899",
                          content: "The anonymous audio mode is exactly what I needed. It's so refreshing to just hop on and have a real conversation without any pressure." 
                      },
                      { 
                          author: "Jordan", 
                          age: 26, 
                          avatarColor: "#3b82f6",
                          content: "Love the strict focus on privacy here. No sign-ups required, just instant, secure chats with interesting people globally. Highly recommend." 
                      },
                  ].map((testimonial, i) => (
                      <TestimonialCard 
                          key={i}
                          {...testimonial}
                          delay={i * 0.1}
                      />
                  ))}
              </div>

              {/* Bottom Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mx-auto pt-16">
                  <div className="flex flex-col items-center text-center gap-4 group">
                      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center transition-all group-hover:bg-rose-500/20 group-hover:scale-105">
                          <Heart className="w-6 h-6 text-rose-500" />
                      </div>
                      <div>
                          <h4 className="font-black italic text-white text-[15px] mb-1 uppercase tracking-tight">Active Community</h4>
                          <p className="text-white/40 text-[13px] font-medium">Thousands of friendly users online</p>
                      </div>
                  </div>
                  <div className="flex flex-col items-center text-center gap-4 group">
                      <div className="w-14 h-14 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center transition-all group-hover:bg-yellow-400/20 group-hover:scale-105">
                          <Zap className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div>
                          <h4 className="font-black italic text-white text-[15px] mb-1 uppercase tracking-tight">Lightning Fast</h4>
                          <p className="text-white/40 text-[13px] font-medium">Instant connections, zero wait time</p>
                      </div>
                  </div>
                  <div className="flex flex-col items-center text-center gap-4 group">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center transition-all group-hover:bg-emerald-500/20 group-hover:scale-105">
                          <ShieldCheck className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div>
                          <h4 className="font-black italic text-white text-[15px] mb-1 uppercase tracking-tight">100% Secure</h4>
                          <p className="text-white/40 text-[13px] font-medium">Your privacy is strictly protected</p>
                      </div>
                  </div>
              </div>
          </section>

          {/* PREMIUM FOOTER */}
          <footer className="w-full pt-16 border-t border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-24 mb-16">
                  <div className="space-y-6 col-span-1 md:col-span-2">
                      <h3 className="text-4xl font-black uppercase italic tracking-tighter text-white">Chat<span className="text-yellow-400 not-italic">Jeen</span></h3>
                      <p className="text-white/40 text-lg font-medium leading-relaxed max-w-sm">
                          Making human connection clean, safe, and incredibly easy. Your go-to platform to meet people securely.
                      </p>
                  </div>
                  
                  <div className="space-y-8">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400">Discover</h4>
                      <div className="flex flex-col gap-4 text-xs font-bold uppercase tracking-[0.15em] text-white/40">
                          <Link href="/anonymous-chat" className="hover:text-yellow-400 transition-colors">Anonymous Chat</Link>
                          <Link href="/talk-to-strangers" className="hover:text-yellow-400 transition-colors">Talk to Strangers</Link>
                          <Link href="/meet-new-people-online" className="hover:text-yellow-400 transition-colors">Meet New People</Link>
                          <Link href="/free-chat-rooms" className="hover:text-yellow-400 transition-colors">Free Chat Rooms</Link>
                          <Link href="/anonymous-voice-chat" className="hover:text-yellow-400 transition-colors">Anonymous Voice Chat</Link>
                      </div>
                  </div>

                  <div className="space-y-8">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400">Alternatives</h4>
                      <div className="flex flex-col gap-4 text-xs font-bold uppercase tracking-[0.15em] text-white/40">
                          <Link href="/comparison/omegle-alternative" className="hover:text-yellow-400 transition-colors">Omegle Alternative</Link>
                          <Link href="/comparison/ome-tv-alternative" className="hover:text-yellow-400 transition-colors">OmeTV Alternative</Link>
                          <Link href="/comparison/chatroulette-alternative" className="hover:text-yellow-400 transition-colors">Chatroulette Alternative</Link>
                          <Link href="/comparison/monkey-app-alternative" className="hover:text-yellow-400 transition-colors">Monkey App Alternative</Link>
                          <Link href="/comparison/chatrandom-alternative" className="hover:text-yellow-400 transition-colors">Chatrandom Alternative</Link>
                          <Link href="/comparison/shagle-alternative" className="hover:text-yellow-400 transition-colors">Shagle Alternative</Link>
                      </div>
                  </div>

                  <div className="space-y-8">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400">Compliance & Safety</h4>
                      <div className="flex flex-col gap-4 text-xs font-bold uppercase tracking-[0.15em] text-white/40">
                          <Link href="/features" className="hover:text-yellow-400 transition-colors">Core Features</Link>
                          <Link href="/safety" className="hover:text-yellow-400 transition-colors">Safety Center</Link>
                          <Link href="/guidelines" className="hover:text-yellow-400 transition-colors">Guidelines</Link>
                          <Link href="/privacy" className="hover:text-yellow-400 transition-colors">Privacy Policy</Link>
                          <Link href="/terms" className="hover:text-yellow-400 transition-colors">Terms of Use</Link>
                      </div>
                  </div>
              </div>
              
              <div className="py-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="text-[9px] text-white/20 font-black uppercase tracking-[0.4em]">
                      © 2026 ChatJeen. All rights reserved.
                  </div>
                  <div className="flex items-center gap-8 text-[10px] text-yellow-400/40 font-black uppercase tracking-[0.2em]">
                      <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" /> Platform: Secure</span>
                      <span>Connections: Active</span>
                  </div>
              </div>
          </footer>
        </div>
      </div>
    </main>
  );
}
