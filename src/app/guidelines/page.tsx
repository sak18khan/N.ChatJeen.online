'use client';

import { motion } from 'framer-motion';
import { Shield, Users, Heart, Flag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function GuidelinesPage() {
    return (
        <main className="min-h-screen bg-background text-foreground p-6 md:p-12 lg:p-24">
            <div className="max-w-3xl mx-auto space-y-12">
                <Link href="/" className="inline-flex items-center gap-2 text-primary hover:opacity-80 transition-all font-bold uppercase tracking-widest text-xs">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Arena
                </Link>

                <header className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">
                        Community<span className="text-primary not-italic"> Guidelines</span>
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium">
                        Help us keep ChatJeen a safe, friendly, and anonymous space for everyone.
                    </p>
                </header>

                <section className="grid gap-8">
                    {[
                        {
                            icon: Heart,
                            title: "Be Kind & Respectful",
                            desc: "Treat every stranger as a person. Harassment, hate speech, and bullying are strictly prohibited. We value empathy and positive social interactions."
                        },
                        {
                            icon: Shield,
                            title: "Safety First",
                            desc: "Do not share personal information like your address, phone number, or financial details. Stay safe behind your anonymous shield."
                        },
                        {
                            icon: Users,
                            title: "No Inappropriate Content",
                            desc: "Keep it clean. Sharing explicit imagery, adult content, or highly suggestive material will result in an immediate permanent ban."
                        },
                        {
                            icon: Flag,
                            title: "Reporting & Moderation",
                            desc: "Use the report button if you encounter someone breaking these rules. Our team reviews flags 24/7 to maintain the integrity of the arena."
                        }
                    ].map((item, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-8 bg-card border border-border rounded-2xl shadow-sm space-y-4"
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <item.icon className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight">{item.title}</h2>
                            <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </section>

                <footer className="pt-12 border-t border-border">
                    <p className="text-sm text-center text-muted-foreground font-medium italic">
                        By using ChatJeen, you agree to uphold these standards. Welcome to the anonymous social networking arena.
                    </p>
                </footer>
            </div>
        </main>
    );
}
