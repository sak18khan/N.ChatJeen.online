import type { Metadata } from 'next';
import Link from 'next/link';
import { HeartHandshake, MapPin, Sparkles, MessageCircle, Mic, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Meet New People Online | Instant Random Chat | ChatJeen',
  description: 'Looking to meet new people online? ChatJeen connects you instantly with strangers around the world for fun, spontaneous text and voice conversations.',
};

export default function MeetNewPeoplePage() {
  return (
    <main className="min-h-screen bg-background text-foreground p-8 md:p-24 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-16">
        <header className="text-center space-y-6">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest rounded-full border border-primary/20">
              <Users className="w-3 h-3" />
              <span>The Social Network Alternative</span>
           </div>
           <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-tight">
              The Easiest Way to <span className="text-primary not-italic">Meet New People Online</span>
           </h1>
           <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              Tired of swiping and waiting? ChatJeen bypasses the superficial filters and drops you straight into real conversations with real people.
           </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4 shadow-sm">
              <HeartHandshake className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">Authentic Connections</h3>
              <p className="text-muted-foreground text-sm">Without profiles or pictures to judge, connections on ChatJeen are based entirely on personality and conversation.</p>
           </div>
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4 shadow-sm">
              <MapPin className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">Global Reach</h3>
              <p className="text-muted-foreground text-sm">Expand your worldview. You could be talking to a student in Tokyo one minute, and an artist in Paris the next.</p>
           </div>
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4 shadow-sm">
              <Sparkles className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">Spontaneous Fun</h3>
              <p className="text-muted-foreground text-sm">Every click of the "Skip" button brings a brand new interaction. The excitement of the unknown is the core ChatJeen experience.</p>
           </div>
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4 shadow-sm">
              <Zap className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">Zero Barrier to Entry</h3>
              <p className="text-muted-foreground text-sm">No accounts to create, no email verification. Just open the site and start chatting in less than 5 seconds.</p>
           </div>
        </section>

        <section className="space-y-8 mt-12 bg-accent/10 p-10 rounded-[3rem] border border-border text-center">
           <h2 className="text-3xl font-black uppercase italic tracking-tighter">Choose Your Vibe</h2>
           <p className="text-muted-foreground max-w-xl mx-auto">
             How do you prefer to meet new people? ChatJeen offers two distinct ways to connect based on your mood.
           </p>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-left mt-8 max-w-3xl mx-auto">
             <div className="space-y-4 bg-background p-6 rounded-2xl border border-border">
               <h4 className="font-bold text-2xl uppercase italic text-primary flex items-center gap-2">
                 <MessageCircle className="w-6 h-6"/> Text Chat
               </h4>
               <p className="text-muted-foreground">Fast, casual, and low-pressure. Ideal for quick check-ins, practicing languages, or chatting when you need to be quiet.</p>
               <Link href="/matching?mode=text" className="inline-block mt-4 text-sm font-bold uppercase tracking-widest text-primary hover:underline">
                  Start Texting →
               </Link>
             </div>
             <div className="space-y-4 bg-background p-6 rounded-2xl border border-border">
               <h4 className="font-bold text-2xl uppercase italic text-primary flex items-center gap-2">
                 <Mic className="w-6 h-6"/> Voice Chat
               </h4>
               <p className="text-muted-foreground">Deep, engaging, and personal. Perfect for long conversations and forming stronger connections instantly over audio.</p>
               <Link href="/matching?mode=voice" className="inline-block mt-4 text-sm font-bold uppercase tracking-widest text-primary hover:underline">
                  Start Talking →
               </Link>
             </div>
           </div>
        </section>

        <section className="bg-primary/5 border border-primary/20 rounded-[3rem] p-12 text-center space-y-8 mt-12">
           <h2 className="text-4xl font-black uppercase italic tracking-tighter">Your New Friends Are Here</h2>
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/matching?mode=text">
                <Button className="bg-primary text-primary-foreground font-black px-10 h-14 rounded-2xl shadow-xl hover:scale-105 transition-transform text-base uppercase tracking-widest">
                   Meet Someone Now
                </Button>
              </Link>
           </div>
        </section>

        <footer className="text-center pt-8 border-t border-border">
           <Link href="/" className="text-primary font-bold hover:underline">
              ← Return Home
           </Link>
        </footer>
      </div>
    </main>
  );
}
