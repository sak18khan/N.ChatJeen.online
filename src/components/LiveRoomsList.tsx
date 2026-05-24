'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, ArrowRight, Zap, Flame, Sparkles } from 'lucide-react';
import { getActiveSocialRooms, SocialRoom } from '@/lib/matching';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function LiveRoomsList() {
  const [rooms, setRooms] = useState<SocialRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchRooms() {
      const data = await getActiveSocialRooms();
      setRooms(data);
      setLoading(false);
    }
    fetchRooms();
    
    // Refresh every 10s
    const interval = setInterval(fetchRooms, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
        <div className="w-full flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400">
            <Sparkles className="w-3 h-3" /> New Social Experience
          </div>
          <h3 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">
            Live <span className="text-yellow-400 not-italic">Rooms</span>
          </h3>
          <p className="text-white/60 text-sm font-medium max-w-md leading-relaxed">
            Not looking for 1-on-1? Jump into a group conversation and meet multiple people at once around our virtual table.
          </p>
        </div>
        
        <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/50">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#5CE65C] shadow-[0_0_8px_rgba(92,230,92,0.4)]" />
                <span>{rooms.reduce((acc, r) => acc + (r.occupancy || 0), 0)} LIVE NOW</span>
            </div>
            <button 
              onClick={() => router.push('/social-chat/new')}
              className="text-yellow-400 hover:text-yellow-300 transition-colors underline underline-offset-4"
            >
              + Create Room
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rooms.length === 0 ? (
          <div className="col-span-full bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-[3rem] p-16 text-center flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white/10 group">
              <Users className="w-10 h-10 group-hover:scale-110 transition-transform" />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-bold text-white">The table is empty</h4>
              <p className="text-sm text-white/60 max-w-xs mx-auto font-medium">Be the pioneer! Start the first social room and others will follow.</p>
            </div>
            <button 
                onClick={() => router.push('/social-chat/new')}
                className="mt-4 px-10 py-4 bg-yellow-400 text-black font-black text-xs uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(250,204,21,0.2)]"
            >
                Start a Room
            </button>
          </div>
        ) : (
          rooms.map((room, i) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative group cursor-pointer"
              onClick={() => router.push(`/social-chat/${room.id}`)}
            >
              {/* Card Glow Background */}
              <div className="absolute inset-0 bg-yellow-400/0 group-hover:bg-yellow-400/5 blur-3xl rounded-[2.5rem] transition-all duration-500" />
              
              <div className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 h-full flex flex-col gap-8 group-hover:border-white/10 transition-all overflow-hidden">
                {/* Visual Flair */}
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                   <Users className="w-16 h-16 -mr-4 -mt-4 rotate-12" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {room.occupancy && room.occupancy > 5 ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase tracking-widest border border-rose-500/20">
                        <Flame className="w-3 h-3" /> Trending
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#5CE65C]/10 text-[#5CE65C] text-[9px] font-black uppercase tracking-widest border border-[#5CE65C]/20">
                        Active
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-white/50 truncate">{room.vibe}</span>
                  </div>
                  
                  <h4 className="text-2xl font-black text-white leading-tight group-hover:text-yellow-400 transition-colors uppercase italic tracking-tighter">
                    {room.topic}
                  </h4>
                </div>

                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-3">
                            {[...Array(Math.min(room.occupancy || 0, 4))].map((_, i) => (
                                <div key={i} className="w-8 h-8 rounded-full bg-[#1A1A1A] border-2 border-[#111111] ring-2 ring-white/5 flex items-center justify-center">
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-white/10 to-transparent" />
                                </div>
                            ))}
                        </div>
                        <span className="text-xs font-bold text-white/60">
                             {room.occupancy}/{room.capacity}
                        </span>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-black group-hover:border-yellow-400 transition-all">
                        <ArrowRight className="w-5 h-5" />
                    </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
