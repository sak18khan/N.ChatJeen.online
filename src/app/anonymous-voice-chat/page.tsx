import type { Metadata } from 'next';
import Link from 'next/link';
import { Mic, Headphones, ShieldCheck, Lock, Zap, AudioLines } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Anonymous Voice Chat | Secure Audio Calls with Strangers | ChatJeen',
  description: 'Experience high-fidelity, secure anonymous voice chat on ChatJeen. Talk directly to strangers worldwide with zero registration and complete privacy.',
};

export default function AnonymousVoiceChatPage() {
  return (
    <main className="min-h-screen bg-background text-foreground p-8 md:p-24 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-16">
        <header className="text-center space-y-6">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest rounded-full border border-primary/20">
              <AudioLines className="w-3 h-3" />
              <span>Crystal Clear Connections</span>
           </div>
           <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-tight">
              Secure <span className="text-primary not-italic">Anonymous Voice Chat</span>
           </h1>
           <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              Ditch the text and let your voice be heard. Connect emotionally and authentically with strangers through high-fidelity, encrypted voice calls.
           </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4">
              <Headphones className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">High Fidelity</h3>
              <p className="text-muted-foreground text-sm">Experience crystal-clear audio powered by modern WebRTC technology. It feels like they are right next to you.</p>
           </div>
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4">
              <Lock className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">End-to-End Encrypted</h3>
              <p className="text-muted-foreground text-sm">Your calls are strictly between you and your partner. We do not (and cannot) listen to or record your conversations.</p>
           </div>
           <div className="p-8 bg-card border border-border rounded-3xl space-y-4">
              <Zap className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold uppercase italic tracking-tight">Zero Latency</h3>
              <p className="text-muted-foreground text-sm">Direct peer-to-peer connections mean you get the lowest possible latency for smooth, natural conversations.</p>
           </div>
        </section>

        <section className="space-y-8 mt-12 bg-card p-10 rounded-[3rem] border border-border text-center">
           <h2 className="text-3xl font-black uppercase italic tracking-tighter">Why Choose Voice Over Text?</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-left mt-8 max-w-3xl mx-auto">
             <div className="space-y-3">
               <h4 className="font-bold text-lg text-primary flex items-center gap-2">
                 <Mic className="w-5 h-5"/> Emotion & Tone
               </h4>
               <p className="text-muted-foreground">Text can easily be misinterpreted. Voice chat allows you to convey sarcasm, excitement, and nuance effortlessly.</p>
             </div>
             <div className="space-y-3">
               <h4 className="font-bold text-lg text-primary flex items-center gap-2">
                 <ShieldCheck className="w-5 h-5"/> Deeper Connections
               </h4>
               <p className="text-muted-foreground">Hearing a real human voice creates an immediate psychological bond that text on a screen simply cannot replicate.</p>
             </div>
           </div>
        </section>

        <section className="bg-primary/5 border border-primary/20 rounded-[3rem] p-12 text-center space-y-8 mt-12">
           <h2 className="text-4xl font-black uppercase italic tracking-tighter">Ready to speak your mind?</h2>
           <p className="text-muted-foreground font-medium max-w-lg mx-auto">
             Grab your microphone. A random partner is just one click away.
           </p>
           <div className="flex justify-center">
              <Link href="/matching?mode=voice">
                <Button className="bg-primary text-primary-foreground font-black px-12 h-16 rounded-2xl shadow-xl hover:scale-105 transition-transform text-lg uppercase tracking-widest flex items-center gap-3">
                   <Mic className="w-6 h-6" /> Start Voice Call
                </Button>
              </Link>
           </div>
           
           <div className="mt-6 pt-6 border-t border-primary/10">
              <p className="text-sm text-muted-foreground">
                Prefer to stay quiet? <Link href="/matching?mode=text" className="text-primary hover:underline font-bold">Try our Text Chat instead.</Link>
              </p>
           </div>
        </section>

        <footer className="text-center pt-8">
           <Link href="/" className="text-primary font-bold hover:underline">
              ← Return to ChatJeen Home
           </Link>
        </footer>
      </div>
    </main>
  );
}
