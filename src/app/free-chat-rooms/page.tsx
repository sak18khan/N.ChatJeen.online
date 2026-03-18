import type { Metadata } from 'next';
import Link from 'next/link';
import { MessageSquareText, Shield, Zap, Sparkles, MessagesSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Free Chat Rooms | 100% Free Anonymous Chat | ChatJeen',
  description: 'Join the best free chat rooms online. ChatJeen offers 100% free, secure, and private text chat rooms with people from all over the world. No login required.',
};

export default function FreeChatRoomsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground p-8 md:p-24 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-16">
        <header className="text-center space-y-6">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest rounded-full border border-primary/20">
              <Sparkles className="w-3 h-3" />
              <span>100% Free Forever</span>
           </div>
           <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-tight">
              The Best <span className="text-primary not-italic">Free Chat Rooms</span> Online
           </h1>
           <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              No paywalls, no hidden fees, no subscriptions. Experience premium anonymous chatting completely free on ChatJeen.
           </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4">
              <Zap className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">Zero Cost, Ever</h3>
              <p className="text-muted-foreground text-sm">We believe connection should be accessible to everyone. All core features on ChatJeen are free to use.</p>
           </div>
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4">
              <Shield className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">Premium Security</h3>
              <p className="text-muted-foreground text-sm">Free shouldn't mean unsafe. We invest heavily in moderation and encryption to keep our free chat rooms secure.</p>
           </div>
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4">
              <MessagesSquare className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">Unlimited Messages</h3>
              <p className="text-muted-foreground text-sm">Type away without worrying about message limits or time restrictions. Talk for as long as you want.</p>
           </div>
        </section>

        <section className="space-y-8 mt-12">
           <h2 className="text-3xl font-black uppercase italic tracking-tighter text-center">Are These Real Chat Rooms?</h2>
           <div className="bg-card border border-border rounded-3xl p-8 md:p-12 text-muted-foreground space-y-4">
             <p className="text-lg leading-relaxed">
               Unlike traditional forum-style chat rooms where dozens of people talk over each other in a chaotic public channel, ChatJeen focuses on <strong>1-on-1 private rooms</strong>.
             </p>
             <p className="text-lg leading-relaxed">
               When you click "Start", we instantly create a secure, temporary, and free chat room just for you and one randomly selected partner. This ensures higher quality conversations, better privacy, and a more meaningful interaction without the noise of a crowded internet lobby.
             </p>
           </div>
        </section>

        <section className="bg-primary/5 border border-primary/20 rounded-[3rem] p-12 text-center space-y-8 mt-12">
           <MessageSquareText className="w-16 h-16 text-primary mx-auto animate-pulse" />
           <h2 className="text-4xl font-black uppercase italic tracking-tighter">Enter a Free Room Now</h2>
           <p className="text-muted-foreground font-medium max-w-lg mx-auto">
             Ready to meet your next conversation partner? Start our text chat to get connected.
           </p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/matching?mode=text">
                <Button className="bg-primary text-primary-foreground font-black px-10 h-14 rounded-2xl shadow-xl hover:scale-105 transition-transform text-base uppercase tracking-widest w-full sm:w-auto">
                   Enter Text Room
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
