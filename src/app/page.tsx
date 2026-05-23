'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ShieldCheck, Zap, Laptop, Heart, Target, ArrowRight, Menu, Star, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import TestimonialCard from '@/components/TestimonialCard';
import LiveRoomsList from '@/components/LiveRoomsList';

const VIBES = [
  { id: 'Any', name: 'Casual Chat 💬', desc: 'No special theme, talk about anything.' },
  { id: 'Deep', name: 'Deep Talk 🌌', desc: 'Existential thoughts, dreams, and life.' },
  { id: 'Debate', name: 'Debate Arena ⚡', desc: 'Friendly arguments on hot topics.' },
  { id: 'Gaming', name: 'Tech & Gaming 🎮', desc: 'Hardware, coding, gaming, and console wars.' },
  { id: 'Anime', name: 'Pop Culture 🍿', desc: 'Anime, movies, series, and music.' },
  { id: 'Vent', name: 'Vent / Rant 🌋', desc: 'Get things off your chest safely.' }
];

const QUESTIONS = [
  { text: 'Is pineapple on pizza delicious or an abomination?', options: ['Delicious 🍕', 'Abomination 🤮'] },
  { text: 'Would you rather have flight or invisibility?', options: ['Flight 🦅', 'Invisibility 👻'] },
  { text: 'Should AI art be protected under copyright?', options: ['Yes 🎨', 'No 🤖'] },
  { text: 'Are you an early bird or a night owl?', options: ['Early Bird 🌅', 'Night Owl 🌌'] },
  { text: 'Does money buy happiness?', options: ['Yes, stability = peace 💵', 'No, it is internal 🧠'] }
];

const DEBATE_TOPICS = [
  'Android is superior to iOS.',
  'Social media does more harm than good.',
  'Remote work is better than office work.',
  'Cereal is a type of cold soup.',
  'AI will completely replace software engineers.'
];

