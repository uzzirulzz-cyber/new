"use client";

import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/5 bg-[#050810]/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size={32} />
          <p className="text-xs text-muted-foreground">
            © 2026 Brock Exchange · <span className="bx-silver">TRADE</span> • <span className="bx-text-gradient">INVEST</span> • <span className="bx-silver">GROW</span>
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Terms</span>
            <span>Privacy</span>
            <span>Support</span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 bx-pulse-dot" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
