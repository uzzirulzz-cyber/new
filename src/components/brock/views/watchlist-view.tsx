"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { ArrowRight, Star } from "lucide-react";
import { COINS, formatPrice, type Coin } from "@/lib/market-data";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function genSparkline(coin: Coin, count = 24) {
  const pts: { i: number; v: number }[] = [];
  let v = coin.basePrice;
  for (let i = 0; i < count; i++) {
    v = Math.max(0.0001, v + (Math.random() - 0.5) * coin.basePrice * 0.012);
    pts.push({ i, v });
  }
  return pts;
}

export function WatchlistView() {
  const { navigate, user } = useAuth();
  const [watch, setWatch] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("brock-watchlist");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const coins = COINS.filter((c) => watch.includes(c.symbol));

  const remove = (sym: string) => {
    setWatch((prev) => {
      const next = prev.filter((s) => s !== sym);
      localStorage.setItem("brock-watchlist", JSON.stringify(next));
      return next;
    });
  };

  return (
    <main className="flex-1 pt-20 pb-10 bx-fade-in">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">My Watchlist</h1>
            <p className="text-sm text-muted-foreground mt-1">{coins.length} assets tracked.</p>
          </div>
          <Button variant="outline" onClick={() => navigate("markets")} className="border-white/10">Browse markets</Button>
        </motion.div>

        {coins.length === 0 ? (
          <div className="bx-glass rounded-2xl p-12 text-center">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white">Your watchlist is empty</h3>
            <p className="text-sm text-muted-foreground mt-1">Star assets on the Markets page to track them here.</p>
            <Button onClick={() => navigate("markets")} className="mt-4 bx-blue-gradient bx-glow text-white border-0">Browse markets</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coins.map((c, i) => {
              const spark = genSparkline(c);
              const change = ((spark[spark.length - 1].v - spark[0].v) / spark[0].v) * 100;
              const up = change >= 0;
              return (
                <motion.div key={c.symbol} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="bx-glass rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: `${c.color}22`, color: c.color }}>{c.icon}</div>
                      <div>
                        <div className="text-sm font-semibold text-white">{c.symbol}/USDT</div>
                        <div className="text-[10px] text-muted-foreground">{c.name}</div>
                      </div>
                    </div>
                    <button onClick={() => remove(c.symbol)} className="h-7 w-7 rounded-md flex items-center justify-center text-[#f59e0b]">
                      <Star className="h-4 w-4 fill-[#f59e0b]" />
                    </button>
                  </div>
                  <div className="flex items-end justify-between mb-2">
                    <div>
                      <div className="text-xl font-bold text-white">{formatPrice(c.basePrice)}</div>
                      <Badge variant="outline" className={`mt-1 ${up ? "border-[#00c853]/40 text-[#00c853]" : "border-[#ff3b30]/40 text-[#ff3b30]"}`}>
                        {up ? "+" : ""}{change.toFixed(2)}%
                      </Badge>
                    </div>
                    <div className="h-12 w-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={spark}>
                          <defs>
                            <linearGradient id={`wl-${c.symbol}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={up ? "#00c853" : "#ff3b30"} stopOpacity={0.5} />
                              <stop offset="100%" stopColor={up ? "#00c853" : "#ff3b30"} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <YAxis domain={["dataMin", "dataMax"]} hide />
                          <Area type="monotone" dataKey="v" stroke={up ? "#00c853" : "#ff3b30"} strokeWidth={1.5} fill={`url(#wl-${c.symbol})`} isAnimationActive={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => navigate(user ? "trade" : "login")} className="w-full border-white/10 hover:border-[#2196f3]/40">
                    Trade {c.symbol} <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default WatchlistView;
