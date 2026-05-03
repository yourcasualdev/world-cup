"use client";

import useSWR from "swr";
import { fetcher, API_BASE } from "@/lib/fetcher";
import GroupTable from "@/components/standings/GroupTable";
import { motion } from "framer-motion";
import Link from "next/link";

export default function StandingsPage() {
  const { data, error, isLoading } = useSWR(`${API_BASE}/standings`, fetcher, {
    refreshInterval: 60000,
  });

  const groups = data?.data || [];

  return (
    <main className="min-h-screen pt-24 pb-32 px-6 md:px-12 lg:px-24 max-w-[1920px] mx-auto">
      {/* Navigation */}
      <nav className="mb-12 relative z-10 flex justify-between items-center">
        <Link href="/" className="font-body text-sm font-bold tracking-widest text-white/50 uppercase hover:text-neon-green transition-colors flex items-center gap-2 w-fit">
          <span className="text-lg">←</span> BACK TO MATCHES
        </Link>
        <Link href="/bracket" className="font-body text-sm font-bold tracking-widest text-stark-white border border-white/20 px-4 py-2 uppercase hover:bg-white hover:text-pitch-black transition-colors w-fit">
          VIEW BRACKET →
        </Link>
      </nav>

      {/* Header */}
      <header className="mb-20 flex flex-col md:flex-row md:items-end justify-between relative z-10 border-b border-white/10 pb-12">
        <div className="flex flex-col">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-6xl md:text-8xl lg:text-9xl uppercase tracking-tighter text-stark-white"
          >
            GROUP<br/>STANDINGS
          </motion.h1>
        </div>
        <div className="font-body text-sm font-bold tracking-widest text-white/50 uppercase mt-8 md:mt-0 max-w-[200px] text-right hidden md:block">
          <p>Top 2 teams from each group advance to the Round of 32.</p>
        </div>
      </header>

      {/* Mesh Gradient Background Blob */}
      <div className="fixed top-0 right-0 w-full h-full mesh-gradient opacity-20 pointer-events-none -z-10 rotate-180"></div>

      {/* Standings Grid */}
      <section className="relative z-10">
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 bg-white/5 animate-pulse border border-white/10"></div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 border border-red-500/30 bg-red-500/10 text-red-500 font-body">
            Failed to load standings.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
            {groups.map((group: any, idx: number) => (
              <GroupTable 
                key={group.id} 
                groupName={group.name} 
                standings={group.standings} 
                index={idx} 
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
