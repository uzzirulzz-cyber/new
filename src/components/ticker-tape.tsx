"use client";

import { useEffect, useState } from "react";
import { marketPairs } from "@/lib/dashboard-data";
import { fmtUsd } from "@/lib/format";

/**
 * Top-of-page scrolling ticker tape showing all market pairs with
 * live 24h change. Pure CSS animation, pauses on hover.
 *
 * The list is duplicated so the marquee can loop seamlessly.
 */
export function TickerTape() {
  const [tick, setTick] = useState(0);

  // Tiny live wiggle so prices don't look frozen
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2000);
    return () => clearInterval(id);
  }, []);

  const items = marketPairs.map((m) => {
    const wiggle = Math.sin(tick * 0.5 + m.lastPrice) * m.lastPrice * 0.0004;
    const price = m.lastPrice + wiggle;
    const up = m.change24h >= 0;
    return {
      pair: m.pair,
      icon: m.icon,
      iconColor: m.iconColor,
      price,
      change: m.change24h,
      up,
    };
  });

  // Duplicate for seamless loop
  const loop = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-b border-border bg-[#020617] h-9">
      <div className="ticker-track whitespace-nowrap h-full items-center flex">
        {loop.map((it, i) => (
          <span
            key={`${it.pair}-${i}`}
            className="inline-flex items-center gap-1.5 px-4 text-[11px] font-mono border-r border-border/40 h-full"
          >
            <span
              className="h-3.5 w-3.5 flex items-center justify-center rounded-full text-[8px] font-bold"
              style={{ background: `${it.iconColor}25`, color: it.iconColor }}
            >
              {it.icon}
            </span>
            <span className="text-slate-300 font-medium">{it.pair}</span>
            <span className="text-white">{fmtUsd(it.price)}</span>
            <span className={it.up ? "text-emerald-400" : "text-red-400"}>
              {it.up ? "▲" : "▼"} {Math.abs(it.change).toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
      {/* edge fades */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#020617] to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#020617] to-transparent" />
    </div>
  );
}
