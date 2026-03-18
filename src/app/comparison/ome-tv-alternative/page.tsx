import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Zap, Globe, MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'OmeTV Alternative | Ad-Free Anonymous Chat | ChatJeen',
  description: 'Looking for a better OmeTV alternative? ChatJeen provides a faster, safer, and cleaner environment for anonymous text chat without intrusive ads or paywalls.',
};

export default function OmeTvAlternativePage() {
  const comparisons = [
    {
      label: 'Intrusive Ads',
      competitor: 'Frequent interruptions',
      chatjeen: '100% Ad-Free experience'
    },
    {
      label: 'Premium Features',
      competitor: 'Locked behind paywalls/coins',
      chatjeen: 'All core messaging features are free'
    },
    {
      label: 'Platform Focus',
      competitor: 'Video-heavy, high ban rates',
      chatjeen: 'Pure Text Chat, focused on stable connections'
    },
    {
      label: 'Account Requirement',
      competitor: 'Often requires social login',
      chatjeen: 'Zero registration required, full anonymity'
    }
  ];

  return (
    <main className="min-h-screen bg-background text-foreground p-8 md:p-24 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-16">
        <header className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest rounded-full border border-primary/20">
             <Globe className="w-3 h-3" />
             <span>The Ad-Free Chat Platform</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-tight">
             A Better <span className="text-primary not-italic">OmeTV Alternative</span>
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-medium leading-relaxed">
             Tired of the constant ads, pay-to-chat features, and forced logins on OmeTV? Switch to ChatJeen for a clean, completely free random text chatting experience.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4">
              <ShieldCheck className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">No Social Logins</h3>
              <p className="text-muted-foreground text-sm">Unlike OmeTV which often forces you to link an account, ChatJeen respects your privacy. Open the site and start chatting anonymously.</p>
           </div>
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4">
              <Zap className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">Zero Paywalls</h3>
              <p className="text-muted-foreground text-sm">We don't use 'coins' or 'VIP' subscriptions. Every user gets the same high-quality matchmaking and connection speed.</p>
           </div>
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4">
              <MessageCircle className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">No Ads</h3>
              <p className="text-muted-foreground text-sm">Enjoy an uninterrupted chatting session. No banner ads, no popups, just a clean interface designed for conversation.</p>
           </div>
        </section>

        <section className="space-y-8">
           <h2 className="text-3xl font-black uppercase italic tracking-tighter text-center">OmeTV vs. <span className="text-primary not-italic">ChatJeen</span></h2>
           <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden">
              <table className="w-full text-left">
                 <thead>
                    <tr className="border-b border-border bg-accent/50">
                       <th className="p-6 text-sm font-black uppercase tracking-widest">Feature</th>
                       <th className="p-6 text-sm font-black uppercase tracking-widest">OmeTV</th>
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
           <h2 className="text-4xl font-black uppercase italic tracking-tighter">Experience the Upgrade</h2>
           <p className="text-muted-foreground max-w-lg mx-auto">Ditch the ads. Join thousands of users who prefer the cleaner, faster ChatJeen experience.</p>
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
