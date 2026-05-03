"use client";

import useSWR from "swr";
import { fetcher, API_BASE } from "@/lib/fetcher";
import MatchCard from "@/components/match/MatchCard";
import { motion } from "framer-motion";
import Link from "next/link";

import { useState, useMemo } from "react";
import { Search, Filter, PlayCircle, Calendar } from "lucide-react";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "IN_PLAY" | "TIMED" | "FINISHED">("ALL");

  // Maç ve Puan Durumu verilerini paralel çek
  const { data, error, isLoading } = useSWR(`${API_BASE}/matches`, fetcher, {
    refreshInterval: 10000,
  });
  const { data: standingsData } = useSWR(`${API_BASE}/standings`, fetcher, {
    refreshInterval: 60000,
  });

  const matches = data?.data || [];

  // Standings'den takım ID -> form (son 5 sonuç) map'i oluştur
  const teamFormMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    const groups: any[] = standingsData?.data || [];
    for (const group of groups) {
      for (const row of group.standings || []) {
        const form: string[] = [];
        // won/drawn/lost sayılarından gerçek form listesi türet
        for (let i = 0; i < row.won; i++) form.push('W');
        for (let i = 0; i < row.draw; i++) form.push('D');
        for (let i = 0; i < row.lost; i++) form.push('L');
        // Son 5 maçı al (sıra bilinmiyor ama gerçek veri)
        map[row.team?.id] = form.slice(-5);
      }
    }
    return map;
  }, [standingsData]);

  // Filtreleme Logic
  const filteredMatches = useMemo(() => {
    return matches.filter((m: any) => {
      const nameMatch = 
        m.homeTeam?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        m.awayTeam?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.homeTeam?.tla?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.awayTeam?.tla?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const statusMatch = filterStatus === "ALL" || m.status === filterStatus;
      
      return nameMatch && statusMatch;
    });
  }, [matches, searchTerm, filterStatus]);

  // Timeline Grup Mantığı (Maçları tarihe göre ayır)
  const groupedMatches = filteredMatches.reduce((acc: any, match: any) => {
    const d = new Date(match.matchDate);
    const dateKey = d.toISOString().split("T")[0]; // YYYY-MM-DD
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(match);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedMatches).sort();

  return (
    <main className="min-h-screen pt-20 pb-36 px-4 sm:px-6 md:px-12 lg:px-24 max-w-[1920px] mx-auto overflow-x-hidden">
      {/* Hero Header */}
      <header className="mb-10 md:mb-20 flex flex-col gap-5 relative z-10">
        <h1 className="font-display text-[4.5rem] sm:text-8xl md:text-9xl lg:text-[12rem] leading-[0.85] uppercase tracking-tighter text-stark-white">
          WORLD<br/>CUP <span className="text-neon-green">26</span>
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          {/* SEARCH BAR */}
          <div className="relative group flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-neon-green transition-colors" size={16} />
            <input 
              type="text"
              placeholder="SEARCH TEAM..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-3 pl-10 font-body text-xs font-bold tracking-widest text-stark-white placeholder:text-white/20 focus:outline-none focus:border-neon-green/50 transition-all uppercase"
            />
          </div>

          {/* FILTER PILLS */}
          <div className="flex gap-1.5 flex-wrap">
            {[
              { id: "ALL", label: "ALL", icon: Calendar },
              { id: "IN_PLAY", label: "LIVE", icon: PlayCircle },
              { id: "TIMED", label: "SCH", icon: Calendar },
              { id: "FINISHED", label: "FT", icon: Calendar },
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => setFilterStatus(pill.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-[9px] font-bold tracking-tighter uppercase border transition-all whitespace-nowrap ${filterStatus === pill.id ? 'bg-neon-green text-pitch-black border-neon-green' : 'bg-transparent text-white/40 border-white/10 hover:border-white/30'}`}
              >
                <pill.icon size={11} />
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Mesh Gradient Background Blob */}
      <div className="fixed top-0 right-0 w-full h-full mesh-gradient opacity-30 pointer-events-none -z-10"></div>

      {/* Timeline Section */}
      <section className="relative z-10 max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-16 border-b border-white/10 pb-4">
          <h2 className="font-display text-4xl uppercase tracking-wider text-stark-white">Timeline</h2>
          <span className="font-body text-sm bg-white/10 px-3 py-1 rounded-full text-white/70">
            {filteredMatches.length} GAMES
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-8 relative pl-16 border-l border-white/10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative h-48 w-full bg-white/5 border border-white/10 overflow-hidden">
                <div className="scanline"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-1/3 h-4 bg-white/10 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 border border-red-500/30 bg-red-500/10 text-red-500 font-body uppercase tracking-widest text-xs font-bold">
            Failed to load matches. Ensure backend is running.
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="p-20 border border-dashed border-white/10 flex flex-col items-center justify-center text-center">
            <Search size={48} className="text-white/10 mb-4" />
            <p className="font-display text-2xl text-white/40 uppercase tracking-widest">No matches found</p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-10 md:pl-16 border-l border-white/20">
            {sortedDates.map((dateKey) => {
               const dateObj = new Date(dateKey);
               const formattedDate = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
               const isToday = dateKey === new Date().toISOString().split("T")[0];

               return (
                 <div key={dateKey} className="mb-14 md:mb-20 relative">
                   {/* Timeline Node */}
                   <div className={`absolute -left-[25px] sm:-left-[29px] md:-left-[33px] top-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-4 border-pitch-black ${isToday ? 'bg-neon-green shadow-[0_0_15px_#ccff00]' : 'bg-white/50'}`}></div>
                   
                   {/* Date Header */}
                   <div className="flex items-end gap-3 mb-5 md:mb-8 -mt-1">
                      <h3 className={`font-display text-3xl sm:text-4xl md:text-6xl uppercase tracking-widest leading-none ${isToday ? 'text-neon-green' : 'text-stark-white'}`}>
                        {formattedDate}
                      </h3>
                      {isToday && <span className="font-body text-[9px] font-bold text-pitch-black bg-neon-green px-2 py-1 mb-1 uppercase">Today</span>}
                   </div>
                   
                   {/* Matches List */}
                   <div className="flex flex-col gap-6 relative">
                      {groupedMatches[dateKey].map((match: any, idx: number) => (
                        <MatchCard key={match.id} match={match} index={idx} teamFormMap={teamFormMap} />
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
