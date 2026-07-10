"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { ArrowRight, Search, Star } from "lucide-react";
import { COINS, formatPrice, type Coin } from "@/lib/market-data";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

function MarketCard({ c, i, tick, isWatched, onToggleWatch, onTrade }: {
  c: Coin;
  i: number;
  tick: number;
  isWatched: boolean;
  onToggleWatch: (sym: string) => void;
  onTrade: () => void;
}) {
  const spark = useMemo(() => genSparkline(c), [c, tick]);
  const change = ((spark[spark.length - 1].v - spark[0].v) / spark[0].v) * 100;
  const up = change >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.04 }}
      className="bx-glass rounded-xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: `${c.color}22`, color: c.color }}>{c.icon}</div>
          <div>
            <div className="text-sm font-semibold text-white">{c.symbol}/USDT</div>
            <div className="text-[10px] text-muted-foreground">{c.name}</div>
          </div>
        </div>
        <button onClick={() => onToggleWatch(c.symbol)} className={`h-7 w-7 rounded-md flex items-center justify-center ${isWatched ? "text-[#f59e0b]" : "text-muted-foreground hover:text-white"}`}>
          <Star className={`h-4 w-4 ${isWatched ? "fill-[#f59e0b]" : ""}`} />
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
                <linearGradient id={`mk-${c.symbol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={up ? "#00c853" : "#ff3b30"} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={up ? "#00c853" : "#ff3b30"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis domain={["dataMin", "dataMax"]} hide />
              <Area type="monotone" dataKey="v" stroke={up ? "#00c853" : "#ff3b30"} strokeWidth={1.5} fill={`url(#mk-${c.symbol})`} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <Button size="sm" variant="outline" onClick={onTrade} className="w-full border-white/10 hover:border-[#2196f3]/40 hover:bg-[#2196f3]/10">
        Trade {c.symbol} <ArrowRight className="ml-1 h-3 w-3" />
      </Button>
    </motion.div>
  );
}

export function MarketsView() {
  const { navigate, user } = useAuth();
  const [search, setSearch] = useState("");
  const [watch, setWatch] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("brock-watchlist");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  const toggleWatch = (sym: string) => {
    setWatch((prev) => {
      const next = prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym];
      localStorage.setItem("brock-watchlist", JSON.stringify(next));
      return next;
    });
  };

  const filtered = COINS.filter(
    (c) => !search || c.symbol.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="flex-1 pt-20 pb-10 bx-fade-in">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Markets</h1>
            <p className="text-sm text-muted-foreground mt-1">{COINS.length} assets available for trading.</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search assets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-white/5 border-white/10" />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c, i) => (
            <MarketCard
              key={c.symbol}
              c={c}
              i={i}
              tick={tick}
              isWatched={watch.includes(c.symbol)}
              onToggleWatch={toggleWatch}
              onTrade={() => navigate(user ? "trade" : "login")}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

export default MarketsView;
