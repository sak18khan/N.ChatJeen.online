'use client';

import { motion } from 'framer-motion';
import { Quote, Star, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestimonialCardProps {
    content: string;
    author: string;
    age: number;
    avatarColor?: string;
    rating?: number;
    delay?: number;
    className?: string;
}

export default function TestimonialCard({ content, author, age, avatarColor = '#F59E0B', rating = 5, delay = 0, className }: TestimonialCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.6, ease: "easeOut" }}
            className={cn(
                "p-8 bg-[#111111] rounded-[2rem] relative text-left mt-6 flex flex-col h-full border border-white/5 hover:border-yellow-400/20 transition-all group overflow-hidden",
                className
            )}
        >
            {/* Watermark Quote Icon */}
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Quote className="w-24 h-24 text-white rotate-180" />
            </div>

            {/* Stars */}
            <div className="flex gap-1 mb-6 text-yellow-400 relative z-10">
                {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                ))}
            </div>

            {/* Content */}
            <p className="text-white/60 text-[15px] leading-relaxed mb-10 flex-1 relative z-10 font-medium">
                "{content}"
            </p>

            {/* Footer */}
            <div className="flex items-center gap-4 mt-auto relative z-10">
                <div className="relative pointer-events-none">
                    <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg border-2 border-[#111111]" 
                        style={{ backgroundColor: avatarColor }}
                    >
                        {author[0]}
                    </div>
                    {/* Small inner dot */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#22c55e] rounded-full border-[2.5px] border-[#111111]" />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                    <h4 className="font-bold text-white text-[15px] tracking-tight">{author}, {age}</h4>
                    <div className="flex items-center gap-1 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-yellow-400 stroke-[3]" />
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Verified User</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
