"use client";

import useSWR from "swr";
import { fetcher, API_BASE } from "@/lib/fetcher";
import MatchCard from "@/components/match/MatchCard";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  // Canlı (IN_PLAY) veya yaklaşan maçları çek
  const { data, error, isLoading } = useSWR(`${API_BASE}/matches`, fetcher, {
    refreshInterval: 30000, // Her 30 saniyede bir polling (Redis üzerinden süper hızlı dönecek)
  });

  const matches = data?.data || [];

  // Timeline Grup Mantığı (Maçları tarihe göre ayır)
  const groupedMatches = matches.reduce((acc: any, match: any) => {
    const d = new Date(match.matchDate);
    const dateKey = d.toISOString().split("T")[0]; // YYYY-MM-DD
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(match);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedMatches).sort();

  return (
    <main className="min-h-screen pt-24 pb-32 px-6 md:px-12 lg:px-24 max-w-[1920px] mx-auto overflow-hidden">
      {/* Hero Header */}
      <header className="mb-24 flex flex-col gap-6 md:flex-row md:items-end justify-between relative z-10">
        <div className="flex flex-col">
          <motion.h1 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-display text-7xl md:text-9xl lg:text-[12rem] leading-[0.8] uppercase tracking-tighter text-stark-white mix-blend-difference"
          >
            WORLD<br/>CUP <span className="text-neon-green">26</span>
          </motion.h1>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="font-body text-sm font-bold tracking-widest text-white/50 uppercase max-w-sm"
        >
          <p className="mb-6">Real-time tournament tracking with brutal precision.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/standings" className="inline-block border border-neon-green/30 text-neon-green px-6 py-3 hover:bg-neon-green hover:text-pitch-black transition-all duration-300 text-center whitespace-nowrap">
              STANDINGS →
            </Link>
            <Link href="/bracket" className="inline-block border border-white/20 text-stark-white px-6 py-3 hover:bg-white hover:text-pitch-black transition-all duration-300 text-center whitespace-nowrap">
              BRACKET →
            </Link>
          </div>
        </motion.div>
      </header>

      {/* Mesh Gradient Background Blob */}
      <div className="fixed top-0 right-0 w-full h-full mesh-gradient opacity-30 pointer-events-none -z-10"></div>

      {/* Timeline Section */}
      <section className="relative z-10 max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-16 border-b border-white/10 pb-4">
          <h2 className="font-display text-4xl uppercase tracking-wider text-stark-white">Timeline</h2>
          <span className="font-body text-sm bg-white/10 px-3 py-1 rounded-full text-white/70">
            {matches.length} GAMES
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 w-full bg-white/5 animate-pulse border border-white/10"></div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 border border-red-500/30 bg-red-500/10 text-red-500 font-body">
            Failed to load matches. Ensure backend is running at {API_BASE}
          </div>
        ) : (
          <div className="relative pl-8 md:pl-16 border-l border-white/20">
            {sortedDates.map((dateKey) => {
               const dateObj = new Date(dateKey);
               const formattedDate = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
               const isToday = dateKey === new Date().toISOString().split("T")[0];

               return (
                 <div key={dateKey} className="mb-20 relative">
                   {/* Timeline Node (Point on the line) */}
                   <div className={`absolute -left-[37px] md:-left-[69px] top-1 w-5 h-5 rounded-full border-4 border-pitch-black ${isToday ? 'bg-neon-green shadow-[0_0_15px_#ccff00]' : 'bg-white/50'}`}></div>
                   
                   {/* Date Header */}
                   <div className="flex items-end gap-4 mb-8 -mt-2">
                      <h3 className={`font-display text-4xl md:text-6xl uppercase tracking-widest ${isToday ? 'text-neon-green' : 'text-stark-white'}`}>
                        {formattedDate}
                      </h3>
                      {isToday && <span className="font-body text-xs font-bold text-pitch-black bg-neon-green px-2 py-1 mb-2 uppercase">Today</span>}
                   </div>
                   
                   {/* Matches List for this Date */}
                   <div className="flex flex-col gap-6 relative">
                      {groupedMatches[dateKey].map((match: any, idx: number) => (
                        <MatchCard key={match.id} match={match} index={idx} />
                      ))}
                   </div>
                 </div>
               );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
