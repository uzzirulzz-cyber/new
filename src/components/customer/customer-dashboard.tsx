"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet, TrendingUp, TrendingDown, Snowflake, ArrowDownLeft,
  ArrowUpRight, ArrowLeftRight, ArrowRight, Star, Bell, Newspaper,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { fmtUsd, fmtNum } from "@/lib/format";
import { marketPairs } from "@/lib/dashboard-data";
import type { CustomerSection } from "./customer-shell";

interface DashboardData {
  wallet: any;
  trades: any[];
  notifications: any[];
  system: any[];
}

export function CustomerDashboard({ onNavigate, onTradeCoin }: { onNavigate: (s: CustomerSection) => void; onTradeCoin?: (coin: string) => void }) {
  const { user, wallet } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(["BTC", "ETH"]));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/wallet").then(r => r.json()),
      fetch("/api/trades?limit=5").then(r => r.json()),
      fetch("/api/notifications").then(r => r.json()),
    ]).then(([w, t, n]) => {
      setData({
        wallet: w.wallet,
        trades: t.trades || [],
        notifications: n.notifications || [],
        system: n.system || [],
      });
      setLoading(false);
    });
  }, []);

  const w = data?.wallet || wallet;
  const popularCoins = marketPairs.slice(0, 8);
  const favoriteCoins = marketPairs.filter((m) => favorites.has(m.base));

  const toggleFav = (coin: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(coin)) next.delete(coin);
      else next.add(coin);
      return next;
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Balance cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <BalanceCard
          label="Total Assets"
          value={w ? w.totalAssets : 0}
          icon={Wallet}
          color="text-blue-400"
          bg="bg-blue-500/10"
          delay={0}
        />
        <BalanceCard
          label="Available Balance"
          value={w ? w.available : 0}
          icon={TrendingUp}
          color="text-emerald-400"
          bg="bg-emerald-500/10"
          delay={0.05}
        />
        <BalanceCard
          label="Frozen Balance"
          value={w ? w.frozen : 0}
          icon={Snowflake}
          color="text-amber-400"
          bg="bg-amber-500/10"
          delay={0.1}
        />
        <BalanceCard
          label="Today's Profit"
          value={w ? w.todayProfit : 0}
          icon={w && w.todayProfit >= 0 ? TrendingUp : TrendingDown}
          color={w && w.todayProfit >= 0 ? "text-emerald-400" : "text-red-400"}
          bg={w && w.todayProfit >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"}
          delay={0.15}
          isProfit
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuickAction icon={ArrowDownLeft} label="Recharge" onClick={() => onNavigate("recharge")} variant="gold" />
        <QuickAction icon={ArrowUpRight} label="Withdraw" onClick={() => onNavigate("withdraw")} variant="blue" />
        <QuickAction icon={ArrowLeftRight} label="Transfer" onClick={() => onNavigate("transfer")} variant="blue" />
        <QuickAction icon={Wallet} label="Wallet" onClick={() => onNavigate("wallet")} variant="gold" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Popular coins */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="card-gradient p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold">Popular Coins</h3>
                <p className="text-xs text-muted-foreground">Live prices · tap to trade</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("trade")} className="text-amber-500">
                Trade <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {popularCoins.map((coin) => (
                <CoinCard
                  key={coin.base}
                  coin={coin}
                  onTrade={() => onTradeCoin ? onTradeCoin(coin.base) : onNavigate("trade")}
                  onFav={toggleFav}
                  isFav={favorites.has(coin.base)}
                />
              ))}
            </div>
          </Card>

          {/* Favorite / Watchlist */}
          <Card className="card-gradient p-5">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-4 w-4 text-amber-500" />
              <h3 className="font-bold">Watchlist</h3>
            </div>
            {favoriteCoins.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Tap the star on any coin to add it to your watchlist.
              </p>
            ) : (
              <div className="space-y-2">
                {favoriteCoins.map((coin) => (
                  <div
                    key={coin.base}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent/40 cursor-pointer transition-colors"
                    onClick={() => onTradeCoin ? onTradeCoin(coin.base) : onNavigate("trade")}
                  >
                    <span className="h-8 w-8 flex items-center justify-center rounded-full text-sm font-bold" style={{ background: `${coin.iconColor}25`, color: coin.iconColor }}>
                      {coin.icon}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{coin.base}</p>
                      <p className="text-[10px] text-muted-foreground">{coin.pair}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono">{fmtUsd(coin.lastPrice)}</p>
                      <p className={`text-[10px] ${coin.change24h >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                      </p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Latest market news */}
          <Card className="card-gradient p-5">
            <div className="flex items-center gap-2 mb-3">
              <Newspaper className="h-4 w-4 text-blue-400" />
              <h3 className="font-bold">Market News</h3>
            </div>
            <div className="space-y-3">
              {NEWS.map((n, i) => (
                <div key={i} className="border-l-2 border-blue-500/30 pl-3">
                  <p className="text-xs font-medium">{n.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent notifications */}
          <Card className="card-gradient p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-500" />
                <h3 className="font-bold">Notifications</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("notifications")} className="text-xs h-6">
                View all
              </Button>
            </div>
            {data && data.notifications.length > 0 ? (
              <div className="space-y-2">
                {data.notifications.slice(0, 3).map((n) => (
                  <div key={n.id} className="text-xs">
                    <p className="font-medium">{n.title}</p>
                    <p className="text-muted-foreground text-[10px] mt-0.5 line-clamp-2">{n.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">No notifications</p>
            )}
          </Card>

          {/* Recent trades */}
          <Card className="card-gradient p-5">
            <h3 className="font-bold mb-3">Recent Trades</h3>
            {data && data.trades.length > 0 ? (
              <div className="space-y-2">
                {data.trades.slice(0, 4).map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 flex items-center justify-center rounded-full text-[10px] font-bold bg-sidebar-accent">
                        {t.coin.slice(0, 2)}
                      </span>
                      <div>
                        <p className="font-medium">{t.coin}</p>
                        <p className="text-[10px] text-muted-foreground">{t.direction === "UP" ? "Buy Up" : "Buy Down"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono">{fmtUsd(t.amount)}</p>
                      <p className={`text-[10px] ${t.result === "WIN" ? "text-emerald-400" : t.result === "LOSS" ? "text-red-400" : "text-amber-400"}`}>
                        {t.status === "ACTIVE" ? "Active" : t.result === "WIN" ? `+$${t.profit.toFixed(2)}` : `-$${t.amount.toFixed(2)}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground mb-2">No trades yet</p>
                <Button size="sm" className="btn-gold-gradient h-7 text-xs" onClick={() => onNavigate("trade")}>
                  Start Trading
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function BalanceCard({ label, value, icon: Icon, color, bg, delay, isProfit }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className="card-gradient p-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{label}</p>
            <p className={`mt-1 text-xl lg:text-2xl font-bold ${isProfit && value !== 0 ? (value >= 0 ? "text-emerald-400" : "text-red-400") : ""}`}>
              {isProfit && value > 0 ? "+" : ""}{fmtUsd(value)}
            </p>
          </div>
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${bg} ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function QuickAction({ icon: Icon, label, onClick, variant }: any) {
  return (
    <button
      onClick={onClick}
      className={`card-gradient rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:scale-[1.02] ${
        variant === "gold" ? "hover:border-amber-500/40" : "hover:border-blue-500/40"
      }`}
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
        variant === "gold" ? "bg-amber-500/15 text-amber-400" : "bg-blue-500/15 text-blue-400"
      }`}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

function CoinCard({ coin, onTrade, onFav, isFav }: any) {
  // Generate a mini sparkline from the coin's 24h range
  const spark = Array.from({ length: 12 }, (_, i) => {
    const base = coin.lastPrice;
    const variance = (Math.sin(i * 1.7 + coin.lastPrice) * 0.5 + 0.5) * (coin.high24h - coin.low24h) + coin.low24h;
    return variance;
  });
  const max = Math.max(...spark);
  const min = Math.min(...spark);
  const range = max - min || 1;
  const pts = spark.map((v, i) => `${(i / 11) * 100},${20 - ((v - min) / range) * 18}`).join(" ");

  return (
    <div className="card-gradient rounded-xl p-3 relative">
      <button
        onClick={() => onFav(coin.base)}
        className="absolute top-2 right-2 z-10"
      >
        <Star className={`h-3.5 w-3.5 ${isFav ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} />
      </button>
      <div className="flex items-center gap-2 mb-2">
        <span className="h-7 w-7 flex items-center justify-center rounded-full text-xs font-bold shrink-0" style={{ background: `${coin.iconColor}25`, color: coin.iconColor }}>
          {coin.icon}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold truncate">{coin.base}</p>
          <p className="text-[9px] text-muted-foreground truncate">{coin.pair}</p>
        </div>
      </div>
      <p className="text-sm font-mono font-bold">{fmtUsd(coin.lastPrice)}</p>
      <div className="flex items-center justify-between mt-1">
        <span className={`text-[10px] font-medium ${coin.change24h >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
        </span>
        <svg viewBox="0 0 100 20" className="w-16 h-5" preserveAspectRatio="none">
          <polyline points={pts} fill="none" stroke={coin.change24h >= 0 ? "#10b981" : "#ef4444"} strokeWidth="1" />
        </svg>
      </div>
      <Button
        size="sm"
        className={`w-full mt-2 h-7 text-[10px] ${coin.change24h >= 0 ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
        onClick={onTrade}
      >
        Trade
      </Button>
    </div>
  );
}

const NEWS = [
  { title: "Bitcoin breaks $67K as ETF inflows surge", time: "2 hours ago" },
  { title: "Ethereum L2 TVL hits new all-time high", time: "5 hours ago" },
  { title: "Solana network processes 65M transactions in 24h", time: "8 hours ago" },
  { title: "Regulatory clarity expected for crypto in Q3 2026", time: "1 day ago" },
];
