"use client";

import useSWR from "swr";
import { fetcher, API_BASE } from "@/lib/fetcher";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Shield, Calendar, Target, User } from "lucide-react";

function StatBox({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center p-4 border ${highlight ? 'border-neon-green/40 bg-neon-green/5' : 'border-white/10 bg-white/5'}`}>
      <span className={`font-display text-3xl md:text-4xl ${highlight ? 'text-neon-green' : 'text-stark-white'}`}>
        {value ?? "–"}
      </span>
      <span className="font-body text-[9px] font-bold tracking-widest text-white/40 uppercase mt-1">{label}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-8 pb-3 border-b border-white/10">
      <h2 className="font-display text-3xl md:text-4xl uppercase tracking-wider text-stark-white">{children}</h2>
    </div>
  );
}

export default function TeamDetailPage() {
  const pathname = usePathname();
  const teamId = pathname.split('/').pop();

  const { data, error, isLoading } = useSWR(`${API_BASE}/teams/${teamId}`, fetcher);
  const { data: standingsData } = useSWR(`${API_BASE}/standings`, fetcher);
  const { data: matchesData } = useSWR(`${API_BASE}/matches`, fetcher);

  const team = data?.data;

  // Standings'ten bu takımın istatistiklerini bul
  const teamStats = (() => {
    const groups: any[] = standingsData?.data || [];
    for (const group of groups) {
      for (const row of group.standings || []) {
        if (String(row.team?.id) === String(teamId)) {
          return { ...row, groupName: group.group };
        }
      }
    }
    return null;
  })();

  // Bu takımın maçlarını bul
  const teamMatches = (() => {
    const all: any[] = matchesData?.data || [];
    return all
      .filter((m: any) => String(m.homeTeam?.id) === String(teamId) || String(m.awayTeam?.id) === String(teamId))
      .sort((a: any, b: any) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime());
  })();


  if (isLoading) {
    return (
      <div className="min-h-screen bg-pitch-black flex items-center justify-center">
        <span className="font-display text-4xl text-neon-green animate-pulse">LOADING...</span>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-pitch-black flex items-center justify-center">
        <span className="font-display text-4xl text-red-500">TEAM NOT FOUND</span>
      </div>
    );
  }

  const players = team.players || [];

  // Pozisyona göre oyuncuları grupla
  const positionOrder = ["Goalkeeper", "Defender", "Midfielder", "Forward"];
  const groupedPlayers = positionOrder.reduce((acc: any, pos) => {
    const list = players.filter((p: any) => p.position === pos);
    if (list.length > 0) acc[pos] = list;
    return acc;
  }, {} as Record<string, any[]>);
  const uncategorized = players.filter((p: any) => !positionOrder.includes(p.position));
  if (uncategorized.length > 0) groupedPlayers["Other"] = uncategorized;

  return (
    <main className="min-h-screen pt-20 pb-36 relative overflow-x-hidden bg-pitch-black">
      {/* Background */}
      <div className="fixed top-0 right-0 w-[80vw] h-[80vw] bg-neon-green/5 rounded-full blur-[150px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3" />
      <div className="noise-bg fixed inset-0 opacity-20 mix-blend-overlay pointer-events-none z-50" />

      {/* TLA watermark */}
      <div className="fixed top-0 right-0 font-display text-[30vw] leading-none text-white/[0.03] uppercase select-none pointer-events-none -z-10 translate-x-1/4 -translate-y-1/4">
        {team.tla || team.name?.substring(0, 3)}
      </div>

      <div className="px-4 sm:px-6 md:px-12 lg:px-24 max-w-[1920px] mx-auto">

        {/* Back */}
        <nav className="mb-8">
          <Link href="/teams" className="font-body text-xs font-bold tracking-widest text-white/40 uppercase hover:text-neon-green transition-colors flex items-center gap-2 w-fit">
            <ArrowLeft size={14} /> All Teams
          </Link>
        </nav>

        {/* ── HERO ─────────────────────────────────── */}
        <header className="mb-12 md:mb-20 pb-10 border-b border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 md:gap-10">
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              src={team.flagUrl}
              alt={team.name}
              className="w-28 sm:w-36 md:w-52 aspect-[3/2] object-cover border border-white/10"
            />
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.7 }}
                className="font-display text-5xl sm:text-7xl md:text-9xl lg:text-[10rem] leading-[0.85] uppercase tracking-tighter text-stark-white"
              >
                {team.name}
              </motion.h1>
              <div className="flex flex-wrap items-center gap-3 mt-4">
                {teamStats?.groupName && (
                  <span className="font-body text-xs font-bold tracking-widest text-pitch-black bg-neon-green px-3 py-1 uppercase">
                    {teamStats.groupName.replace(/_/g, " ")}
                  </span>
                )}
                {teamStats && (
                  <span className="font-body text-xs font-bold tracking-widest text-white/50 uppercase">
                    #{teamStats.position} in group
                  </span>
                )}
                {team.coach && (
                  <span className="font-body text-xs font-bold tracking-widest text-white/40 uppercase flex items-center gap-1">
                    <User size={11} /> {team.coach}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ── STATS ─────────────────────────────────── */}
        {teamStats && (
          <section className="mb-14">
            <SectionTitle>Group Stats</SectionTitle>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
              <StatBox label="Points" value={teamStats.points} highlight />
              <StatBox label="Played" value={teamStats.playedGames} />
              <StatBox label="Won" value={teamStats.won} />
              <StatBox label="Drawn" value={teamStats.draw} />
              <StatBox label="Lost" value={teamStats.lost} />
              <StatBox label="GF" value={teamStats.goalsFor} />
              <StatBox label="GA" value={teamStats.goalsAgainst} />
            </div>
            {(teamStats.goalsFor != null && teamStats.goalsAgainst != null) && (
              <div className="mt-2 flex justify-end">
                <span className="font-body text-xs font-bold tracking-widest text-white/40 uppercase">
                  Goal Difference: <span className={`${teamStats.goalsFor - teamStats.goalsAgainst >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
                    {teamStats.goalsFor - teamStats.goalsAgainst >= 0 ? "+" : ""}{teamStats.goalsFor - teamStats.goalsAgainst}
                  </span>
                </span>
              </div>
            )}
          </section>
        )}

        {/* ── MATCHES ─────────────────────────────────── */}
        {teamMatches.length > 0 && (
          <section className="mb-14">
            <SectionTitle>Matches</SectionTitle>
            <div className="flex flex-col gap-2">
              {teamMatches.map((match: any) => {
                const isHome = String(match.homeTeam?.id) === String(teamId);
                const opponent = isHome ? match.awayTeam : match.homeTeam;
                const myScore = isHome ? match.homeScore : match.awayScore;
                const oppScore = isHome ? match.awayScore : match.homeScore;
                const finished = match.status === "FINISHED";
                const isLive = match.status === "IN_PLAY";
                const won = finished && myScore != null && oppScore != null && myScore > oppScore;
                const drew = finished && myScore != null && oppScore != null && myScore === oppScore;
                const lost = finished && myScore != null && oppScore != null && myScore < oppScore;
                const date = new Date(match.matchDate);

                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center gap-3 sm:gap-6 px-4 py-3 border ${isLive ? 'border-neon-green/40 bg-neon-green/5' : 'border-white/10 bg-white/5'} hover:border-white/30 transition-colors`}
                  >
                    {/* Result badge */}
                    <div className={`w-7 h-7 flex items-center justify-center font-display text-sm shrink-0 ${won ? 'bg-neon-green text-pitch-black' : drew ? 'bg-white/20 text-white' : lost ? 'bg-red-500/80 text-white' : isLive ? 'bg-neon-green text-pitch-black animate-pulse' : 'bg-white/5 text-white/30 border border-white/10'}`}>
                      {isLive ? "●" : finished ? (won ? "W" : drew ? "D" : "L") : "–"}
                    </div>

                    {/* Opponent flag + name */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <img src={opponent?.flagUrl} alt={opponent?.name} className="w-8 h-5 object-cover border border-white/10 shrink-0" />
                      <span className="font-display text-xl sm:text-2xl uppercase tracking-tight text-stark-white truncate">{opponent?.tla || opponent?.name}</span>
                    </div>

                    {/* Score */}
                    <div className="font-display text-2xl sm:text-3xl text-stark-white shrink-0">
                      {finished || isLive
                        ? <>{isHome ? myScore : oppScore}<span className="text-white/30 mx-1">-</span>{isHome ? oppScore : myScore}</>
                        : <span className="text-white/30 text-lg">vs</span>
                      }
                    </div>

                    {/* Date + stage */}
                    <div className="flex flex-col items-end shrink-0">
                      <span className="font-body text-[10px] font-bold tracking-widest text-white/40 uppercase">
                        {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <span className="font-body text-[9px] font-bold tracking-widest text-white/25 uppercase mt-0.5">
                        {match.stage?.replace(/_/g, " ")}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── ROSTER ─────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-8 pb-3 border-b border-white/10">
            <h2 className="font-display text-3xl md:text-4xl uppercase tracking-wider text-stark-white">Roster</h2>
            <span className="font-body text-sm font-bold text-neon-green">{players.length} players</span>
          </div>

          {players.length === 0 ? (
            <div className="border border-white/10 bg-white/5 p-12 text-center">
              <Shield size={40} className="text-white/10 mx-auto mb-3" />
              <p className="font-body text-white/40 uppercase tracking-widest text-sm">Roster unavailable</p>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              {Object.entries(groupedPlayers).map(([position, posPlayers]: [string, any]) => (
                <div key={position}>
                  <h3 className="font-body text-xs font-bold tracking-widest text-neon-green uppercase mb-3">
                    {position} <span className="text-white/30">— {posPlayers.length}</span>
                  </h3>
                  <div className="flex flex-col gap-1">
                    {posPlayers
                      .sort((a: any, b: any) => (a.shirtNum || 99) - (b.shirtNum || 99))
                      .map((player: any, idx: number) => (
                        <motion.div
                          key={player.id}
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="group flex items-center gap-4 px-4 py-3 border border-white/10 bg-white/5 hover:border-neon-green/40 hover:bg-neon-green/5 transition-all"
                        >
                          {/* Shirt number */}
                          <span className="font-display text-2xl text-white/20 group-hover:text-neon-green transition-colors w-8 text-right shrink-0">
                            {player.shirtNum || "–"}
                          </span>

                          {/* Photo */}
                          <img
                            src={player.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=111111&color=ccff00&size=64&bold=true`}
                            alt={player.name}
                            className="w-9 h-9 object-cover rounded-full border border-white/10 group-hover:border-neon-green/30 transition-colors shrink-0"
                          />

                          {/* Name */}
                          <span className="font-display text-xl sm:text-2xl uppercase tracking-tight text-stark-white flex-1 leading-none">
                            {player.name}
                          </span>

                          {/* Age */}
                          {player.age && (
                            <span className="font-body text-xs font-bold tracking-widest text-white/30 uppercase shrink-0">
                              {player.age}y
                            </span>
                          )}
                        </motion.div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
