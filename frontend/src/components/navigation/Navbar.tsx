"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navItems = [
  { name: "Matches", href: "/" },
  { name: "Standings", href: "/standings" },
  { name: "Bracket", href: "/bracket" },
  { name: "Teams", href: "/teams" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-[90] glass-brutalism border-b border-white/10">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <span className="font-display text-2xl tracking-tighter text-stark-white group-hover:text-neon-green transition-colors">
            WC<span className="text-neon-green">26</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative px-5 py-2 font-body text-xs font-bold tracking-widest uppercase transition-colors ${
                  isActive ? "text-neon-green" : "text-white/50 hover:text-stark-white"
                }`}
              >
                {item.name}
                {isActive && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-neon-green"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Live Pill */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green"></span>
          </span>
          <span className="font-body text-[10px] font-bold tracking-widest text-white/40 uppercase hidden sm:block">
            Live Data
          </span>
        </div>
      </div>
    </header>
  );
}
