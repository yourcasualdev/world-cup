"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, GitBranch, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Matches", href: "/", icon: Home },
    { name: "Standings", href: "/standings", icon: Trophy },
    { name: "Bracket", href: "/bracket", icon: GitBranch },
    { name: "Teams", href: "/teams", icon: Users },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden px-4 pb-6 pt-2 pointer-events-none">
      <div className="glass-brutalism max-w-lg mx-auto flex items-center justify-around p-2 border-t-2 border-neon-green/20 pointer-events-auto shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className="relative flex flex-col items-center p-2 gap-1 group"
            >
              <div className={`p-2 transition-all duration-300 ${isActive ? 'text-neon-green' : 'text-white/40 group-hover:text-white'}`}>
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`font-body text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-neon-green' : 'text-white/20'}`}>
                {item.name}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="mobile-active-tab"
                  className="absolute inset-0 bg-neon-green/5 -z-10 border-b-2 border-neon-green"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
