"use client";

import useSWR from "swr";
import { fetcher, API_BASE } from "@/lib/fetcher";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TeamDetailPage() {
  const pathname = usePathname();
  const teamId = pathname.split('/').pop();

  const { data, error, isLoading } = useSWR(`${API_BASE}/teams/${teamId}`, fetcher);
  const team = data?.data;

  if (isLoading) {
    return <div className="min-h-screen bg-pitch-black flex items-center justify-center text-neon-green font-display text-4xl animate-pulse">LOADING ROSTER...</div>;
  }

  if (error || !team) {
    return <div className="min-h-screen bg-pitch-black flex items-center justify-center text-red-500 font-display text-4xl">TEAM NOT FOUND</div>;
  }

  const players = team.players || [];

  return (
    <main className="min-h-screen pb-32 relative overflow-hidden bg-pitch-black">
      {/* Brutalist Background Elements */}
      <div className="fixed top-0 right-0 w-[80vw] h-[80vw] bg-neon-green/5 rounded-full blur-[150px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
      <div className="noise-bg fixed inset-0 opacity-20 mix-blend-overlay pointer-events-none z-50"></div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 md:px-12 lg:px-24 pt-12">
        <Link href="/" className="font-body text-sm font-bold tracking-widest text-white/50 uppercase hover:text-neon-green transition-colors flex items-center gap-2 w-fit">
          <span className="text-lg">←</span> BACK
        </Link>
      </nav>

      {/* Hero Header */}
      <header className="relative z-10 px-6 md:px-12 lg:px-24 pt-12 pb-20 border-b border-white/10">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-8 relative">
          <motion.img 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            src={team.flagUrl} 
            alt={team.name} 
            className="w-32 md:w-48 xl:w-64 aspect-[3/2] object-cover grayscale opacity-80"
          />
          <div className="flex flex-col">
            <motion.h1 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
              className="font-display text-6xl md:text-8xl lg:text-[10rem] xl:text-[14rem] leading-[0.8] uppercase tracking-tighter text-stark-white"
            >
              {team.name}
            </motion.h1>
            {team.group && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 inline-block bg-neon-green text-pitch-black px-4 py-2 font-body font-bold uppercase tracking-widest w-fit text-sm"
              >
                {team.group.name.replace('_', ' ')}
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Massive watermark text */}
        <div className="absolute top-0 right-0 font-display text-[20rem] leading-none text-white/5 uppercase select-none pointer-events-none -z-10 -translate-y-1/4">
          {team.tla || team.name.substring(0,3)}
        </div>
      </header>

      {/* Roster Section */}
      <section className="relative z-10 px-6 md:px-12 lg:px-24 pt-20">
        <div className="flex items-end justify-between mb-16">
          <h2 className="font-display text-5xl uppercase tracking-wider text-stark-white">The Roster</h2>
          <span className="font-body text-xl font-bold text-neon-green">{players.length} PLAYERS</span>
        </div>

        {players.length === 0 ? (
          <div className="border border-white/10 bg-white/5 p-12 text-center">
            <p className="font-body text-white/50 uppercase tracking-widest">Roster data is currently unavailable for this team.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {players.map((player: any, idx: number) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.5 }}
                className="group relative border border-white/10 bg-pitch-black-light overflow-hidden hover:border-neon-green/50 transition-colors aspect-[3/4] flex flex-col justify-end p-6"
              >
                {/* Background Number Watermark */}
                <div className="absolute top-0 right-0 -mr-8 -mt-12 font-display text-[12rem] leading-none text-white/5 group-hover:text-neon-green/10 transition-colors pointer-events-none">
                  {player.shirtNum || "X"}
                </div>

                {/* Player Photo */}
                <div className="absolute inset-0 top-12 z-0 flex items-end justify-center">
                  <img 
                    src={player.photoUrl || `https://ui-avatars.com/api/?name=${player.name}&background=111111&color=ffffff&size=256`} 
                    alt={player.name} 
                    className="w-full h-full object-contain object-bottom grayscale group-hover:grayscale-0 transition-all duration-500 opacity-60 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-pitch-black-light via-pitch-black-light/50 to-transparent"></div>
                </div>

                {/* Player Info */}
                <div className="relative z-10">
                  <span className="font-display text-5xl text-neon-green block mb-2">{player.shirtNum || "-"}</span>
                  <h3 className="font-display text-3xl uppercase tracking-wide text-stark-white leading-tight mb-4">
                    {player.name}
                  </h3>
                  
                  <div className="flex gap-4 border-t border-white/20 pt-4 mt-auto">
                    <div>
                      <span className="block font-body text-[10px] text-white/40 font-bold tracking-widest uppercase">POS</span>
                      <span className="block font-body text-sm text-white/90">{player.position || "Unknown"}</span>
                    </div>
                    {player.age && (
                      <div>
                        <span className="block font-body text-[10px] text-white/40 font-bold tracking-widest uppercase">AGE</span>
                        <span className="block font-body text-sm text-white/90">{player.age}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
