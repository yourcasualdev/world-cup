"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface Team {
  name: string;
  tla: string;
  flagUrl: string;
}

interface MatchProps {
  match: {
    id: string;
    status: string;
    matchDate: string;
    homeScore: number | null;
    awayScore: number | null;
    stage: string;
    homeTeam: Team;
    awayTeam: Team;
  };
  index: number;
}

export default function MatchCard({ match, index }: MatchProps) {
  const isLive = match.status === "IN_PLAY";
  const date = new Date(match.matchDate);
  const timeString = date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

  const homeWon = match.homeScore !== null && match.awayScore !== null && match.homeScore > match.awayScore;
  const awayWon = match.homeScore !== null && match.awayScore !== null && match.awayScore > match.homeScore;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: "easeOut" }}
      className="group relative w-full flex flex-col md:flex-row border border-white/10 bg-pitch-black-light hover:border-neon-green/50 hover:shadow-[0_0_30px_rgba(204,255,0,0.1)] transition-all"
    >
      {/* Noise Texture Overlay */}
      <div className="noise-bg absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none z-0"></div>

      {/* Timeline Left Connector Line for Hover Effect */}
      <div className="absolute -left-[1px] top-0 bottom-0 w-[2px] bg-neon-green scale-y-0 origin-top group-hover:scale-y-100 transition-transform duration-300 z-10"></div>

      {/* Time & Status Column */}
      <div className="w-full md:w-32 bg-white/5 p-4 md:p-6 flex flex-row md:flex-col justify-between md:justify-start gap-4 shrink-0 border-b md:border-b-0 md:border-r border-white/10 relative z-10">
        <div className="font-display text-3xl text-white/60">{timeString}</div>
        <div className="flex items-center gap-2">
          {isLive ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green"></span>
              </span>
              <span className="font-body text-xs font-bold tracking-widest text-neon-green uppercase">LIVE</span>
            </>
          ) : (
            <span className="font-body text-xs font-bold tracking-widest text-white/40 uppercase">
              {match.status === "FINISHED" ? "FT" : "UPCOMING"}
            </span>
          )}
        </div>
      </div>

      {/* Teams Column */}
      <div className="flex-1 flex flex-col justify-center relative p-4 md:p-6 md:px-8 z-10">
        {/* Home */}
        <div className="flex items-center justify-between mb-4">
          <Link href={`/teams/${match.homeTeam.id}`} className="flex items-center gap-4 group/team">
            <img src={match.homeTeam.flagUrl} alt={match.homeTeam.name} className="w-10 h-6 object-cover border border-white/10" />
            <span className={`font-display text-4xl sm:text-5xl uppercase tracking-tight transition-colors duration-300 group-hover/team:text-neon-green ${homeWon ? 'text-stark-white' : 'text-white/70'}`}>
              {match.homeTeam.tla}
            </span>
          </Link>
          <div className={`font-display text-4xl sm:text-5xl ${homeWon ? 'text-neon-green' : 'text-stark-white'}`}>
            {match.homeScore ?? "-"}
          </div>
        </div>

        {/* Away */}
        <div className="flex items-center justify-between">
          <Link href={`/teams/${match.awayTeam.id}`} className="flex items-center gap-4 group/team">
            <img src={match.awayTeam.flagUrl} alt={match.awayTeam.name} className="w-10 h-6 object-cover border border-white/10" />
            <span className={`font-display text-4xl sm:text-5xl uppercase tracking-tight transition-colors duration-300 group-hover/team:text-neon-green ${awayWon ? 'text-stark-white' : 'text-white/70'}`}>
              {match.awayTeam.tla}
            </span>
          </Link>
          <div className={`font-display text-4xl sm:text-5xl ${awayWon ? 'text-neon-green' : 'text-stark-white'}`}>
            {match.awayScore ?? "-"}
          </div>
        </div>
      </div>

      {/* Stage Info Column */}
      <div className="w-full md:w-48 p-4 md:p-6 bg-white/5 border-t md:border-t-0 md:border-l border-white/10 flex flex-row md:flex-col justify-between items-center md:items-end shrink-0 relative z-10">
        <span className="font-body text-xs font-bold tracking-widest text-white/40 uppercase md:text-right leading-relaxed">
          {match.stage.replace(/_/g, ' ')}
        </span>
      </div>
    </motion.div>
  );
}
