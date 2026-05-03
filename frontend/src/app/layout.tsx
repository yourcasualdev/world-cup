import type { Metadata } from "next";
import { Anton, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Display Font (Manşetler ve Skorlar)
const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

// Body Font (Okunabilir Metinler)
const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "World Cup 2026 | Canlı Tracker",
  description: "Gerçek zamanlı Dünya Kupası takip ekranı.",
};

import MobileNav from "@/components/navigation/MobileNav";
import Navbar from "@/components/navigation/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${anton.variable} ${plusJakarta.variable} antialiased bg-pitch-black text-stark-white font-body selection:bg-neon-green selection:text-pitch-black overflow-x-hidden`}
      >
        <div className="noise-bg pointer-events-none fixed inset-0 z-50 opacity-20 mix-blend-overlay"></div>
        <Navbar />
        {children}
        <MobileNav />
      </body>
    </html>
  );
}
