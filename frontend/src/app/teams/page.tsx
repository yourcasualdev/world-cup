"use client";

import useSWR from "swr";
import { fetcher, API_BASE } from "@/lib/fetcher";
import { motion } from "framer-motion";
import Link from "next/link";
import { Users } from "lucide-react";

export default function TeamsPage() {
  const { data, error, isLoading } = useSWR(`${API_BASE}/standings`, fetcher, {
    refreshInterval: 60000,
  });

  const groups: any[] = data?.data || [];

  // Tüm takımları gruba göre düzleştir
  const allTeams = groups.flatMap((group: any) =>
    (group.standings || []).map((row: any) => ({
      ...row.team,
      group: group.group,
      played: row.playedGames,
      points: row.points,
      won: row.won,
      draw: row.draw,
      lost: row.lost,
      goalsFor: row.goalsFor,
      goalsAgainst: row.goalsAgainst,
      position: row.position,
    }))
  );

  return (
    <main className="min-h-screen pt-20 pb-36 px-4 sm:px-6 md:px-12 lg:px-24 max-w-[1920px] mx-auto overflow-x-hidden">
      {/* Mesh gradient background */}
      <div className="fixed top-0 right-0 w-full h-full mesh-gradient opacity-30 pointer-events-none -z-10" />

      {/* Hero Header */}
      <header className="mb-10 md:mb-16 relative z-10">
        <motion.h1
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="font-display text-[4.5rem] sm:text-8xl md:text-9xl lg:text-[12rem] leading-[0.85] uppercase tracking-tighter text-stark-white mix-blend-difference"
        >
          TEAMS
        </motion.h1>

      </header>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 48 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/3] bg-white/5 border border-white/10 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 border border-red-500/30 bg-red-500/10 text-red-500 font-body uppercase tracking-widest text-xs font-bold">
          Failed to load teams. Ensure backend is running.
        </div>
      ) : groups.length === 0 ? (
        <div className="p-20 border border-dashed border-white/10 flex flex-col items-center justify-center text-center">
          <Users size={48} className="text-white/10 mb-4" />
          <p className="font-display text-2xl text-white/40 uppercase tracking-widest">
            No teams found
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-16 relative z-10">
          {groups.map((group: any, groupIdx: number) => (
            <motion.section
              key={group.group}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIdx * 0.05, duration: 0.5 }}
            >
              {/* Group Label */}
              <div className="flex items-center gap-4 mb-6 pb-3 border-b border-white/10">
                <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-widest text-stark-white">
                  {group.group?.replace("_", " ")}
                </h2>
                <span className="font-body text-[10px] font-bold tracking-widest text-white/40 uppercase">
                  {(group.standings || []).length} teams
                </span>
              </div>

              {/* Teams Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(group.standings || [])
                  .sort((a: any, b: any) => a.position - b.position)
                  .map((row: any, idx: number) => {
                    const team = row.team;
                    return (
                      <Link
                        key={team.id}
                        href={`/teams/${team.id}`}
                        className="group relative border border-white/10 bg-pitch-black-light hover:border-neon-green/50 hover:shadow-[0_0_20px_rgba(204,255,0,0.08)] transition-all overflow-hidden"
                      >
                        {/* Position badge */}
                        <div className="absolute top-2 left-2 font-display text-4xl text-white/5 group-hover:text-neon-green/10 transition-colors select-none pointer-events-none leading-none">
                          {row.position}
                        </div>

                        {/* Green left border on hover */}
                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-neon-green scale-y-0 origin-top group-hover:scale-y-100 transition-transform duration-300" />

                        <div className="p-4 flex flex-col items-center gap-3">
                          {/* Flag */}
                          <div className="w-full aspect-[3/2] overflow-hidden border border-white/10 group-hover:border-neon-green/30 transition-colors">
                            <img
                              src={team.flagUrl}
                              alt={team.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>

                          {/* Team name */}
                          <div className="w-full text-center">
                            <span className="font-display text-xl sm:text-2xl uppercase tracking-tight text-stark-white group-hover:text-neon-green transition-colors leading-tight block">
                              {team.tla}
                            </span>
                            <span className="font-body text-[9px] font-bold tracking-widest text-white/40 uppercase block mt-0.5 truncate px-1">
                              {team.name}
                            </span>
                          </div>

                          {/* Stats */}
                          <div className="w-full grid grid-cols-3 border-t border-white/10 pt-2 mt-1">
                            {[
                              { label: "P", value: row.points },
                              { label: "W", value: row.won },
                              { label: "GP", value: row.playedGames },
                            ].map((stat) => (
                              <div key={stat.label} className="flex flex-col items-center">
                                <span className="font-display text-base text-stark-white">
                                  {stat.value ?? 0}
                                </span>
                                <span className="font-body text-[8px] font-bold tracking-widest text-white/30 uppercase">
                                  {stat.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </motion.section>
          ))}
        </div>
      )}
    </main>
  );
}
