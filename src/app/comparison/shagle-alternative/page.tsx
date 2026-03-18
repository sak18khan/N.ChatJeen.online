import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Zap, Globe, MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Shagle Alternative | Premium Random Chat for Free | ChatJeen',
  description: 'Looking for a Shagle alternative? Enjoy a premium-feeling random text chat experience for free on ChatJeen. Fast matching, high privacy, and no hidden fees.',
};

export default function ShagleAlternativePage() {
  const comparisons = [
    {
      label: 'Pricing Model',
      competitor: 'Freemium (many features locked)',
      chatjeen: '100% Free for all core features'
    },
    {
      label: 'Anonymity',
      competitor: 'Basic anonymity',
      chatjeen: 'Absolute, zero-log anonymity'
    },
    {
      label: 'Community Vibe',
      competitor: 'Often unpredictable and unmoderated',
      chatjeen: 'Community guidelines enforced for a better experience'
    },
    {
      label: 'Matching Speed',
      competitor: 'Standard routing',
      chatjeen: 'Lightning-fast instant matchmaking'
    }
  ];

  return (
    <main className="min-h-screen bg-background text-foreground p-8 md:p-24 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-16">
        <header className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest rounded-full border border-primary/20">
             <Globe className="w-3 h-3" />
             <span>The Premium Free Alternative</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-tight">
             A Better <span className="text-primary not-italic">Shagle Alternative</span>
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-medium leading-relaxed">
             Why pay for basic chat features when you can get a better, faster, and more secure experience for free? Welcome to ChatJeen.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4">
              <Zap className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">Free Premium Feel</h3>
              <p className="text-muted-foreground text-sm">We provide a beautiful, fast, and feature-rich interface without hiding the best parts behind a paywall.</p>
           </div>
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4">
              <ShieldCheck className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">Ultimate Privacy</h3>
              <p className="text-muted-foreground text-sm">We don't collect data to sell. Our business model isn't built on compromising your personal information.</p>
           </div>
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4">
              <MessageCircle className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">Pure Text Chat</h3>
              <p className="text-muted-foreground text-sm">Connect instantly. Our lightning-fast text interface is designed for real-time engagement and authentic connection.</p>
           </div>
        </section>

        <section className="space-y-8">
           <h2 className="text-3xl font-black uppercase italic tracking-tighter text-center">Shagle vs. <span className="text-primary not-italic">ChatJeen</span></h2>
           <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden">
              <table className="w-full text-left">
                 <thead>
                    <tr className="border-b border-border bg-accent/50">
                       <th className="p-6 text-sm font-black uppercase tracking-widest">Feature</th>
                       <th className="p-6 text-sm font-black uppercase tracking-widest">Shagle</th>
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
           <h2 className="text-4xl font-black uppercase italic tracking-tighter">Upgrade Your Chat Today</h2>
           <p className="text-muted-foreground max-w-lg mx-auto">Stop settling for limited freemium apps. Try the platform built for real connections.</p>
           <div className="flex justify-center">
              <Link href="/matching?mode=text">
                <Button className="bg-primary text-primary-foreground font-black px-12 h-16 rounded-2xl shadow-xl hover:scale-105 transition-transform text-lg uppercase tracking-widest">
                   Start Texting Now
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
