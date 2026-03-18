import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Zap, Globe, MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Monkey App Alternative | Browser-Based Random Chat | ChatJeen',
  description: 'Looking for a Monkey App alternative? ChatJeen brings fast, secure, and fun random text chat directly to your browser—no app download needed.',
};

export default function MonkeyAppAlternativePage() {
  const comparisons = [
    {
      label: 'Platform Access',
      competitor: 'Requires app download (often removed from stores)',
      chatjeen: 'Works right in your web browser, no download needed'
    },
    {
      label: 'Age Appropriateness',
      competitor: 'Known for a very young, often chaotic demographic',
      chatjeen: 'Moderated community focusing on quality connections'
    },
    {
      label: 'Focus',
      competitor: 'Short video clips & swiping',
      chatjeen: 'Deep, engaging Text conversations'
    },
    {
      label: 'Privacy',
      competitor: 'Requires phone number / Snapchat link',
      chatjeen: '100% Anonymous, zero personal linking'
    }
  ];

  return (
    <main className="min-h-screen bg-background text-foreground p-8 md:p-24 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-16">
        <header className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest rounded-full border border-primary/20">
             <Globe className="w-3 h-3" />
             <span>The Browser-Native Chat Alternative</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-tight">
             A Better <span className="text-primary not-italic">Monkey App Alternative</span>
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-medium leading-relaxed">
             Tired of downloading apps that constantly get banned from the App Store? ChatJeen offers the same thrill of random connection, directly in your browser, with better privacy and moderation.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4">
              <Zap className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">No Download Required</h3>
              <p className="text-muted-foreground text-sm">Save your storage space. ChatJeen works flawlessly on Safari, Chrome, and any modern mobile browser without needing an installation.</p>
           </div>
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4">
              <ShieldCheck className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">Don't Link Your Snap</h3>
              <p className="text-muted-foreground text-sm">Keep your personal social media private. Unlike Monkey which encourages linking external profiles, we champion complete anonymity.</p>
           </div>
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4">
              <MessageCircle className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">Better Conversations</h3>
              <p className="text-muted-foreground text-sm">Skip the superficial 15-second video judgments. Jump into a text chat where personality actually matters.</p>
           </div>
        </section>

        <section className="space-y-8">
           <h2 className="text-3xl font-black uppercase italic tracking-tighter text-center">Monkey App vs. <span className="text-primary not-italic">ChatJeen</span></h2>
           <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden">
              <table className="w-full text-left">
                 <thead>
                    <tr className="border-b border-border bg-accent/50">
                       <th className="p-6 text-sm font-black uppercase tracking-widest">Feature</th>
                       <th className="p-6 text-sm font-black uppercase tracking-widest">Monkey</th>
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
           <h2 className="text-4xl font-black uppercase italic tracking-tighter">Ready to connect?</h2>
           <p className="text-muted-foreground max-w-lg mx-auto">Just click and chat. No downloads, no sign-ups, no wait times.</p>
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