export default function HomePage() {
  const router = useRouter();
  const [selectedVibe, setSelectedVibe] = useState('Any');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [selectedStance, setSelectedStance] = useState<'Pro' | 'Con' | 'Random'>('Random');
  const [debateTopic, setDebateTopic] = useState('');
  
  // Stably select one random question on load
  const [question, setQuestion] = useState({ text: '', options: [''] });

  useEffect(() => {
    const randomQ = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    setQuestion(randomQ);
    const randomTopic = DEBATE_TOPICS[Math.floor(Math.random() * DEBATE_TOPICS.length)];
    setDebateTopic(randomTopic);
  }, []);

  const handleStart = () => {
    let url = `/matching?mode=text&vibe=${selectedVibe}`;
    
    if (selectedVibe === 'Debate') {
      url += `&topic=${encodeURIComponent(debateTopic)}&stance=${selectedStance}`;
    } else if (selectedAnswer) {
      url += `&q=${encodeURIComponent(question.text)}&a=${encodeURIComponent(selectedAnswer)}`;
    }
    
    router.push(url);
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

      {/* 2. FIRST FOLD: HERO SECTION (FULL HEIGHT & RESPONSIVE GRID) */}
      <section className="relative min-h-[calc(100vh-3.5rem)] flex items-center justify-center py-12 px-6 overflow-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-yellow-400/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 translate-x-1/2 w-[250px] h-[250px] bg-[#FF4B4B]/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full max-w-6xl relative z-10 items-center">
          
          {/* LEFT COLUMN: BRANDING & HEADLINES */}
          <div className="lg:col-span-5 flex flex-col gap-6 items-center lg:items-start text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-[0_0_30px_rgba(250,204,21,0.2)] flex items-center justify-center mb-2"
            >
              <MessageCircle className="w-10 h-10 text-black fill-black/10" />
            </motion.div>

            <div className="space-y-3">
              <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">
                Chat<span className="text-yellow-400 not-italic">Jeen</span>
              </h2>
              <p className="text-[12px] font-bold text-white/40 uppercase tracking-[0.2em]">Safe. Fun. Gamified.</p>
            </div>

            <p className="text-white/60 text-sm leading-relaxed max-w-sm">
              Connect with strangers globally based on your specific vibe. Earn points, level up, and unlock custom features as you chat. Clean and secure.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
              <div className="px-4 py-2 bg-[#111111] border border-white/5 rounded-full flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-[#5CE65C] shadow-[0_0_10px_rgba(92,230,92,0.5)]" />
                <span className="text-[11px] font-bold text-white/60">10,482 online now</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/40 font-medium">
                <ShieldCheck className="w-4 h-4 text-yellow-400" />
                <span>Strict NSFW filters enabled</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: CONFIGURATOR CARD */}
          <div className="lg:col-span-7 w-full flex justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="w-full max-w-xl bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl relative"
            >
              <h3 className="text-xl font-black uppercase tracking-tight italic mb-6 text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" /> Set Your Connection Vibe
              </h3>

              {/* VIBE SELECTOR GRID */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {VIBES.map((vibe) => (
                  <button
                    key={vibe.id}
                    onClick={() => {
                      setSelectedVibe(vibe.id);
                      setSelectedAnswer(null);
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 text-center rounded-2xl border transition-all text-xs gap-1 group relative overflow-hidden",
                      selectedVibe === vibe.id 
                        ? "bg-yellow-400 text-black border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.2)]" 
                        : "bg-white/[0.02] border-white/5 text-white/70 hover:bg-white/5 hover:border-white/10"
                    )}
                  >
                    <span className="font-bold text-[13px]">{vibe.name.split(' ')[0]}</span>
                    <span className="text-[9px] opacity-60 font-semibold">{vibe.name.split(' ').slice(1).join(' ')}</span>
                  </button>
                ))}
              </div>

              {/* DYNAMIC CARD BASED ON SELECTED VIBE */}
              <AnimatePresence mode="wait">
                {selectedVibe === 'Debate' ? (
                  <motion.div
                    key="debate-config"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 mb-6 flex flex-col gap-4"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-yellow-400">Debate Topic</span>
                      <input 
                        type="text" 
                        value={debateTopic}
                        onChange={(e) => setDebateTopic(e.target.value)}
                        placeholder="Type a topic to debate..."
                        className="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-400/50 w-full"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-yellow-400">Choose Stance</span>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Pro', 'Con', 'Random'] as const).map((stance) => (
                          <button
                            key={stance}
                            onClick={() => setSelectedStance(stance)}
                            className={cn(
                              "py-2 rounded-xl text-xs font-bold border transition-colors",
                              selectedStance === stance
                                ? "bg-white text-black border-white"
                                : "bg-black/40 border-white/10 text-white/50 hover:bg-white/5"
                            )}
                          >
                            {stance}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  // QUESTION OF THE DAY MATCH
                  question.text && (
                    <motion.div
                      key="qna-config"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 mb-6 flex flex-col gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full border border-yellow-400/10">Question Matcher</span>
                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider">Answer to unlock chat starting topic</span>
                      </div>
                      <p className="text-xs font-extrabold text-white leading-relaxed">{question.text}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
                        {question.options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setSelectedAnswer(opt)}
                            className={cn(
                              "px-4 py-3 rounded-xl text-xs font-bold text-left border transition-all flex items-center justify-between",
                              selectedAnswer === opt
                                ? "bg-yellow-400/10 border-yellow-400 text-yellow-400"
                                : "bg-black/40 border-white/10 text-white/50 hover:bg-white/5"
                            )}
                          >
                            <span>{opt}</span>
                            {selectedAnswer === opt && <Check className="w-3.5 h-3.5" />}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )
                )}
              </AnimatePresence>

              {/* SUBMIT BUTTON */}
              <button 
                onClick={handleStart}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black text-sm py-4 rounded-full shadow-[0_15px_30px_rgba(250,204,21,0.15)] active:scale-98 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <span>Find Match</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>

        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-20 hidden md:flex">
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
                      { step: "01", title: "Join Queue", desc: "One click and our smart matchmaker starts looking for your partner.", icon: Zap },
                      { step: "02", title: "Instant Match", desc: "No registration required. Get connected with a real human in seconds.", icon: Laptop },
                      { step: "03", title: "Start Chatting", desc: "Your private, secure chat begins immediately. Have fun!", icon: Heart }
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

          {/* SOCIAL ROOMS SECTION (REPOSITIONED & IMPROVED) */}
          <section id="social-rooms" className="w-full space-y-16 py-12 border-y border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent rounded-[3rem]">
            <LiveRoomsList />
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
                      { title: "Total Control", desc: "Not feeling the vibe? A single click skips to a brand new conversation.", icon: MessageCircle }, 
                      { title: "Lightning Fast", desc: "Enjoy smooth, lag-free text messaging on any device or network.", icon: Laptop },
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
                          content: "Finding people to practice English with is so easy here. It's safe, fast, and I've met some really interesting partners." 
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
