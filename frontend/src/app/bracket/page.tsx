"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

// Mock data generation for Bracket
const generateMockMatches = (count: number, stageName: string) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${stageName}-${i}`,
    stage: stageName,
    homeTeam: i === 0 && stageName === "ROUND_OF_32" ? { tla: "ARG", name: "Argentina", flagUrl: "https://crests.football-data.org/762.png" } : null,
    awayTeam: i === 0 && stageName === "ROUND_OF_32" ? { tla: "BRA", name: "Brazil", flagUrl: "https://crests.football-data.org/764.png" } : null,
    homeScore: i === 0 && stageName === "ROUND_OF_32" ? 2 : null,
    awayScore: i === 0 && stageName === "ROUND_OF_32" ? 1 : null,
    isTbd: !(i === 0 && stageName === "ROUND_OF_32")
  }));
};

const rounds = [
  { name: "Round of 32", matches: generateMockMatches(16, "ROUND_OF_32") },
  { name: "Round of 16", matches: generateMockMatches(8, "ROUND_OF_16") },
  { name: "Quarter Finals", matches: generateMockMatches(4, "QUARTER_FINALS") },
  { name: "Semi Finals", matches: generateMockMatches(2, "SEMI_FINALS") },
  { name: "Final", matches: generateMockMatches(1, "FINAL") },
];

export default function BracketPage() {
  return (
    <main className="min-h-screen bg-pitch-black pt-24 pb-32 overflow-hidden flex flex-col">
      {/* Noise Background */}
      <div className="noise-bg fixed inset-0 opacity-10 mix-blend-overlay pointer-events-none z-50"></div>

      {/* Navigation */}
      <nav className="px-6 md:px-12 lg:px-24 mb-12 relative z-10">
        <Link href="/" className="font-body text-sm font-bold tracking-widest text-white/50 uppercase hover:text-neon-green transition-colors flex items-center gap-2 w-fit">
          <span className="text-lg">←</span> BACK TO MATCHES
        </Link>
      </nav>

      <header className="px-6 md:px-12 lg:px-24 mb-12 relative z-10 flex justify-between items-end">
        <motion.h1 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="font-display text-6xl md:text-8xl uppercase tracking-tighter text-stark-white"
        >
          KNOCKOUT<br/>STAGE
        </motion.h1>
        <div className="hidden md:block font-body text-sm font-bold tracking-widest text-neon-green uppercase text-right">
          The Road to the Cup
        </div>
      </header>

      {/* Bracket Container (Horizontal Scroll) */}
      <div className="flex-1 w-full overflow-x-auto pb-12 cursor-grab active:cursor-grabbing px-6 md:px-12 lg:px-24 relative z-10 scrollbar-hide">
        <div className="flex gap-16 md:gap-32 min-w-max h-full items-center py-12">
          
          {rounds.map((round, rIndex) => (
            <div key={round.name} className="flex flex-col justify-around h-[1200px] w-64 relative">
              {/* Round Title */}
              <div className="absolute -top-12 left-0 font-body text-xs font-bold tracking-widest text-white/40 uppercase w-full text-center">
                {round.name}
              </div>

              {round.matches.map((match, mIndex) => (
                <div key={match.id} className="relative flex items-center w-full">
                  
                  {/* The Match Box */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: rIndex * 0.1 + mIndex * 0.05 }}
                    className={`w-full border ${match.isTbd ? 'border-white/5 bg-white/5' : 'border-white/20 bg-pitch-black-light'} relative z-10 flex flex-col transition-all hover:border-neon-green/50`}
                  >
                    {/* Home Team */}
                    <div className="flex justify-between items-center px-4 py-3 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        {match.homeTeam ? (
                          <>
                            <img src={match.homeTeam.flagUrl} alt="" className="w-6 h-4 object-cover" />
                            <span className="font-display text-xl uppercase tracking-wide text-stark-white">{match.homeTeam.tla}</span>
                          </>
                        ) : (
                          <span className="font-display text-xl uppercase tracking-wide text-white/30">TBD</span>
                        )}
                      </div>
                      <span className={`font-display text-2xl ${match.homeScore && match.awayScore && match.homeScore > match.awayScore ? 'text-neon-green' : 'text-white/50'}`}>
                        {match.homeScore ?? "-"}
                      </span>
                    </div>

                    {/* Away Team */}
                    <div className="flex justify-between items-center px-4 py-3">
                      <div className="flex items-center gap-3">
                        {match.awayTeam ? (
                          <>
                            <img src={match.awayTeam.flagUrl} alt="" className="w-6 h-4 object-cover" />
                            <span className="font-display text-xl uppercase tracking-wide text-stark-white">{match.awayTeam.tla}</span>
                          </>
                        ) : (
                          <span className="font-display text-xl uppercase tracking-wide text-white/30">TBD</span>
                        )}
                      </div>
                      <span className={`font-display text-2xl ${match.homeScore && match.awayScore && match.awayScore > match.homeScore ? 'text-neon-green' : 'text-white/50'}`}>
                        {match.awayScore ?? "-"}
                      </span>
                    </div>
                  </motion.div>

                  {/* Connector Lines (CSS only) */}
                  {/* Line going right (if not Final) */}
                  {rIndex < rounds.length - 1 && (
                    <div className="absolute -right-8 md:-right-16 top-1/2 w-8 md:w-16 h-[1px] bg-white/10 z-0"></div>
                  )}

                  {/* Vertical connecting line (Every odd match connects downwards, even upwards) */}
                  {rIndex < rounds.length - 1 && mIndex % 2 === 0 && (
                     <div className="absolute -right-8 md:-right-16 top-1/2 w-[1px] bg-white/10 z-0" 
                          style={{ height: `calc(1200px / ${round.matches.length} + 1px)` }}></div>
                  )}
                  
                </div>
              ))}
            </div>
          ))}

        </div>
      </div>
    </main>
  );
}
