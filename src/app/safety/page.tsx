import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Lock, EyeOff, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Safety & Trust | ChatJeen Anonymous Chat',
  description: 'Your safety is our priority. Learn how ChatJeen protects your identity through encryption, anonymity, and robust safety guidelines.',
};

export default function SafetyPage() {
  const safetyFeatures = [
    {
      icon: EyeOff,
      title: 'Total Anonymity',
      description: 'We never ask for your name, email, or phone number. You are always a stranger unless you choose to share your identity.',
    },
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      description: 'Your voice calls and text messages are encrypted. We don\'t logs or store your private conversations.',
    },
    {
      icon: ShieldCheck,
      title: 'Proactive Moderation',
      description: 'Our community guidelines and reporting tools ensure a respectful environment for everyone.',
    },
    {
      icon: UserCheck,
      title: 'Identity Protection',
      description: 'We mask your IP address and use secure signaling to ensure your physical location remains private.',
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground p-8 md:p-24 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-12">
        <header className="text-center space-y-4">
          <h1 className="text-5xl font-black uppercase italic tracking-tighter">
            Safety &<span className="text-primary not-italic"> Trust</span>
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-medium">
            Building a secure space for human connection without compromising privacy.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {safetyFeatures.map((feature, i) => (
            <div key={i} className="p-8 bg-card border border-border rounded-3xl space-y-4 hover:border-primary/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-primary">
                <feature.icon className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold uppercase italic tracking-tight">{feature.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </section>

        <section className="bg-accent/50 border border-border p-10 rounded-[2.5rem] space-y-6">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Community Guidelines</h2>
          <p className="text-muted-foreground leading-relaxed">
            ChatJeen is designed for meaningful connections. We have zero tolerance for:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground font-medium">
            <li>Harassment or hate speech</li>
            <li>Inappropriate or adult content in public modes</li>
            <li>Botting or automated spam</li>
            <li>Doxing or sharing others' private info</li>
          </ul>
          <Link href="/guidelines">
            <Button className="mt-4 bg-primary text-primary-foreground font-bold rounded-xl py-6 px-8 h-auto uppercase tracking-widest hover:scale-105 transition-transform">
              Read Full Guidelines
            </Button>
          </Link>
        </section>

        <footer className="text-center pt-12">
          <Link href="/" className="text-primary font-bold hover:underline transition-all">
            ← Back to ChatJeen Home
          </Link>
        </footer>
      </div>
    </main>
  );
}
