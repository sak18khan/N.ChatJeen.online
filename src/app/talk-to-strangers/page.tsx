import type { Metadata } from 'next';
import Link from 'next/link';
import { Globe, Users, MessagesSquare, Zap, Shield, HandMetal } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Talk to Strangers | Meeting New People Made Easy | ChatJeen',
  description: 'Looking to talk to strangers online? ChatJeen is the fastest way to connect, chat, and make new friends globally with text and voice.',
};

export default function TalkToStrangersPage() {
  return (
    <main className="min-h-screen bg-background text-foreground p-8 md:p-24 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-16">
        <header className="text-center space-y-6">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest rounded-full border border-primary/20">
              <MessagesSquare className="w-3 h-3" />
              <span>Connect Globally, Instantly</span>
           </div>
           <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-tight">
              Ready to <span className="text-primary not-italic">Talk to Strangers?</span>
           </h1>
           <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              Step out of your bubble. Meet fascinating people from all walks of life instantly. ChatJeen makes talking to strangers safe, simple, and exciting.
           </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <Globe className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">Worldwide Reach</h3>
              <p className="text-muted-foreground text-sm">Expand your horizons. Our community spans across continents, allowing you to learn about new cultures and perspectives directly from locals.</p>
           </div>
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <Users className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">Vibrant Community</h3>
              <p className="text-muted-foreground text-sm">Whether you want to deeply dissect philosophy at 3 AM or just share a quick laugh, there is always someone ready to talk when you are.</p>
           </div>
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <Zap className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">Lightning Fast</h3>
              <p className="text-muted-foreground text-sm">Skip the profile building and swiping. Use our instant matching system to begin a conversation immediately.</p>
           </div>
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <Shield className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">Safe Environment</h3>
              <p className="text-muted-foreground text-sm">We proactively moderate the platform to keep the community healthy. Talk to strangers without compromising your security.</p>
           </div>
        </section>

        <section className="space-y-8 bg-accent/20 p-8 md:p-12 rounded-3xl border border-border">
           <h2 className="text-3xl font-black uppercase italic tracking-tighter text-center">How to start a conversation?</h2>
           <div className="space-y-6 text-muted-foreground max-w-2xl mx-auto">
             <p className="text-lg leading-relaxed">
               Starting a conversation with someone you don't know can seem daunting, but on ChatJeen, everyone is here for the same reason: to meet someone new. 
             </p>
             <ul className="list-disc list-inside space-y-3">
               <li><strong>Break the ice:</strong> A simple "Hey, how's your day going?" works wonders.</li>
               <li><strong>Share an interest:</strong> Ask about their favorite movies, music, or hobbies.</li>
               <li><strong>Be respectful:</strong> Treat your new chat partner with the same respect you'd expect in return.</li>
               <li><strong>Keep it light:</strong> Fun, casual topics are usually best for anonymous interactions.</li>
             </ul>
           </div>
        </section>

        <section className="bg-primary/5 border border-primary/20 rounded-[3rem] p-12 text-center space-y-8">
           <div className="flex justify-center mb-4">
              <HandMetal className="w-16 h-16 text-primary animate-pulse" />
           </div>
           <h2 className="text-4xl font-black uppercase italic tracking-tighter">Your Next Friend is Waiting</h2>
           <p className="text-muted-foreground font-medium max-w-lg mx-auto">
             No downloads, no hassle. Choose text or voice and jump right into the global conversation.
           </p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/matching?mode=text">
                <Button className="bg-primary text-primary-foreground font-black px-10 h-14 rounded-2xl shadow-xl hover:scale-105 transition-transform text-base uppercase tracking-widest w-full sm:w-auto">
                   Start Texting
                </Button>
              </Link>
              <Link href="/matching?mode=voice">
                <Button variant="outline" className="border-primary/20 hover:bg-primary/10 font-black px-10 h-14 rounded-2xl text-base uppercase tracking-widest w-full sm:w-auto">
                   Start Talking
                </Button>
              </Link>
           </div>
        </section>

        <footer className="text-center pt-8 border-t border-border">
           <Link href="/" className="text-primary font-bold hover:underline">
              ← Return to ChatJeen Home
           </Link>
        </footer>
      </div>
    </main>
  );
}
