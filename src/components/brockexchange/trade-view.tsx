"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  Clock,
  Lock,
  TrendingUp,
  X,
  CheckCircle2,
  XCircle,
  Loader2,
  Activity,
} from "lucide-react";
import {
  COINS,
  TRADE_OPTIONS,
  formatPrice,
  getInitialCandles,
  nextCandle,
  computePattern,
  type Candle,
  type Coin,
} from "@/lib/market-data";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ActiveTrade {
  tradeId: string;
  symbol: string;
  direction: "UP" | "DOWN";
  amount: number;
  duration: number;
  entryPrice: number;
  payoutRate: number;
  expiresAt: number;
}

interface SettledResult {
  won: boolean;
  profit: number;
  entryPrice: number;
  exitPrice: number;
  symbol: string;
  direction: "UP" | "DOWN";
  amount: number;
}

export function TradeView() {
  const { user, apiFetch } = useAuth();
  const [selectedCoin, setSelectedCoin] = useState<Coin>(COINS[0]);
  const [candles, setCandles] = useState<Candle[]>(() => getInitialCandles(COINS[0].basePrice, 60));
  const [amount, setAmount] = useState("100");
  const [duration, setDuration] = useState(TRADE_OPTIONS[0]);
  const [activeTrade, setActiveTrade] = useState<ActiveTrade | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SettledResult | null>(null);
  const [remaining, setRemaining] = useState(0);
  const settleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset candles when coin changes
  useEffect(() => {
    setCandles(getInitialCandles(selectedCoin.basePrice, 60));
  }, [selectedCoin]);

  // Update candles every 1.5s
  useEffect(() => {
    const id = setInterval(() => {
      setCandles((prev) => {
        const last = prev[prev.length - 1];
        const next = nextCandle(last.c);
        return [...prev.slice(-59), next];
      });
    }, 1500);
    return () => clearInterval(id);
  }, [selectedCoin]);

  // Compute pattern (only used when authed)
  const pattern = useMemo(() => computePattern(candles), [candles]);

  const livePrice = candles[candles.length - 1]?.c ?? selectedCoin.basePrice;
  const investAmount = Number(amount) || 0;
  const estimatedProfit = investAmount * duration.payoutRate;

  // Countdown for active trade
  useEffect(() => {
    if (!activeTrade) {
      setRemaining(0);
      return;
    }
    const tick = () => {
      const now = Date.now();
      const left = Math.max(0, Math.ceil((activeTrade.expiresAt - now) / 1000));
      setRemaining(left);
      if (left <= 0) {
        settleTrade();
      }
    };
    tick();
    settleTimerRef.current = setInterval(tick, 250);
    return () => {
      if (settleTimerRef.current) clearInterval(settleTimerRef.current);
    };
     
  }, [activeTrade]);

  const placeTrade = async (direction: "UP" | "DOWN") => {
    if (submitting || activeTrade) return;
    if (investAmount < 10) {
      toast.error("Minimum trade amount is $10.");
      return;
    }
    if (investAmount > 10000) {
      toast.error("Maximum trade amount is $10,000.");
      return;
    }
    if (user && investAmount > user.balance) {
      toast.error("Insufficient balance.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch("/api/trade/execute", {
        method: "POST",
        body: JSON.stringify({
          symbol: selectedCoin.symbol,
          direction,
          duration: duration.duration,
          amount: investAmount,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to place trade.");
        return;
      }
      toast.success("Trade Successfully Placed");
      setActiveTrade({
        tradeId: data.trade.tradeId,
        symbol: data.trade.symbol,
        direction: data.trade.direction,
        amount: data.trade.amount,
        duration: data.trade.duration,
        entryPrice: data.trade.entryPrice,
        payoutRate: data.trade.payoutRate,
        expiresAt: new Date(data.trade.expiresAt).getTime(),
      });
    } catch {
      toast.error("Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  const settleTrade = async () => {
    if (!activeTrade) return;
    if (settleTimerRef.current) clearInterval(settleTimerRef.current);
    try {
      const res = await apiFetch("/api/trade/settle", {
        method: "POST",
        body: JSON.stringify({ tradeId: activeTrade.tradeId }),
      });
      const data = await res.json();
      if (res.ok && data.trade) {
        const profit = data.trade.profit || 0;
        setResult({
          won: data.trade.result === "WIN",
          profit,
          entryPrice: activeTrade.entryPrice,
          exitPrice: data.trade.exitPrice || activeTrade.entryPrice,
          symbol: activeTrade.symbol,
          direction: activeTrade.direction,
          amount: activeTrade.amount,
        });
      }
    } catch {
      /* noop */
    } finally {
      setActiveTrade(null);
    }
  };

  const tradeAgain = () => {
    setResult(null);
    setRemaining(0);
  };

  return (
    <main className="flex-1 pt-16 bx-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_320px] gap-4">
          {/* Left: coin selector */}
          <aside className="bx-glass rounded-xl p-3 lg:max-h-[calc(100vh-7rem)] lg:sticky lg:top-20 lg:overflow-y-auto">
            <div className="flex items-center gap-2 px-1 py-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              <Activity className="h-3.5 w-3.5" /> Markets
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5">
              {COINS.map((c) => {
                const active = c.symbol === selectedCoin.symbol;
                return (
                  <button
                    key={c.symbol}
                    onClick={() => setSelectedCoin(c)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                      active
                        ? "bg-[#2196f3]/15 border border-[#2196f3]/40"
                        : "border border-transparent hover:bg-white/5"
                    }`}
                  >
                    <div
                      className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: `${c.color}22`, color: c.color }}
                    >
                      {c.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold truncate">{c.symbol}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {formatPrice(c.basePrice)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Center: candlestick chart */}
          <section className="bx-glass rounded-xl p-4 lg:p-6 min-h-[480px] flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="h-9 w-9 rounded-full flex items-center justify-center text-base font-bold"
                  style={{ background: `${selectedCoin.color}22`, color: selectedCoin.color }}
                >
                  {selectedCoin.icon}
                </div>
                <div>
                  <div className="text-base font-bold">
                    {selectedCoin.symbol}
                    <span className="text-muted-foreground text-xs ml-2 font-normal">
                      {selectedCoin.name}
                    </span>
                  </div>
                  <div className="text-lg font-mono font-semibold bx-text-gradient">
                    {formatPrice(livePrice)}
                  </div>
                </div>
              </div>
              {user && (
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-4 rounded-full bg-[#42a5f5]" /> Bollinger
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-4 rounded-full bg-[#E0E0E0]/70" /> MA
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-4 border-t border-dashed border-[#10b981]" /> S/R
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 relative">
              <CandlestickChart
                candles={candles}
                pattern={pattern}
                showPatterns={!!user}
              />
              {!user && (
                <div className="absolute inset-0 backdrop-blur-md flex items-center justify-center bg-[#050810]/60 rounded-lg">
                  <div className="text-center px-4">
                    <Lock className="h-8 w-8 text-[#42a5f5] mx-auto mb-2" />
                    <p className="text-sm font-semibold text-white">Register to see patterns</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                      Bollinger Bands, MA, and support/resistance lines unlock after you sign in.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Right: trade form */}
          <aside className="bx-glass rounded-xl p-4 lg:sticky lg:top-20 lg:self-start space-y-4">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Selected
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: `${selectedCoin.color}22`, color: selectedCoin.color }}
                  >
                    {selectedCoin.icon}
                  </div>
                  <div className="text-sm font-semibold">{selectedCoin.symbol}</div>
                </div>
                <div className="text-sm font-mono font-semibold bx-text-gradient">
                  {formatPrice(livePrice)}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="amount" className="text-xs">
                Amount (USD)
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  min={10}
                  max={10000}
                  step={10}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7 bg-white/5 border-white/10"
                  disabled={!!activeTrade}
                />
              </div>
              <div className="flex gap-1.5 mt-2">
                {[50, 100, 500, 1000].map((v) => (
                  <button
                    key={v}
                    onClick={() => setAmount(String(v))}
                    disabled={!!activeTrade}
                    className="flex-1 py-1 text-xs rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 text-muted-foreground"
                  >
                    ${v}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Range: $10 — $10,000</p>
            </div>

            <div>
              <Label className="text-xs">Duration</Label>
              <div className="grid grid-cols-3 gap-1.5 mt-1">
                {TRADE_OPTIONS.map((o) => {
                  const active = duration.duration === o.duration;
                  return (
                    <button
                      key={o.duration}
                      onClick={() => setDuration(o)}
                      disabled={!!activeTrade}
                      className={`py-2 rounded-lg text-xs border transition-colors ${
                        active
                          ? "border-[#2196f3] bg-[#2196f3]/15 text-white"
                          : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                      } disabled:opacity-50`}
                    >
                      <div className="font-semibold">{o.duration}s</div>
                      <div className="text-[10px]">{Math.round(o.payoutRate * 100)}%</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bx-glass-soft rounded-lg p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Investment</span>
                <span className="font-mono">${investAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-muted-foreground">Payout</span>
                <span className="font-mono text-emerald-400">
                  +${estimatedProfit.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-muted-foreground">Total return</span>
                <span className="font-mono font-semibold">
                  ${(investAmount + estimatedProfit).toFixed(2)}
                </span>
              </div>
            </div>

            {activeTrade ? (
              <div className="space-y-3">
                <div className="rounded-lg p-3 border border-[#2196f3]/30 bg-[#2196f3]/10 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-[#42a5f5]">
                    Active trade · {activeTrade.symbol} ·{" "}
                    {activeTrade.direction === "UP" ? "UP" : "DOWN"}
                  </div>
                  <div className="text-3xl font-bold font-mono bx-text-gradient mt-1">
                    {remaining}s
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    Entry: {formatPrice(activeTrade.entryPrice)}
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full bx-blue-gradient"
                    initial={{ width: "100%" }}
                    animate={{ width: `${(remaining / activeTrade.duration) * 100}%` }}
                    transition={{ ease: "linear", duration: 0.25 }}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => placeTrade("UP")}
                  disabled={submitting}
                  className="h-12 bg-emerald-500 hover:bg-emerald-600 text-white border-0"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ArrowUp className="h-4 w-4" /> BUY UP
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => placeTrade("DOWN")}
                  disabled={submitting}
                  className="h-12 bg-red-500 hover:bg-red-600 text-white border-0"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ArrowDown className="h-4 w-4" /> BUY DOWN
                    </>
                  )}
                </Button>
              </div>
            )}

            {user && (
              <div className="text-xs text-muted-foreground text-center border-t border-white/5 pt-3">
                Balance:{" "}
                <span className="font-mono text-[#42a5f5]">
                  ${user.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Result modal */}
      <Dialog open={!!result} onOpenChange={(o) => { if (!o) tradeAgain(); }}>
        <DialogContent className="bx-glass border-white/10 max-w-sm" showCloseButton={false}>
          {result && (
            <>
              <DialogHeader className="text-center items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className={`h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    result.won ? "bg-emerald-500/20" : "bg-red-500/20"
                  }`}
                >
                  {result.won ? (
                    <CheckCircle2 className="h-9 w-9 text-emerald-400" />
                  ) : (
                    <XCircle className="h-9 w-9 text-red-400" />
                  )}
                </motion.div>
                <DialogTitle className={`text-2xl ${result.won ? "text-emerald-400" : "text-red-400"}`}>
                  {result.won ? "YOU WIN" : "YOU LOSE"}
                </DialogTitle>
                <DialogDescription>
                  {result.symbol} · {result.direction === "UP" ? "BUY UP" : "BUY DOWN"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Investment</span>
                  <span className="font-mono">${result.amount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Entry price</span>
                  <span className="font-mono">{formatPrice(result.entryPrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Exit price</span>
                  <span className="font-mono">{formatPrice(result.exitPrice)}</span>
                </div>
                <div className="border-t border-white/5 pt-2 flex items-center justify-between">
                  <span className="text-muted-foreground">{result.won ? "Profit" : "Loss"}</span>
                  <span
                    className={`font-mono font-bold text-lg ${
                      result.won ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {result.won ? "+" : ""}${result.profit.toFixed(2)}
                  </span>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={tradeAgain}
                  className="w-full bx-blue-gradient text-white border-0"
                >
                  Trade Again
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}

// ─── Candlestick chart (custom SVG) ───────────────────────────
interface ChartProps {
  candles: Candle[];
  pattern: ReturnType<typeof computePattern>;
  showPatterns: boolean;
}

function CandlestickChart({ candles, pattern, showPatterns }: ChartProps) {
  const W = 800;
  const H = 360;
  const padding = { top: 16, right: 8, bottom: 24, left: 8 };
  const innerW = W - padding.left - padding.right;
  const innerH = H - padding.top - padding.bottom;

  const allValues: number[] = [];
  candles.forEach((c) => allValues.push(c.h, c.l));
  if (showPatterns) {
    pattern.bollinger.forEach((b) => {
      if (b.upper > 0) allValues.push(b.upper, b.lower);
    });
    allValues.push(pattern.support, pattern.resistance);
  }
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = max - min || 1;
  const pad = range * 0.05;
  const yMin = min - pad;
  const yMax = max + pad;
  const yRange = yMax - yMin;

  const y = (v: number) => padding.top + ((yMax - v) / yRange) * innerH;
  const candleW = innerW / candles.length;
  const bodyW = Math.max(2, candleW * 0.6);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-full"
      preserveAspectRatio="none"
    >
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((p) => (
        <line
          key={p}
          x1={padding.left}
          x2={W - padding.right}
          y1={padding.top + innerH * p}
          y2={padding.top + innerH * p}
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={1}
        />
      ))}

      {/* Support / Resistance */}
      {showPatterns && (
        <>
          <line
            x1={padding.left}
            x2={W - padding.right}
            y1={y(pattern.resistance)}
            y2={y(pattern.resistance)}
            stroke="#10b981"
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={0.7}
          />
          <text
            x={W - padding.right - 4}
            y={y(pattern.resistance) - 4}
            fill="#10b981"
            fontSize={9}
            textAnchor="end"
          >
            R {formatPrice(pattern.resistance)}
          </text>
          <line
            x1={padding.left}
            x2={W - padding.right}
            y1={y(pattern.support)}
            y2={y(pattern.support)}
            stroke="#ef4444"
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={0.7}
          />
          <text
            x={W - padding.right - 4}
            y={y(pattern.support) - 4}
            fill="#ef4444"
            fontSize={9}
            textAnchor="end"
          >
            S {formatPrice(pattern.support)}
          </text>
        </>
      )}

      {/* Bollinger Bands */}
      {showPatterns && (
        <>
          <polyline
            points={pattern.bollinger
              .map((b, i) =>
                b.upper > 0
                  ? `${padding.left + i * candleW + candleW / 2},${y(b.upper)}`
                  : ""
              )
              .filter(Boolean)
              .join(" ")}
            fill="none"
            stroke="#42a5f5"
            strokeWidth={1}
            opacity={0.6}
          />
          <polyline
            points={pattern.bollinger
              .map((b, i) =>
                b.lower > 0
                  ? `${padding.left + i * candleW + candleW / 2},${y(b.lower)}`
                  : ""
              )
              .filter(Boolean)
              .join(" ")}
            fill="none"
            stroke="#42a5f5"
            strokeWidth={1}
            opacity={0.6}
          />
          {/* MA dashed silver */}
          <polyline
            points={pattern.ma
              .map((m, i) =>
                m > 0
                  ? `${padding.left + i * candleW + candleW / 2},${y(m)}`
                  : ""
              )
              .filter(Boolean)
              .join(" ")}
            fill="none"
            stroke="#E0E0E0"
            strokeWidth={1.2}
            strokeDasharray="3 3"
            opacity={0.7}
          />
        </>
      )}

      {/* Candles */}
      {candles.map((c, i) => {
        const cx = padding.left + i * candleW + candleW / 2;
        const up = c.c >= c.o;
        const color = up ? "#10b981" : "#ef4444";
        const bodyTop = y(Math.max(c.o, c.c));
        const bodyBottom = y(Math.min(c.o, c.c));
        return (
          <g key={i}>
            {/* Wick */}
            <line
              x1={cx}
              x2={cx}
              y1={y(c.h)}
              y2={y(c.l)}
              stroke={color}
              strokeWidth={1}
            />
            {/* Body */}
            <rect
              x={cx - bodyW / 2}
              y={bodyTop}
              width={bodyW}
              height={Math.max(1, bodyBottom - bodyTop)}
              fill={color}
              opacity={0.85}
            />
          </g>
        );
      })}

      {/* Last price marker */}
      {candles.length > 0 && (
        <g>
          <line
            x1={padding.left}
            x2={W - padding.right}
            y1={y(candles[candles.length - 1].c)}
            y2={y(candles[candles.length - 1].c)}
            stroke="#2196f3"
            strokeWidth={0.8}
            strokeDasharray="2 2"
            opacity={0.5}
          />
          <rect
            x={W - padding.right - 70}
            y={y(candles[candles.length - 1].c) - 8}
            width={70}
            height={16}
            fill="#2196f3"
            opacity={0.9}
            rx={2}
          />
          <text
            x={W - padding.right - 35}
            y={y(candles[candles.length - 1].c) + 3}
            fill="#fff"
            fontSize={9}
            fontWeight="bold"
            textAnchor="middle"
          >
            {formatPrice(candles[candles.length - 1].c)}
          </text>
        </g>
      )}
    </svg>
  );
}

export default TradeView;
