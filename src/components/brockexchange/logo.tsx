"use client";

export function Logo({ size = 40, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      {/* 3D cube logo with B (blue) + E (silver) */}
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bx-blue-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2196f3" />
            <stop offset="100%" stopColor="#0D47A1" />
          </linearGradient>
          <linearGradient id="bx-silver-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E0E0E0" />
            <stop offset="100%" stopColor="#9E9E9E" />
          </linearGradient>
          <filter id="bx-glow-filter">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Cube top */}
        <polygon points="50,8 85,25 50,42 15,25" fill="url(#bx-blue-grad)" opacity="0.9" filter="url(#bx-glow-filter)" />
        {/* Cube left */}
        <polygon points="15,25 50,42 50,88 15,71" fill="url(#bx-blue-grad)" opacity="0.7" />
        {/* Cube right */}
        <polygon points="85,25 50,42 50,88 85,71" fill="url(#bx-silver-grad)" opacity="0.6" />
        {/* B letter (blue, left side) */}
        <text x="28" y="68" fontFamily="Inter, sans-serif" fontSize="24" fontWeight="900" fill="#2196f3" textAnchor="middle" filter="url(#bx-glow-filter)">B</text>
        {/* E letter (silver, right side) */}
        <text x="70" y="68" fontFamily="Inter, sans-serif" fontSize="24" fontWeight="900" fill="#E0E0E0" textAnchor="middle">E</text>
      </svg>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-base font-extrabold tracking-tight">
            <span className="bx-text-gradient">Brock</span>
            <span className="bx-silver"> Exchange</span>
          </span>
          <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Trade • Invest • Grow</span>
        </div>
      )}
    </div>
  );
}
