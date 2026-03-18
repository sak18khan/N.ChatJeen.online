import type { Metadata } from 'next';
import Link from 'next/link';
import { MessageCircle, Gamepad2, Zap, ArrowRight, ShieldCheck, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Features | ChatJeen Anonymous Text Chat',
  description: 'Explore the powerful features of ChatJeen: Anonymous text chat, instant matching, and secure conversations.',
};

export default function FeaturesPage() {
  const features = [
    {
      icon: MessageCircle,
      title: 'Anonymous Text Chat',
      desc: 'Connect instantly with strangers worldwide. No registration required. Secure, fast, and completely private.',
      link: '/matching?mode=text'
    },
    {
      icon: Zap,
      title: 'Lightning Fast Matching',
      desc: 'Our optimized matching algorithm ensures you connect with a partner in milliseconds. No more waiting in long queues.',
      link: '/matching?mode=text'
    },
    {
      icon: ShieldCheck,
      title: 'Built-in Privacy',
      desc: 'We use premium encryption and a zero-log policy to ensure your identity and conversations are always protected.',
      link: '/privacy'
    }
  ];

  return (
    <main className="min-h-screen bg-background text-foreground p-8 md:p-24 flex flex-col items-center">
      <div className="max-w-5xl w-full space-y-16">
        <header className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest rounded-full border border-primary/20">
            <Zap className="w-3 h-3" />
            <span>Anonymous Social Suite</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
            The Chat<span className="text-primary not-italic">Jeen</span> Experience
          </h1>
          <p className="text-muted-foreground text-xl md:text-2xl max-w-2xl mx-auto font-medium leading-relaxed">
            The world's most advanced anonymous platform, designed for secure social interaction.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="group relative p-10 bg-card border border-border rounded-[2.5rem] hover:border-primary/40 transition-all overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
              <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform duration-500">
                <feature.icon className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black uppercase italic tracking-tight mb-4">{feature.title}</h2>
              <p className="text-muted-foreground leading-relaxed mb-8">{feature.desc}</p>
              <Link href={feature.link}>
                <Button variant="outline" className="w-full border-border hover:bg-muted group-hover:border-primary/30 py-6 font-bold uppercase tracking-widest">
                  Try it Now <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          ))}
        </div>


        <footer className="text-center pt-8">
          <Link href="/" className="text-primary font-bold hover:underline">
            ← Back to ChatJeen Home
          </Link>
        </footer>
      </div>
    </main>
  );
}
