'use client';

import { motion } from 'framer-motion';
import { Gavel, CheckCircle, Scale, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-background text-foreground p-6 md:p-12 lg:p-24">
            <div className="max-w-3xl mx-auto space-y-12">
                <Link href="/" className="inline-flex items-center gap-2 text-primary hover:opacity-80 transition-all font-bold uppercase tracking-widest text-xs">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Arena
                </Link>

                <header className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">
                        Terms of<span className="text-primary not-italic"> Service</span>
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium">
                        The legal framework for using the ChatJeen arena.
                    </p>
                </header>

                <section className="space-y-10">
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="space-y-4">
                        <div className="flex items-center gap-3 text-primary">
                            <Gavel className="w-6 h-6" />
                            <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            By accessing ChatJeen, you agree to bound by these terms. This is a platform for anonymous chat and gaming. Users must be at least 18 years of age (or the age of majority in their jurisdiction).
                        </p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="space-y-4">
                        <div className="flex items-center gap-3 text-primary">
                            <CheckCircle className="w-6 h-6" />
                            <h2 className="text-2xl font-bold">2. User Conduct</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            You are responsible for your interactions. Any illegal activity, harassment, or attempt to circumvent security measures will lead to instant termination of access. Anonymity is not a license for misconduct.
                        </p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="space-y-4">
                        <div className="flex items-center gap-3 text-primary">
                            <Scale className="w-6 h-6" />
                            <h2 className="text-2xl font-bold">3. Disclaimer of Liability</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            ChatJeen provides the service "as is." We do not monitor every real-time interaction and are not liable for user-generated content or interactions. Play responsibly.
                        </p>
                    </motion.div>
                </section>

                <footer className="pt-12 border-t border-border">
                    <p className="text-sm text-center text-muted-foreground font-medium italic">
                        ChatJeen © 2026. All Rights Reserved. Play fair, stay anonymous.
                    </p>
                </footer>
            </div>
        </main>
    );
}
