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

  return (
    <main className="min-h-screen pt-24 pb-32 px-6 md:px-12 lg:px-24 max-w-[1920px] mx-auto">
      {/* Hero Header */}
      <header className="mb-20 flex flex-col gap-6 md:flex-row md:items-end justify-between relative z-10">
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
          className="font-body text-sm font-bold tracking-widest text-white/50 uppercase max-w-xs"
        >
          <p className="mb-6">Real-time tournament tracking with brutal precision.</p>
          <Link href="/standings" className="inline-block border border-neon-green/30 text-neon-green px-6 py-3 hover:bg-neon-green hover:text-pitch-black transition-all duration-300">
            VIEW STANDINGS →
          </Link>
        </motion.div>
      </header>

      {/* Mesh Gradient Background Blob */}
      <div className="fixed top-0 right-0 w-full h-full mesh-gradient opacity-30 pointer-events-none -z-10"></div>

      {/* Matches Grid */}
      <section className="relative z-10">
        <div className="flex items-center gap-4 mb-12 border-b border-white/10 pb-4">
          <h2 className="font-display text-4xl uppercase tracking-wider text-stark-white">Featured Matches</h2>
          <span className="font-body text-sm bg-white/10 px-3 py-1 rounded-full text-white/70">
            {matches.length} GAMES
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-white/5 animate-pulse border border-white/10"></div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 border border-red-500/30 bg-red-500/10 text-red-500 font-body">
            Failed to load matches. Ensure backend is running at {API_BASE}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {matches.slice(0, 12).map((match: any, idx: number) => (
              <MatchCard key={match.id} match={match} index={idx} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
