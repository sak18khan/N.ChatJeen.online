'use client';

import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestimonialCardProps {
    content: string;
    author: string;
    role: string;
    rating?: number;
    delay?: number;
    className?: string;
}

export default function TestimonialCard({ content, author, role, rating = 5, delay = 0, className }: TestimonialCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            className={cn(
                "p-8 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-all relative group overflow-hidden",
                className
            )}
        >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Quote className="w-16 h-16 text-primary rotate-180" />
            </div>

            <div className="flex gap-1 mb-6 text-primary">
                {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                ))}
            </div>

            <p className="text-muted-foreground italic mb-8 relative z-10 font-medium leading-relaxed">
                "{content}"
            </p>

            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-primary font-black italic border border-primary/20">
                    {author[0]}
                </div>
                <div>
                    <h4 className="font-bold text-sm tracking-tight">{author}</h4>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{role}</p>
                </div>
            </div>
        </motion.div>
    );
}
