import { Metadata } from 'next';
import { Suspense } from 'react';
import MatchingClient from './MatchingClient';

export const metadata: Metadata = {
  title: 'Finding Your Match... | ChatJeen',
  robots: {
    index: false,
    follow: false
  }
};

export default function MatchingPage() {
    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Decorative background pulse */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            
            <Suspense fallback={<div className="text-muted-foreground font-medium uppercase tracking-widest text-xs animate-pulse">Initializing Arena...</div>}>
                <MatchingClient />
            </Suspense>
        </main>
    );
}
