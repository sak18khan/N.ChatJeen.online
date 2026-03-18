import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Zap, Globe, MessageCircle, Mic, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Chatroulette Alternative | A Safer Way to Chat | ChatJeen',
  description: 'Looking for a better Chatroulette alternative? ChatJeen provides a faster, safer, and cleaner environment for random video, text, and voice chat.',
};

export default function ChatrouletteAlternativePage() {
  const comparisons = [
    {
      label: 'Security Focus',
      competitor: 'Basic AI filtering',
      chatjeen: 'Proactive moderation & Encrypted connections'
    },
    {
      label: 'Focus',
      competitor: 'Video first, leading to frequent exposure',
      chatjeen: 'Text & Voice first, prioritizing conversation'
    },
    {
      label: 'User Interface',
      competitor: 'Cluttered classic layout',
      chatjeen: 'Modern, ad-free, minimal design'
    },
    {
      label: 'Connection Speed',
      competitor: 'Can be slow or drop often',
      chatjeen: 'Instant WebRTC matchmaking'
    }
  ];

  return (
    <main className="min-h-screen bg-background text-foreground p-8 md:p-24 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-16">
        <header className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest rounded-full border border-primary/20">
             <Globe className="w-3 h-3" />
             <span>The Modern Chat Platform</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-tight">
             A Better <span className="text-primary not-italic">Chatroulette Alternative</span>
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-medium leading-relaxed">
             Tired of the spam, bots, and inappropriate content on Chatroulette? Switch to ChatJeen for a clean, secure, and genuinely fun random chatting experience.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4">
              <ShieldCheck className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">Safer Environment</h3>
              <p className="text-muted-foreground text-sm">By focusing on Text and Voice, we significantly reduce the risk of unwanted visual exposure, making ChatJeen a safer place to talk.</p>
           </div>
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4">
              <Zap className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">Lightning Fast</h3>
              <p className="text-muted-foreground text-sm">Our modern tech stack ensures you connect with new partners almost instantly, without the lag often found on older platforms.</p>
           </div>
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4">
              <MessageCircle className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">Real Connections</h3>
              <p className="text-muted-foreground text-sm">Engage in meaningful conversations instead of just skipping through video feeds. We prioritize personality over appearance.</p>
           </div>
        </section>

        <section className="space-y-8">
           <h2 className="text-3xl font-black uppercase italic tracking-tighter text-center">Chatroulette vs. <span className="text-primary not-italic">ChatJeen</span></h2>
           <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden">
              <table className="w-full text-left">
                 <thead>
                    <tr className="border-b border-border bg-accent/50">
                       <th className="p-6 text-sm font-black uppercase tracking-widest">Feature</th>
                       <th className="p-6 text-sm font-black uppercase tracking-widest">Chatroulette</th>
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
           <p className="text-muted-foreground max-w-lg mx-auto">See why thousands of users are making the switch to ChatJeen every day. No sign-up required.</p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/matching?mode=text">
                <Button className="bg-primary text-primary-foreground font-black px-10 h-14 rounded-2xl shadow-xl hover:scale-105 transition-transform text-base uppercase tracking-widest">
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
