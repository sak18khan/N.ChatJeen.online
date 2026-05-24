'use client';

import { useEffect, useState, Suspense, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Laptop, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { rtdb } from '@/lib/firebaseClient';
import { ref, onValue, off, remove } from 'firebase/database';
import { findMatch, ChatMode, updatePing } from '@/lib/matching';
import { Button } from '@/components/ui/button';

function MatchingContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    // Extracted query parameters
    const mode = (searchParams.get('mode') as ChatMode) || 'text';
    const vibe = searchParams.get('vibe') || 'Any';
    
    // Q&A Match parameters
    const questionText = searchParams.get('q') || '';
    const answerText = searchParams.get('a') || '';
    
    // Debate Mode parameters
    const debateTopic = searchParams.get('topic') || '';
    const debateStance = (searchParams.get('stance') as 'Pro' | 'Con' | 'Random') || 'Random';

    // Interest tags & Country filter parameters
    const interests = searchParams.get('interests') || '';
    const country = searchParams.get('country') || '';
    
    const [userId, setUserId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<'initializing' | 'searching'>('initializing');
    const [myIdentity, setMyIdentity] = useState<{flag: string, countryInitial: string} | null>(null);
    
    // Use stable ID and prevent double-matching
    const myId = useMemo(() => uuidv4(), []);
    const matchStarted = useRef(false);

    useEffect(() => {
        async function loadIdentity() {
            try {
                const { detectIdentity } = await import('@/lib/identity');
                const identity = await detectIdentity();
                setMyIdentity(identity);
            } catch (e) {
                console.warn('Identity load fallback activated', e);
            }
        }
        loadIdentity();
    }, []);

    useEffect(() => {
        if (matchStarted.current) return;
        matchStarted.current = true;
        
        setUserId(myId);
        
        let pingInterval: NodeJS.Timeout;
        let myQueueRef: any;

        const startMatching = async () => {
            setStatus('searching');
            
            // Sync status to Redis
            fetch('/api/user-state', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: myId, state: 'WAITING' })
            }).catch(console.warn);
            
            // Anti-spam cooldown (reduced to 1s)
            const lastMatchStr = localStorage.getItem('chatjeen_last_match_time');
            if (lastMatchStr) {
                const lastMatchInt = parseInt(lastMatchStr, 10);
                if (Date.now() - lastMatchInt < 1000) {
                    setError('Please wait a moment before searching again.');
                    return;
                }
            }
            localStorage.setItem('chatjeen_last_match_time', Date.now().toString());

            try {
                // Prepare answers or debate configurations
                const answers = questionText && answerText ? { question: questionText, answer: answerText } : null;
                const debate = vibe === 'Debate' ? { topic: debateTopic, stance: debateStance } : null;

                // Start heartbeat ping and state sync
                pingInterval = setInterval(() => {
                    updatePing(myId);
                    fetch('/api/user-state', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: myId, state: 'WAITING' })
                    }).catch(console.warn);
                }, 10000);

                // 1. Try immediate match & insert waitlist
                const room = await findMatch(myId, mode, vibe, answers, debate, interests, country);
                
                if (room) {
                    clearInterval(pingInterval);
                    router.push(`/${mode}/${room.id}?me=${myId}`);
                } else {
                    // 2. Subscribe for match via Firebase /queue/${myId}
                    myQueueRef = ref(rtdb, `queue/${myId}`);
                    onValue(myQueueRef, (snapshot) => {
                        if (snapshot.exists()) {
                            const val = snapshot.val();
                            if (val.status === 'matched' && val.roomId) {
                                clearInterval(pingInterval);
                                off(myQueueRef);
                                // Cleanup waitlist entry
                                remove(myQueueRef);
                                router.push(`/${mode}/${val.roomId}?me=${myId}`);
                            }
                        }
                    }, (err) => {
                        console.error("Queue sub failed:", err);
                        setError(`Database connection failed: ${err.message}. Please configure Firebase Realtime Database Rules to public (read/write = true).`);
                    });
                }
            } catch (err: any) {
                console.error("Firebase Matching Error:", err);
                setError(`Connection failed: ${err.message || err}. Please ensure your Firebase Realtime Database rules allow read and write access.`);
            }
        };

        startMatching();

        // Proper React Cleanup
        return () => {
            if (pingInterval) clearInterval(pingInterval);
            if (myQueueRef) {
                off(myQueueRef);
                remove(myQueueRef); // Remove from queue on exit
            }
            // Clean up interests and country keys when leaving search
            import('firebase/database').then(({ ref: dbRef, remove: dbRemove }) => {
                dbRemove(dbRef(rtdb, `interests/${myId}`));
                dbRemove(dbRef(rtdb, `country/${myId}`));
            });
            // Clear status in Redis
            fetch('/api/user-state', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: myId, state: 'OFFLINE' })
            }).catch(console.warn);
        };
    }, [mode, vibe, questionText, answerText, debateTopic, debateStance, interests, country, router, myId]);

    if (error) {
        return (
            <div className="flex flex-col items-center gap-6 p-8 text-center max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold">Something went wrong</h2>
                <p className="text-muted-foreground">{error}</p>
                <Button onClick={() => router.push('/')} variant="default" className="w-full">
                    Return Home
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-12 max-w-lg w-full">
            {/* Professional Branding */}
            <header className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                    Chat<span className="text-primary">Jeen</span>
                </h1>
                <p className="text-muted-foreground font-medium">Establishing secure link...</p>
            </header>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-8 p-12 bg-card border border-border rounded-2xl shadow-xl w-full"
            >
                <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-4 border-accent rounded-full" />
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full shadow-[0_0_15px_rgba(92,230,92,0.3)]"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Zap className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                </div>

                <div className="text-center space-y-4">
                    <div className="flex flex-col items-center gap-2">
                        <div className="px-3 py-1 bg-primary/10 rounded-full border border-primary/20 flex items-center gap-2">
                            <span className="text-lg">{myIdentity?.flag || '🌐'}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                                {myIdentity?.countryInitial || 'GLOBAL'} MATCH : {mode.toUpperCase()} MODE
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">Finding a match...</h2>
                    </div>
                    <p className="text-muted-foreground text-sm font-medium">
                        Looking for a <span className="text-primary font-bold uppercase">{mode}</span> stranger for you.
                    </p>
                </div>

                <div className="w-full space-y-4 pt-4">
                    <div className="flex items-center gap-3 p-4 bg-accent/30 rounded-xl border border-primary/10">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Identity Hidden & Secured</span>
                    </div>
                    <Button 
                        onClick={() => router.push('/')} 
                        variant="ghost" 
                        className="w-full text-muted-foreground hover:text-foreground hover:bg-muted font-bold uppercase text-[10px] tracking-widest"
                    >
                        Cancel Search
                    </Button>
                </div>
            </motion.div>

            {/* Trust Footer */}
            <div className="flex flex-wrap justify-center gap-6 opacity-40">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Secure Matchmaking</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                    <Laptop className="w-3 h-3" />
                    <span>Real-time Stack</span>
                </div>
            </div>
        </div>
    );
}

export default function MatchingPage() {
    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Decorative background pulse */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            
            <Suspense fallback={<div>Initializing...</div>}>
                <MatchingContent />
            </Suspense>
        </main>
    );
}
