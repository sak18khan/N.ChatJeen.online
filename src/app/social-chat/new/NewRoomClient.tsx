'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSocialRoom } from '@/lib/matching';
import { ArrowRight, Sparkles, MessageSquare } from 'lucide-react';

export default function NewRoomClient() {
  const [topic, setTopic] = useState('');
  const [vibe, setVibe] = useState('Any');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    const room = await createSocialRoom(topic, vibe);
    if (room) {
      router.push(`/social-chat/${room.id}`);
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-12">
      <header className="text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-yellow-400 text-black flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(250,204,21,0.2)]">
              <MessageSquare className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">Start a <span className="text-yellow-400 not-italic">Room</span></h1>
          <p className="text-white/50 text-sm font-medium uppercase tracking-[0.2em]">What's on your mind?</p>
      </header>

      <form onSubmit={handleCreate} className="space-y-8">
          <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 ml-4">Room Topic</label>
              <input 
                  autoFocus
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Late Night Talks, Startup Ideas..."
                  className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-5 text-lg font-bold placeholder:text-white/10 outline-none focus:border-yellow-400/50 focus:ring-4 ring-yellow-400/5 transition-all"
              />
          </div>

          <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 ml-4">Quick Vibe</label>
              <div className="flex flex-wrap gap-3">
                  {['Any', 'Chill', 'Deep', 'Gaming', 'Funny'].map(v => (
                      <button 
                          key={v}
                          type="button"
                          onClick={() => setVibe(v)}
                          className={`px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${vibe === v ? 'bg-yellow-400 text-black' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                      >
                          {v}
                      </button>
                  ))}
              </div>
          </div>

          <button 
              type="submit"
              disabled={!topic.trim() || loading}
              className="w-full bg-white text-black font-black text-lg py-5 rounded-[2rem] flex items-center justify-center gap-3 disabled:opacity-20 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl"
          >
              {loading ? 'Opening Room...' : 'Go Live'}
              {!loading && <Sparkles className="w-5 h-5 fill-black" />}
          </button>
      </form>

      <button 
        onClick={() => router.back()}
        className="w-full text-[10px] font-black uppercase tracking-[0.4em] text-white/50 hover:text-white/70 transition-colors"
      >
        Nevermind, go back
      </button>
    </div>
  );
}
