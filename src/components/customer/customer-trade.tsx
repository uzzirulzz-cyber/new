"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, Clock, Loader2, CheckCircle2,
  XCircle, ArrowLeft, Trophy, AlertCircle, Search, Star,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { fmtUsd, fmtNum } from "@/lib/format";
import { marketPairs } from "@/lib/dashboard-data";
import { toast } from "sonner";

const DURATIONS = [
  { seconds: 30, profit: 20, label: "30 Seconds" },
  { seconds: 60, profit: 30, label: "60 Seconds" },
  { seconds: 120, profit: 50, label: "120 Seconds" },
];

type TradePhase = "select" | "active" | "result";

interface ActiveTrade {
  tradeId: string;
  coin: string;
  direction: "UP" | "DOWN";
  amount: number;
  duration: number;
  profitPercent: number;
  entryPrice: number;
  createdAt: string;
  expiresAt: string;
}

interface SettledTrade {
  tradeId: string;
  coin: string;
  direction: "UP" | "DOWN";
  amount: number;
  duration: number;
  profitPercent: number;
  entryPrice: number;
  exitPrice: number;
  result: "WIN" | "LOSS";
  profit: number;
  settledAt: string;
}

export function CustomerTrade({ onSettled }: { onSettled: () => void }) {
  const { wallet, refresh } = useAuth();
  const [selectedCoin, setSelectedCoin] = useState(marketPairs[0]);
  const [search, setSearch] = useState("");
  const [direction, setDirection] = useState<"UP" | "DOWN">("UP");
  const [duration, setDuration] = useState(DURATIONS[0]);
  const [amount, setAmount] = useState("100");
  const [phase, setPhase] = useState<TradePhase>("select");
  const [activeTrade, setActiveTrade] = useState<ActiveTrade | null>(null);
  const [result, setResult] = useState<SettledTrade | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [livePrice, setLivePrice] = useState(selectedCoin.lastPrice);
  const [tick, setTick] = useState(0);
  const [placing, setPlacing] = useState(false);

  // Live price wiggle
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setLivePrice(selectedCoin.lastPrice + Math.sin(tick * 0.5) * selectedCoin.lastPrice * 0.0008);
  }, [tick, selectedCoin]);

  // Countdown timer
  useEffect(() => {
    if (phase !== "active" || !activeTrade) return;
    const expiry = new Date(activeTrade.expiresAt).getTime();
    const update = async () => {
      const remaining = Math.max(0, Math.ceil((expiry - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining <= 0) {
        // Inline settle logic to avoid circular dependency
        try {
          const res = await fetch("/api/trades/settle", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tradeId: activeTrade.tradeId }),
          });
          const data = await res.json();
          if (res.ok) {
            setResult(data.trade);
            setPhase("result");
            refresh();
            onSettled();
          }
        } catch (e) {
          console.error("Settle error:", e);
        }
      }
    };
    update();
    const id = setInterval(update, 100);
    return () => clearInterval(id);
  }, [phase, activeTrade, refresh, onSettled]);

  // Check for active trade on mount
  useEffect(() => {
    fetch("/api/trades?status=ACTIVE&limit=1")
      .then(r => r.json())
      .then(data => {
        if (data.trades && data.trades.length > 0) {
          const t = data.trades[0];
          setActiveTrade({
            tradeId: t.tradeId,
            coin: t.coin,
            direction: t.direction,
            amount: t.amount,
            duration: t.duration,
            profitPercent: t.profitPercent,
            entryPrice: t.entryPrice,
            createdAt: t.createdAt,
            expiresAt: new Date(new Date(t.createdAt).getTime() + t.duration * 1000).toISOString(),
          });
          setPhase("active");
        }
      });
  }, []);

  const investAmount = Number(amount) || 0;
  const estimatedProfit = investAmount * (duration.profit / 100);

  const filteredCoins = useMemo(() => {
    if (!search) return marketPairs;
    return marketPairs.filter((m) =>
      m.base.toLowerCase().includes(search.toLowerCase()) ||
      m.pair.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const placeTrade = async () => {
    if (!wallet || wallet.available < investAmount) {
      toast.error("Insufficient balance. Please recharge your wallet.");
      return;
    }
    if (investAmount < 10) {
      toast.error("Minimum trade amount is $10");
      return;
    }

    setPlacing(true);
    try {
      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coin: selectedCoin.base,
          direction,
          amount: investAmount,
          duration: duration.seconds,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to place trade");
        setPlacing(false);
        return;
      }
      toast.success("Trade Successfully Placed!");
      setActiveTrade(data.trade);
      setPhase("active");
      refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
    setPlacing(false);
  };

  const tradeAgain = () => {
    setActiveTrade(null);
    setResult(null);
    setPhase("select");
    setAmount("100");
  };

  // ─── Active trade view ──────────────────────────────────────
  if (phase === "active" && activeTrade) {
    const progress = ((activeTrade.duration - countdown) / activeTrade.duration) * 100;
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="card-gradient p-8 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-400">Trade Successfully Placed</h2>
            <p className="text-sm text-muted-foreground mt-1">Your trade is now locked until expiry</p>

            <div className="my-8">
              <div className="text-6xl font-bold font-mono text-amber-500">
                {countdown}s
              </div>
              <p className="text-xs text-muted-foreground mt-2">Time remaining</p>
            </div>

            <div className="w-full h-2 bg-sidebar-accent rounded-full overflow-hidden mb-6">
              <motion.div
                className={`h-full ${activeTrade.direction === "UP" ? "bg-emerald-500" : "bg-red-500"}`}
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-left">
              <Detail label="Trade ID" value={activeTrade.tradeId} />
              <Detail label="Coin" value={activeTrade.coin} />
              <Detail label="Direction" value={activeTrade.direction === "UP" ? "Buy Up ↑" : "Buy Down ↓"} accent={activeTrade.direction === "UP" ? "green" : "red"} />
              <Detail label="Investment" value={fmtUsd(activeTrade.amount)} />
              <Detail label="Entry Price" value={fmtUsd(activeTrade.entryPrice)} />
              <Detail label="Duration" value={`${activeTrade.duration}s`} />
              <Detail label="Profit Rate" value={`${activeTrade.profitPercent}%`} accent="gold" />
              <Detail label="Potential Return" value={fmtUsd(activeTrade.amount + activeTrade.amount * activeTrade.profitPercent / 100)} accent="green" />
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <AlertCircle className="h-3.5 w-3.5" />
              Trade is locked. Duplicate submissions are prevented.
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ─── Result view ────────────────────────────────────────────
  if (phase === "result" && result) {
    const won = result.result === "WIN";
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className={`card-gradient p-8 text-center border-2 ${won ? "border-emerald-500/40" : "border-red-500/40"}`}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="flex justify-center mb-4"
            >
              {won ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/30 blur-2xl rounded-full" />
                  <Trophy className="h-20 w-20 text-emerald-400 relative" />
                </div>
              ) : (
                <XCircle className="h-20 w-20 text-red-400" />
              )}
            </motion.div>

            <h2 className={`text-3xl font-bold ${won ? "text-emerald-400" : "text-red-400"}`}>
              {won ? "You Won!" : "You Lost"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {won ? "Congratulations on your successful trade" : "Better luck next time"}
            </p>

            <div className={`my-6 p-4 rounded-xl ${won ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
              <p className="text-xs text-muted-foreground">{won ? "Profit" : "Loss"}</p>
              <p className={`text-4xl font-bold ${won ? "text-emerald-400" : "text-red-400"}`}>
                {won ? "+" : "-"}{fmtUsd(Math.abs(result.profit))}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {won ? `+${result.profitPercent}% return on investment` : "Investment lost"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <Detail label="Trade ID" value={result.tradeId} />
              <Detail label="Status" value={won ? "WIN" : "LOSS"} accent={won ? "green" : "red"} />
              <Detail label="Coin" value={result.coin} />
              <Detail label="Direction" value={result.direction === "UP" ? "Buy Up ↑" : "Buy Down ↓"} />
              <Detail label="Entry Price" value={fmtUsd(result.entryPrice)} />
              <Detail label="Exit Price" value={fmtUsd(result.exitPrice)} />
              <Detail label="Investment" value={fmtUsd(result.amount)} />
              <Detail label="Settlement Time" value={new Date(result.settledAt).toLocaleTimeString()} />
            </div>

            <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-blue-400 font-medium">Wallet Updated</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {won
                  ? `${fmtUsd(result.amount + result.profit)} has been credited to your wallet.`
                  : "Your investment has been deducted from your frozen balance."}
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1 h-11" onClick={tradeAgain}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button className="flex-1 h-11 btn-gold-gradient" onClick={tradeAgain}>
                Trade Again
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ─── Trade selection view ───────────────────────────────────
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 max-w-7xl mx-auto">
      {/* Left: coin list */}
      <div className="space-y-4">
        <Card className="card-gradient p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">Select a Coin to Trade</h3>
            <Badge variant="secondary" className="bg-amber-500/15 text-amber-400">
              {filteredCoins.length} coins
            </Badge>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search coin..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-9 bg-sidebar-accent/60"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[500px] overflow-y-auto">
            {filteredCoins.map((coin) => {
              const isSel = selectedCoin.base === coin.base;
              return (
                <button
                  key={coin.base}
                  onClick={() => setSelectedCoin(coin)}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all text-left ${
                    isSel
                      ? "border-amber-500/50 bg-amber-500/10"
                      : "border-sidebar-border bg-sidebar-accent/30 hover:border-blue-500/30"
                  }`}
                >
                  <span className="h-8 w-8 flex items-center justify-center rounded-full text-sm font-bold shrink-0" style={{ background: `${coin.iconColor}25`, color: coin.iconColor }}>
                    {coin.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate">{coin.base}</p>
                    <p className="text-[10px] font-mono">{fmtUsd(coin.lastPrice)}</p>
                  </div>
                  <span className={`text-[9px] font-medium ${coin.change24h >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(1)}%
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Right: trade form */}
      <div className="space-y-4">
        {/* Selected coin header */}
        <Card className="card-gradient p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-12 w-12 flex items-center justify-center rounded-full text-xl font-bold" style={{ background: `${selectedCoin.iconColor}25`, color: selectedCoin.iconColor }}>
              {selectedCoin.icon}
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">{selectedCoin.base}</h3>
                <Badge variant="secondary" className="text-[10px] bg-sidebar-accent">{selectedCoin.pair}</Badge>
              </div>
              <motion.p key={livePrice.toFixed(2)} initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} className="text-2xl font-bold font-mono">
                {fmtUsd(livePrice)}
              </motion.p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold ${selectedCoin.change24h >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {selectedCoin.change24h >= 0 ? "+" : ""}{selectedCoin.change24h.toFixed(2)}%
              </p>
              <p className="text-[10px] text-muted-foreground">24h change</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center mb-4">
            <div className="bg-sidebar-accent/40 rounded-lg p-2">
              <p className="text-[9px] text-muted-foreground">24h High</p>
              <p className="text-xs font-mono">{fmtUsd(selectedCoin.high24h)}</p>
            </div>
            <div className="bg-sidebar-accent/40 rounded-lg p-2">
              <p className="text-[9px] text-muted-foreground">24h Low</p>
              <p className="text-xs font-mono">{fmtUsd(selectedCoin.low24h)}</p>
            </div>
            <div className="bg-sidebar-accent/40 rounded-lg p-2">
              <p className="text-[9px] text-muted-foreground">24h Vol</p>
              <p className="text-xs font-mono">{(selectedCoin.volume24h / 1000).toFixed(1)}K</p>
            </div>
          </div>
        </Card>

        {/* Trade form */}
        <Card className="card-gradient p-5">
          {/* Amount input */}
          <div className="mb-4">
            <label className="text-xs text-muted-foreground mb-1.5 block">Investment Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">$</span>
              <Input
                type="number"
                placeholder="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 h-12 text-lg font-mono font-bold bg-sidebar-accent/60"
                min="10"
              />
            </div>
            <div className="flex gap-1.5 mt-2">
              {[50, 100, 500, 1000].map((v) => (
                <button
                  key={v}
                  onClick={() => setAmount(String(v))}
                  className="flex-1 py-1 text-[10px] rounded bg-sidebar-accent/60 hover:bg-sidebar-accent font-medium"
                >
                  ${v}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Available: {wallet ? fmtUsd(wallet.available) : "—"}
            </p>
          </div>

          {/* Duration selection */}
          <div className="mb-4">
            <label className="text-xs text-muted-foreground mb-1.5 block">Trading Duration</label>
            <div className="grid grid-cols-3 gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.seconds}
                  onClick={() => setDuration(d)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    duration.seconds === d.seconds
                      ? "border-amber-500/50 bg-amber-500/10"
                      : "border-sidebar-border bg-sidebar-accent/30 hover:border-blue-500/30"
                  }`}
                >
                  <Clock className="h-4 w-4 mx-auto mb-1 text-amber-400" />
                  <p className="text-xs font-bold">{d.seconds}s</p>
                  <p className="text-[10px] text-emerald-400 font-medium">+{d.profit}%</p>
                </button>
              ))}
            </div>
          </div>

          {/* Estimated profit */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Estimated Profit</span>
              <span className="text-lg font-bold text-emerald-400">+{fmtUsd(estimatedProfit)}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-muted-foreground">Total Return on Win</span>
              <span className="text-sm font-medium text-emerald-400">{fmtUsd(investAmount + estimatedProfit)}</span>
            </div>
          </div>

          {/* Direction buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => setDirection("UP")}
              className={`h-14 text-base font-bold transition-all ${
                direction === "UP"
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : "bg-sidebar-accent/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingUp className="mr-2 h-5 w-5" />
              Buy Up
            </Button>
            <Button
              onClick={() => setDirection("DOWN")}
              className={`h-14 text-base font-bold transition-all ${
                direction === "DOWN"
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-sidebar-accent/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingDown className="mr-2 h-5 w-5" />
              Buy Down
            </Button>
          </div>

          {/* Place trade button */}
          <Button
            onClick={placeTrade}
            disabled={placing || investAmount < 10 || !wallet || wallet.available < investAmount}
            className={`w-full h-12 mt-3 text-base font-bold ${
              direction === "UP" ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            {placing ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Placing Trade...</>
            ) : (
              <>{direction === "UP" ? "Buy Up" : "Buy Down"} {selectedCoin.base} · {fmtUsd(investAmount)}</>
            )}
          </Button>

          {wallet && wallet.available < investAmount && (
            <p className="text-[10px] text-red-400 text-center mt-2">
              Insufficient balance. Available: {fmtUsd(wallet.available)}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

function Detail({ label, value, accent }: { label: string; value: string; accent?: "green" | "red" | "gold" }) {
  const color = accent === "green" ? "text-emerald-400" : accent === "red" ? "text-red-400" : accent === "gold" ? "text-amber-400" : "";
  return (
    <div className="bg-sidebar-accent/30 rounded-lg p-2.5">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={`text-sm font-mono font-medium ${color}`}>{value}</p>
    </div>
  );
}
