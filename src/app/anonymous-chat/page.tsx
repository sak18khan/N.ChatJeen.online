import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Zap, Globe, MessageCircle, Mic, Gamepad2, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Anonymous Chat | Private & Secure Text & Voice | ChatJeen',
  description: 'Join ChatJeen for the ultimate anonymous chat experience. Instantly connect with strangers worldwide via secure text and high-fidelity voice. No sign-up required.',
};

export default function AnonymousChatPage() {
  return (
    <main className="min-h-screen bg-background text-foreground p-8 md:p-24 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-16">
        <header className="text-center space-y-6">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest rounded-full border border-primary/20">
              <UserX className="w-3 h-3" />
              <span>100% Private Conversations</span>
           </div>
           <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-tight">
              The Best <span className="text-primary not-italic">Anonymous Chat</span> Online
           </h1>
           <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              Experience total freedom with ChatJeen. Connect instantly with people around the world without revealing your identity. No profiles, no tracking, just real conversation.
           </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4">
              <ShieldCheck className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">Complete Privacy</h3>
              <p className="text-muted-foreground text-sm">Your identity remains hidden. We don't require an email, phone number, or any personal details to start chatting.</p>
           </div>
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4">
              <Zap className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">Instant Connections</h3>
              <p className="text-muted-foreground text-sm">Match with a stranger in milliseconds. Our optimized routing ensures you spend zero time waiting.</p>
           </div>
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4">
              <Mic className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">Text & Voice</h3>
              <p className="text-muted-foreground text-sm">Choose how you want to interact. Enjoy lightning-fast text chat or jump into high-fidelity encrypted voice calls.</p>
           </div>
        </section>

        <section className="space-y-8">
           <h2 className="text-3xl font-black uppercase italic tracking-tighter text-center">Why Choose ChatJeen for <span className="text-primary not-italic">Anonymous Chat?</span></h2>
           <div className="prose prose-invert max-w-none text-muted-foreground">
             <p className="text-lg leading-relaxed">
               In a digital world where every action is tracked, finding a truly <strong>anonymous chat</strong> platform is rare. ChatJeen was built from the ground up to prioritize your privacy and security. Unlike other platforms that secretly log your IP or require social logins, we operate on a strict zero-knowledge model when it comes to your true identity.
             </p>
             <p className="text-lg leading-relaxed mt-4">
               Whether you're looking for deep conversations, wanting to practice a new language, or just bored and seeking random encounters, our platform provides a safe, moderated environment. Enjoy features like real-time text delivery, crystal-clear WebRTC voice, and an intuitive UI that gets out of your way.
             </p>
           </div>
        </section>

        <section className="bg-primary/5 border border-primary/20 rounded-[3rem] p-12 text-center space-y-8 mt-12">
           <h2 className="text-4xl font-black uppercase italic tracking-tighter">Start Chatting Anonymously</h2>
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/matching?mode=text">
                <Button className="bg-primary text-primary-foreground font-black px-10 h-14 rounded-2xl shadow-xl hover:scale-105 transition-transform text-base uppercase tracking-widest">
                   Join Text Chat
                </Button>
              </Link>
              <Link href="/matching?mode=voice">
                <Button variant="outline" className="border-primary/20 hover:bg-primary/10 font-black px-10 h-14 rounded-2xl text-base uppercase tracking-widest">
                   Join Voice Chat
                </Button>
              </Link>
           </div>
        </section>

        <footer className="text-center pt-8 border-t border-border">
           <Link href="/" className="text-primary font-bold hover:underline">
              ← Back to ChatJeen
           </Link>
        </footer>
      </div>
    </main>
  );
}
