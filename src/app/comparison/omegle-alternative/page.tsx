import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Zap, Globe, MessageCircle, Gamepad2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Omegle Alternative | The Best Anonymous Chat Platform',
  description: 'Looking for an Omegle alternative? ChatJeen offers secure, moderated anonymous text chat. No sign-up required.',
};

export default function OmegleAlternativePage() {
  const comparisons = [
    {
      label: 'Security',
      omegle: 'Limited moderation, high risk',
      chatjeen: 'Proactive moderation & encryption'
    },
    {
      label: 'Interaction',
      omegle: 'Text & Video only',
      chatjeen: 'Secure, lightning-fast Text Chat'
    },
    {
      label: 'Privacy',
      omegle: 'Uncertain data practices',
      chatjeen: 'Zero-log policy & absolute anonymity'
    },
    {
      label: 'Experience',
      omegle: 'Outdated interface',
      chatjeen: 'Modern, high-contrast UI'
    }
  ];

  return (
    <main className="min-h-screen bg-background text-foreground p-8 md:p-24 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-16">
        <header className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest rounded-full border border-primary/20">
             <Globe className="w-3 h-3" />
             <span>The New Standard for Global Connection</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-tight">
             Looking for an <span className="text-primary not-italic">Omegle Alternative?</span>
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-medium leading-relaxed">
             ChatJeen is the world's most advanced anonymous social platform, rebuilt from the ground up for safety and fun.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4">
              <MessageCircle className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">Better Chat</h3>
              <p className="text-muted-foreground text-sm">Real-time, instant matching with people who share your interests.</p>
           </div>
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4">
              <Zap className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">Instant Matching</h3>
              <p className="text-muted-foreground text-sm">Our smart matchmaker pairs you with the perfect conversation partner in seconds.</p>
           </div>
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4">
              <ShieldCheck className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">Zero Registration</h3>
              <p className="text-muted-foreground text-sm">Jump straight into the action. No email, no password, no hassle.</p>
           </div>
        </section>

        <section className="space-y-8">
           <h2 className="text-3xl font-black uppercase italic tracking-tighter text-center">Why Switch to <span className="text-primary not-italic">ChatJeen?</span></h2>
           <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden">
              <table className="w-full text-left">
                 <thead>
                    <tr className="border-b border-border bg-accent/50">
                       <th className="p-6 text-sm font-black uppercase tracking-widest">Feature</th>
                       <th className="p-6 text-sm font-black uppercase tracking-widest">Omegle</th>
                       <th className="p-6 text-sm font-black uppercase tracking-widest text-primary">ChatJeen</th>
                    </tr>
                 </thead>
                 <tbody>
                    {comparisons.map((c, i) => (
                       <tr key={i} className="border-b border-border last:border-0 hover:bg-accent/20 transition-colors">
                          <td className="p-6 font-bold">{c.label}</td>
                          <td className="p-6 text-muted-foreground">{c.omegle}</td>
                          <td className="p-6 font-medium text-foreground">{c.chatjeen}</td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </section>

        <section className="bg-primary/5 border border-primary/20 rounded-[3rem] p-12 text-center space-y-8">
           <h2 className="text-4xl font-black uppercase italic tracking-tighter">Ready to meet someone new?</h2>
           <div className="flex justify-center">
              <Link href="/matching?mode=text">
                <Button className="bg-primary text-primary-foreground font-black px-12 h-16 rounded-2xl shadow-xl hover:scale-105 transition-transform text-lg uppercase tracking-widest">
                   Start Chatting Now
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
