"use client";

import { motion } from "framer-motion";

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
  const dateString = date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      className="group relative flex flex-col justify-between overflow-hidden border border-white/10 bg-pitch-black-light p-6 transition-all hover:border-neon-green/50 hover:shadow-[0_0_30px_rgba(204,255,0,0.15)]"
    >
      {/* Noise Texture Overlay */}
      <div className="noise-bg absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"></div>

      {/* Header (Status & Date) */}
      <div className="flex items-center justify-between mb-8 z-10">
        <div className="flex items-center gap-3">
          {isLive ? (
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-green"></span>
              </span>
              <span className="font-body text-sm font-bold tracking-widest text-neon-green uppercase">
                LIVE
              </span>
            </div>
          ) : (
            <span className="font-body text-sm font-bold tracking-widest text-white/40 uppercase">
              {match.status === "FINISHED" ? "FT" : "UPCOMING"}
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="font-display text-xl uppercase tracking-wider text-white/60">{timeString}</p>
          <p className="font-body text-xs font-semibold text-white/40 uppercase tracking-widest">{dateString}</p>
        </div>
      </div>

      {/* Teams & Score (The Brutalist Core) */}
      <div className="flex flex-col gap-4 z-10">
        {/* Home Team */}
        <div className="flex items-center justify-between">
          <Link href={`/teams/${match.homeTeam.id}`} className="flex items-center gap-4 group/team">
            <img src={match.homeTeam.flagUrl} alt={match.homeTeam.name} className="w-12 h-8 object-cover grayscale group-hover/team:grayscale-0 transition-all duration-500" />
            <span className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-stark-white group-hover/team:text-neon-green transition-colors duration-300">
              {match.homeTeam.tla}
            </span>
          </Link>
          <span className="font-display text-5xl sm:text-6xl lg:text-7xl text-stark-white">
            {match.homeScore ?? "-"}
          </span>
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-between">
          <Link href={`/teams/${match.awayTeam.id}`} className="flex items-center gap-4 group/team">
            <img src={match.awayTeam.flagUrl} alt={match.awayTeam.name} className="w-12 h-8 object-cover grayscale group-hover/team:grayscale-0 transition-all duration-500" />
            <span className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-stark-white group-hover/team:text-neon-green transition-colors duration-300">
              {match.awayTeam.tla}
            </span>
          </Link>
          <span className="font-display text-5xl sm:text-6xl lg:text-7xl text-white/50">
            {match.awayScore ?? "-"}
          </span>
        </div>
      </div>

      {/* Stage Badge */}
      <div className="mt-8 pt-4 border-t border-white/10 z-10">
        <span className="font-body text-xs font-bold tracking-widest text-white/30 uppercase">
          {match.stage.replace(/_/g, ' ')}
        </span>
      </div>
    </motion.div>
  );
}
