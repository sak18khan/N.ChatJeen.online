'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-background text-foreground p-6 md:p-12 lg:p-24">
            <div className="max-w-3xl mx-auto space-y-12">
                <Link href="/" className="inline-flex items-center gap-2 text-primary hover:opacity-80 transition-all font-bold uppercase tracking-widest text-xs">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Arena
                </Link>

                <header className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">
                        Privacy<span className="text-primary not-italic"> Policy</span>
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium">
                        Your privacy is our armor. Learn how we protect your anonymity.
                    </p>
                </header>

                <section className="space-y-10">
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="space-y-4">
                        <div className="flex items-center gap-3 text-primary">
                            <Lock className="w-6 h-6" />
                            <h2 className="text-2xl font-bold">Zero Data Collection</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            ChatJeen is built on a "Total Anonymity" foundation. We do not require sign-ups, email addresses, or phone numbers. We do not store logs of your private conversations on our servers permanently.
                        </p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="space-y-4">
                        <div className="flex items-center gap-3 text-primary">
                            <ShieldCheck className="w-6 h-6" />
                            <h2 className="text-2xl font-bold">Real-time Privacy</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            Communications are handled via secure, transient channels. Once a room is closed, that specific session data is flushed. We use standard encryption to protect your data in transit between your browser and our backend.
                        </p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="space-y-4">
                        <div className="flex items-center gap-3 text-primary">
                            <Eye className="w-6 h-6" />
                            <h2 className="text-2xl font-bold">Cookies & Tracking</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            We use minimal technical cookies required to maintain your current session and matching status. No third-party tracking or advertising cookies are deployed on ChatJeen.
                        </p>
                    </motion.div>
                </section>

                <footer className="pt-12 border-t border-border">
                    <p className="text-sm text-center text-muted-foreground font-medium italic">
                        Last Updated: March 2026. For privacy concerns, please contact our community moderators through the report system.
                    </p>
                </footer>
            </div>
        </main>
    );
}
