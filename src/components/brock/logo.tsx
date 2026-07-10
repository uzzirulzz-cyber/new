"use client";

import { cn } from "@/lib/utils";

export function Logo({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("drop-shadow-[0_0_12px_rgba(33,150,243,0.6)]", className)}
      aria-label="Brock Exchange logo"
    >
      <defs>
        <linearGradient id="bx-cube-blue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#42a5f5" />
          <stop offset="60%" stopColor="#2196f3" />
          <stop offset="100%" stopColor="#0d47a1" />
        </linearGradient>
        <linearGradient id="bx-cube-silver" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#e0e0e0" />
          <stop offset="100%" stopColor="#9e9e9e" />
        </linearGradient>
        <linearGradient id="bx-cube-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#64b5f6" />
          <stop offset="100%" stopColor="#1976d2" />
        </linearGradient>
        <linearGradient id="bx-cube-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1565c0" />
          <stop offset="100%" stopColor="#0d47a1" />
        </linearGradient>
      </defs>

      {/* 3D cube — top face */}
      <path d="M32 4 L58 16 L32 28 L6 16 Z" fill="url(#bx-cube-top)" />
      {/* left face */}
      <path d="M6 16 L32 28 L32 58 L6 46 Z" fill="url(#bx-cube-side)" opacity="0.92" />
      {/* right face (with B/E) */}
      <path d="M32 28 L58 16 L58 46 L32 58 Z" fill="url(#bx-cube-blue)" />
      {/* edge highlight */}
      <path d="M32 4 L58 16 L32 28 L6 16 Z" stroke="rgba(255,255,255,0.35)" strokeWidth="0.6" fill="none" />
      <path d="M6 16 L32 28 L32 58" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" fill="none" />
      <path d="M32 28 L58 16 L58 46 L32 58" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6" fill="none" />

      {/* B (blue, on right face upper) */}
      <text
        x="45"
        y="34"
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="900"
        fontSize="14"
        fill="#ffffff"
        opacity="0.95"
      >
        B
      </text>
      {/* E (silver, on right face lower) */}
      <text
        x="45"
        y="52"
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="900"
        fontSize="14"
        fill="url(#bx-cube-silver)"
      >
        E
      </text>
    </svg>
  );
}

export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return <Logo size={size} className={className} />;
}

export function BrandWordmark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Logo size={size} />
      <div className="flex flex-col leading-none">
        <span className="font-extrabold text-base tracking-tight">
          <span className="bx-text-gradient">BROCK</span>
          <span className="bx-text-silver ml-1">EXCHANGE</span>
        </span>
        <span className="text-[9px] tracking-[0.35em] text-muted-foreground mt-0.5">
          TRADE • INVEST • GROW
        </span>
      </div>
    </div>
  );
}
