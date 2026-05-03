"use client";

import { motion } from "framer-motion";

interface TeamStanding {
  position: number;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  team: {
    name: string;
    tla: string;
    flagUrl: string;
  };
}

interface GroupProps {
  groupName: string;
  standings: TeamStanding[];
  index: number;
}

export default function GroupTable({ groupName, standings, index }: GroupProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative border border-white/10 bg-pitch-black-light overflow-hidden hover:border-white/30 transition-colors"
    >
      <div className="noise-bg absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"></div>
      
      {/* Group Header */}
      <div className="bg-white/5 px-6 py-4 border-b border-white/10 relative z-10 flex justify-between items-center">
        <h3 className="font-display text-3xl uppercase tracking-widest text-stark-white">
          {groupName.replace('_', ' ')}
        </h3>
      </div>

      {/* Table Content */}
      <div className="relative z-10">
        {/* Table Head */}
        <div className="grid grid-cols-[30px_1fr_30px_30px_30px] sm:grid-cols-[40px_1fr_40px_40px_40px_40px] gap-2 px-6 py-3 border-b border-white/5 font-body text-[10px] font-bold tracking-widest text-white/30 uppercase">
          <div>#</div>
          <div>TEAM</div>
          <div className="text-center">P</div>
          <div className="text-center hidden sm:block">W</div>
          <div className="text-center hidden sm:block">D</div>
          <div className="text-center hidden sm:block">L</div>
          <div className="text-center">GD</div>
          <div className="text-center text-neon-green">PTS</div>
        </div>

        {/* Table Rows */}
        <div className="flex flex-col">
          {standings.map((row, i) => {
            const isTopTwo = row.position <= 2;
            return (
              <div 
                key={row.team.tla} 
                className={`grid grid-cols-[30px_1fr_30px_30px_30px] sm:grid-cols-[40px_1fr_40px_40px_40px_40px] gap-2 px-6 py-4 items-center border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${isTopTwo ? '' : 'opacity-60'}`}
              >
                <div className="font-display text-xl text-white/50">{row.position}</div>
                <div className="flex items-center gap-3">
                  <img src={row.team.flagUrl} alt={row.team.name} className="w-8 h-5 object-cover grayscale group-hover:grayscale-0 transition-all duration-300" />
                  <span className="font-display text-2xl uppercase tracking-wide text-stark-white">{row.team.tla}</span>
                </div>
                <div className="text-center font-body text-sm font-semibold text-white/70">{row.playedGames}</div>
                <div className="text-center font-body text-sm text-white/50 hidden sm:block">{row.won}</div>
                <div className="text-center font-body text-sm text-white/50 hidden sm:block">{row.draw}</div>
                <div className="text-center font-body text-sm text-white/50 hidden sm:block">{row.lost}</div>
                <div className="text-center font-body text-sm font-semibold text-white/70">
                  {row.goalsFor - row.goalsAgainst > 0 ? '+' : ''}{row.goalsFor - row.goalsAgainst}
                </div>
                <div className="text-center font-display text-2xl text-neon-green">{row.points}</div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
