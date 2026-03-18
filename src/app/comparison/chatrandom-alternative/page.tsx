import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Zap, Globe, MessageCircle, Mic, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Chatrandom Alternative | Modern Anonymous Chat | ChatJeen',
  description: 'Searching for a Chatrandom alternative? ChatJeen is the modern, fast, and secure way to chat with strangers online via high-quality text and voice.',
};

export default function ChatrandomAlternativePage() {
  const comparisons = [
    {
      label: 'Design & UI',
      competitor: 'Outdated, cluttered interface',
      chatjeen: 'Sleek, modern, and mobile-optimized'
    },
    {
      label: 'Monetization',
      competitor: 'Heavy pushes for premium upgrades',
      chatjeen: 'Core connection features are 100% free'
    },
    {
      label: 'Media Quality',
      competitor: 'Standard WebRTC, often compressed',
      chatjeen: 'High-fidelity audio and lightning-fast text'
    },
    {
      label: 'Matching Speed',
      competitor: 'Standard routing',
      chatjeen: 'Optimized instant matchmaking algorithm'
    }
  ];

  return (
    <main className="min-h-screen bg-background text-foreground p-8 md:p-24 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-16">
        <header className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest rounded-full border border-primary/20">
             <Globe className="w-3 h-3" />
             <span>The Next Generation of Chat</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-tight">
             A Better <span className="text-primary not-italic">Chatrandom Alternative</span>
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-medium leading-relaxed">
             If you're looking for a cleaner, faster, and more secure platform than Chatrandom, ChatJeen is built exactly for you. Experience random chat upgraded for the modern web.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4">
              <Zap className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">Modern Tech Stack</h3>
              <p className="text-muted-foreground text-sm">Built on cutting-edge web technologies, ChatJeen feels snappy and responsive, unlike older legacy platforms.</p>
           </div>
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4">
              <ShieldCheck className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">No Intrusive Upsells</h3>
              <p className="text-muted-foreground text-sm">We don't bombard you with popups asking you to pay for 'gender filters' or 'VIP status'. Just pure, uncompromising chat.</p>
           </div>
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4">
              <MessageCircle className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">Audio Excellence</h3>
              <p className="text-muted-foreground text-sm">Instead of glitchy video feeds, we focus on providing the absolute best encrypted Voice Chat experience on the market.</p>
           </div>
        </section>

        <section className="space-y-8">
           <h2 className="text-3xl font-black uppercase italic tracking-tighter text-center">Chatrandom vs. <span className="text-primary not-italic">ChatJeen</span></h2>
           <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden">
              <table className="w-full text-left">
                 <thead>
                    <tr className="border-b border-border bg-accent/50">
                       <th className="p-6 text-sm font-black uppercase tracking-widest">Feature</th>
                       <th className="p-6 text-sm font-black uppercase tracking-widest">Chatrandom</th>
                       <th className="p-6 text-sm font-black uppercase tracking-widest text-primary">ChatJeen</th>
                    </tr>
                 </thead>
                 <tbody>
                    {comparisons.map((c, i) => (
                       <tr key={i} className="border-b border-border last:border-0 hover:bg-accent/20 transition-colors">
                          <td className="p-6 font-bold">{c.label}</td>
                          <td className="p-6 text-muted-foreground">{c.competitor}</td>
                          <td className="p-6 font-medium text-foreground">{c.chatjeen}</td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </section>

        <section className="bg-primary/5 border border-primary/20 rounded-[3rem] p-12 text-center space-y-8">
           <h2 className="text-4xl font-black uppercase italic tracking-tighter">Make the Switch Today</h2>
           <p className="text-muted-foreground max-w-lg mx-auto">Experience the difference a modern infrastructure makes. Click below and match instantly.</p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/matching?mode=text">
                <Button className="bg-primary text-primary-foreground font-black px-10 h-14 rounded-2xl shadow-xl hover:scale-105 transition-transform text-base uppercase tracking-widest">
                   Start Texting
                </Button>
              </Link>
              <Link href="/matching?mode=voice">
                <Button variant="outline" className="border-primary/20 hover:bg-primary/10 font-black px-10 h-14 rounded-2xl text-base uppercase tracking-widest">
                   Start Voice Call
                </Button>
              </Link>
           </div>
        </section>

        <footer className="text-center">
           <Link href="/" className="text-primary font-bold hover:underline">
              ← Back to ChatJeen Home
           </Link>
        </footer>
      </div>
    </main>
  );
}
