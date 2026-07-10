"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Bar,
  Tooltip,
} from "recharts";
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
  History,
} from "lucide-react";
import {
  COINS,
  DURATIONS,
  QUICK_AMOUNTS,
  computePattern,
  formatPrice,
  getInitialCandles,
  nextCandle,
  tickCandle,
  type Candle,
  type Coin,
} from "@/lib/market-data";
import { useAuth, apiFetch, type AuthUser } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type ChartRow = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  upper: number | null;
  middle: number | null;
  lower: number | null;
  ma: number | null;
};

type ActiveTrade = {
  id: string;
  tradeId: string;
  symbol: string;
  direction: "UP" | "DOWN";
  amount: number;
  duration: number;
  entryPrice: number;
  payoutRate: number;
  remaining: number;
};

type TradeHistory = {
  id: string;
  tradeId: string;
  symbol: string;
  direction: "UP" | "DOWN";
  amount: number;
  duration: number;
  entryPrice: number;
  exitPrice: number | null;
  result: "PENDING" | "WIN" | "LOSE";
  profit: number;
  status: "ACTIVE" | "SETTLED";
  createdAt: string;
  settledAt: string | null;
};

type SettledResult = {
  tradeId: string;
  result: "WIN" | "LOSE";
  profit: number;
  amount: number;
  symbol: string;
  direction: "UP" | "DOWN";
  entryPrice: number;
  exitPrice: number;
};

function makeCandlestickShape(yMin: number, yMax: number) {
  return function CandlestickShape(props: any) {
    const { payload, background } = props || {};
    if (!payload || !background) return null;
    const { open, high, low, close } = payload;
    const plotTop: number = background.y;
    const plotH: number = background.height;
    const yFor = (v: number) => plotTop + ((yMax - v) / (yMax - yMin || 1)) * plotH;
    const x: number = background.x + background.width / 2;
    const w = Math.max(2, background.width * 0.6);
    const up = close >= open;
    const color = up ? "#00c853" : "#ff3b30";
    const yHigh = yFor(high);
    const yLow = yFor(low);
    const yOpen = yFor(open);
    const yClose = yFor(close);
    const bodyTop = Math.min(yOpen, yClose);
    const bodyH = Math.max(1, Math.abs(yClose - yOpen));
    return (
      <g>
        <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={color} strokeWidth={1} />
        <rect x={x - w / 2} y={bodyTop} width={w} height={bodyH} fill={color} rx={1} />
      </g>
    );
  };
}

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0]?.payload as ChartRow;
  if (!d) return null;
  return (
    <div className="bx-glass rounded-md px-3 py-2 text-xs">
      <div className="text-muted-foreground mb-1">{new Date(d.time).toLocaleTimeString()}</div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        <span className="text-muted-foreground">O:</span><span className="text-white">{formatPrice(d.open)}</span>
        <span className="text-muted-foreground">H:</span><span className="text-[#00c853]">{formatPrice(d.high)}</span>
        <span className="text-muted-foreground">L:</span><span className="text-[#ff3b30]">{formatPrice(d.low)}</span>
        <span className="text-muted-foreground">C:</span><span className="text-white">{formatPrice(d.close)}</span>
      </div>
    </div>
  );
}

export function TradeView() {
  const { user, setUser } = useAuth();
  const [coin, setCoin] = useState<Coin>(COINS[0]);
  const [candles, setCandles] = useState<Candle[]>(() => getInitialCandles(COINS[0].symbol, 60));
  const [amount, setAmount] = useState<number>(50);
  const [duration, setDuration] = useState<number>(60);
  const [direction, setDirection] = useState<"UP" | "DOWN" | null>(null);
  const [activeTrade, setActiveTrade] = useState<ActiveTrade | null>(null);
  const [history, setHistory] = useState<TradeHistory[]>([]);
  const [resultModal, setResultModal] = useState<SettledResult | null>(null);
  const [placing, setPlacing] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Switch coin → reset candles
  useEffect(() => {
    setCandles(getInitialCandles(coin.symbol, 60));
  }, [coin]);

  // Live tick — nudge last candle every 2s
  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      setCandles((prev) => {
        const last = prev[prev.length - 1];
        const ticked = tickCandle(last, coin.symbol);
        return [...prev.slice(0, -1), ticked];
      });
    }, 2000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [coin]);

  // Push new candle every 60s
  useEffect(() => {
    if (nextRef.current) clearTimeout(nextRef.current);
    nextRef.current = setTimeout(function push() {
      setCandles((prev) => {
        const last = prev[prev.length - 1];
        const nc = nextCandle(last.close, coin.symbol);
        return [...prev.slice(1), nc];
      });
      nextRef.current = setTimeout(push, 60000);
    }, 60000);
    return () => {
      if (nextRef.current) clearTimeout(nextRef.current);
    };
  }, [coin]);

  // Load history for authed users
  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch("/api/trade/history");
        const data = await res.json();
        if (!cancelled && data.trades) setHistory(data.trades);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const pattern = useMemo(() => computePattern(candles), [candles]);

  const chartData: ChartRow[] = useMemo(() => {
    return candles.map((c, i) => {
      const b = pattern.bollinger[i];
      const ma = pattern.ma[i];
      return {
        time: c.time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume,
        upper: b && !isNaN(b.upper) ? b.upper : null,
        middle: b && !isNaN(b.middle) ? b.middle : null,
        lower: b && !isNaN(b.lower) ? b.lower : null,
        ma: ma && !isNaN(ma) ? ma : null,
      };
    });
  }, [candles, pattern]);

  const lastCandle = candles[candles.length - 1];
  const firstCandle = candles[0];
  const currentPrice = lastCandle.close;
  const dayChange = ((lastCandle.close - firstCandle.open) / firstCandle.open) * 100;
  const dayHigh = Math.max(...candles.map((c) => c.high));
  const dayLow = Math.min(...candles.map((c) => c.low));

  const yMin = Math.min(...candles.map((c) => c.low)) * 0.999;
  const yMax = Math.max(...candles.map((c) => c.high)) * 1.001;

  const payoutRate = DURATIONS.find((d) => d.seconds === duration)?.payoutRate ?? 0.2;
  const potentialProfit = amount * payoutRate;
  const totalReturn = amount + potentialProfit;

  const placeTrade = async () => {
    if (!user) {
      toast.error("Please login to trade.");
      return;
    }
    if (!direction) {
      toast.error("Choose UP or DOWN.");
      return;
    }
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    if (amount > user.balance) {
      toast.error("Insufficient balance.");
      return;
    }
    setPlacing(true);
    try {
      const res = await apiFetch("/api/trade/execute", {
        method: "POST",
        body: JSON.stringify({ symbol: coin.symbol, direction, amount, duration }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Trade failed.");
        return;
      }
      setUser(data.user as AuthUser);
      const t = data.trade;
      const at: ActiveTrade = {
        id: t.id,
        tradeId: t.tradeId,
        symbol: t.symbol,
        direction: t.direction,
        amount: t.amount,
        duration: t.duration,
        entryPrice: t.entryPrice,
        payoutRate: t.payoutRate,
        remaining: t.duration,
      };
      setActiveTrade(at);
      toast.success(`Trade placed — settles in ${t.duration}s`);
      setDirection(null);

      // Countdown
      countdownRef.current = setInterval(() => {
        setActiveTrade((prev) => (prev ? { ...prev, remaining: Math.max(0, prev.remaining - 1) } : prev));
      }, 1000);

      // Settle after duration
      settleRef.current = setTimeout(async () => {
        try {
          if (countdownRef.current) clearInterval(countdownRef.current);
          const sres = await apiFetch("/api/trade/settle", {
            method: "POST",
            body: JSON.stringify({ tradeId: t.tradeId }),
          });
          const sdata = await sres.json();
          if (sres.ok) {
            setUser(sdata.user as AuthUser);
            setResultModal({
              tradeId: sdata.trade.tradeId,
              result: sdata.trade.result,
              profit: sdata.trade.profit,
              amount: sdata.trade.amount,
              symbol: sdata.trade.symbol,
              direction: sdata.trade.direction,
              entryPrice: sdata.trade.entryPrice,
              exitPrice: sdata.trade.exitPrice,
            });
            // Refetch history
            try {
              const hres = await apiFetch("/api/trade/history");
              const hdata = await hres.json();
              if (hdata.trades) setHistory(hdata.trades);
            } catch {}
          }
        } catch (e) {
          console.error(e);
        } finally {
          setActiveTrade(null);
        }
      }, t.duration * 1000);
    } catch (e) {
      console.error(e);
      toast.error("Network error.");
    } finally {
      setPlacing(false);
    }
  };

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (settleRef.current) clearTimeout(settleRef.current);
    };
  }, []);

  const authed = !!user;

  return (
    <main className="flex-1 pt-20 pb-10 bx-fade-in">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* Chart card */}
          <div className="bx-glass rounded-2xl p-5">
            {/* Coin selector */}
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-2 overflow-x-auto bx-scroll max-w-full pb-1">
                {COINS.map((c) => {
                  const active = c.symbol === coin.symbol;
                  return (
                    <button
                      key={c.symbol}
                      onClick={() => setCoin(c)}
                      className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                        active ? "bx-blue-gradient text-white bx-glow" : "border border-white/10 text-muted-foreground hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <span style={{ color: c.color }}>{c.icon}</span>
                      {c.symbol}
                    </button>
                  );
                })}
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs text-[#00c853]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00c853] bx-pulse-dot" /> LIVE
              </div>
            </div>

            {/* Price + change */}
            <div className="flex items-end justify-between mb-3">
              <div>
                <div className="text-2xl font-bold text-white">{formatPrice(currentPrice)}</div>
                <div className="text-xs text-muted-foreground">{coin.name}/USDT</div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <div className="text-muted-foreground">24h HIGH</div>
                  <div className="text-white font-semibold">{formatPrice(dayHigh)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">24h LOW</div>
                  <div className="text-white font-semibold">{formatPrice(dayLow)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">CHANGE</div>
                  <div className={`font-semibold ${dayChange >= 0 ? "text-[#00c853]" : "text-[#ff3b30]"}`}>
                    {dayChange >= 0 ? "+" : ""}{dayChange.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="relative h-[440px]">
              {/* Base layer — candlesticks */}
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    interval={Math.floor(chartData.length / 6)}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[yMin, yMax]}
                    tickFormatter={(v) => formatPrice(v)}
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    orientation="right"
                    width={70}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="high" shape={makeCandlestickShape(yMin, yMax) as any} isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>

              {/* Overlay layer — patterns (blurred if not authed) */}
              <div className={`absolute inset-0 pointer-events-none ${!authed ? "blur-[10px] opacity-40" : ""}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
                    <YAxis domain={[yMin, yMax]} orientation="right" width={70} hide />
                    <XAxis dataKey="time" hide />
                    <Area dataKey="lower" stroke="none" fill="#2196f3" fillOpacity={0.05} isAnimationActive={false} />
                    <Line dataKey="upper" stroke="#2196f3" strokeWidth={1} strokeDasharray="3 3" dot={false} isAnimationActive={false} />
                    <Line dataKey="lower" stroke="#2196f3" strokeWidth={1} strokeDasharray="3 3" dot={false} isAnimationActive={false} />
                    <Line dataKey="middle" stroke="#42a5f5" strokeWidth={1} strokeDasharray="1 2" dot={false} isAnimationActive={false} />
                    <Line dataKey="ma" stroke="#f5a623" strokeWidth={1.2} dot={false} isAnimationActive={false} />
                    <ReferenceLine y={pattern.resistance} stroke="#ff3b30" strokeDasharray="4 4" strokeWidth={1} />
                    <ReferenceLine y={pattern.support} stroke="#00c853" strokeDasharray="4 4" strokeWidth={1} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Lock overlay for guests */}
              {!authed && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-gradient-to-b from-[#02060f]/55 via-[#02060f]/70 to-[#02060f]/85 rounded-lg">
                  <div className="bx-glass rounded-2xl p-6 text-center max-w-xs">
                    <div className="h-14 w-14 rounded-full bx-blue-gradient bx-glow flex items-center justify-center mx-auto mb-3">
                      <Lock className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Trading Pattern Locked</h3>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Login to reveal Bollinger Bands, Moving Averages, and Support/Resistance levels.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => useAuth.getState().navigate("login")}
                      className="mt-3 bx-blue-gradient bx-glow text-white border-0"
                    >
                      Login Now
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 flex-wrap mt-3 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-1"><span className="h-0.5 w-3 bg-[#2196f3]" /> Bollinger</span>
              <span className="inline-flex items-center gap-1"><span className="h-0.5 w-3 bg-[#f5a623]" /> MA</span>
              <span className="inline-flex items-center gap-1"><span className="h-0.5 w-3 bg-[#ff3b30]" /> Resistance</span>
              <span className="inline-flex items-center gap-1"><span className="h-0.5 w-3 bg-[#00c853]" /> Support</span>
              {!authed && (
                <span className="ml-auto text-[#42a5f5]">Pattern locked — login to reveal</span>
              )}
            </div>
          </div>

          {/* Trade panel */}
          <div className="space-y-4">
            <div className="bx-glass rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#2196f3]" /> Place a trade
              </h2>

              {/* Active trade banner */}
              {activeTrade && (
                <div className="bx-glass-soft rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[#42a5f5]" />
                      <span className="font-semibold text-white">Trade active</span>
                    </span>
                    <span className="text-[#42a5f5] font-bold">{activeTrade.remaining}s</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${activeTrade.direction === "UP" ? "bg-[#00c853]" : "bg-[#ff3b30]"}`}
                      initial={{ width: "100%" }}
                      animate={{ width: `${(activeTrade.remaining / activeTrade.duration) * 100}%` }}
                      transition={{ ease: "linear", duration: 1 }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{activeTrade.symbol} • {activeTrade.direction} • {activeTrade.amount} USDT</span>
                    <span>@ {formatPrice(activeTrade.entryPrice)}</span>
                  </div>
                </div>
              )}

              {/* Direction */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => !activeTrade && setDirection("UP")}
                  disabled={!!activeTrade}
                  className={`h-14 rounded-lg flex flex-col items-center justify-center gap-0.5 transition border ${
                    direction === "UP"
                      ? "bg-gradient-to-b from-[#00c853] to-[#009624] text-white border-transparent bx-glow"
                      : "border-[#00c853]/30 text-[#00c853] hover:bg-[#00c853]/10"
                  } ${activeTrade ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <ArrowUp className="h-5 w-5" />
                  <span className="text-xs font-bold">BUY UP</span>
                </button>
                <button
                  onClick={() => !activeTrade && setDirection("DOWN")}
                  disabled={!!activeTrade}
                  className={`h-14 rounded-lg flex flex-col items-center justify-center gap-0.5 transition border ${
                    direction === "DOWN"
                      ? "bg-gradient-to-b from-[#ff3b30] to-[#b32020] text-white border-transparent bx-glow"
                      : "border-[#ff3b30]/30 text-[#ff3b30] hover:bg-[#ff3b30]/10"
                  } ${activeTrade ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <ArrowDown className="h-5 w-5" />
                  <span className="text-xs font-bold">BUY DOWN</span>
                </button>
              </div>

              {/* Duration */}
              <div className="mb-4">
                <div className="text-xs text-muted-foreground mb-2">Duration</div>
                <div className="grid grid-cols-3 gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.seconds}
                      onClick={() => !activeTrade && setDuration(d.seconds)}
                      disabled={!!activeTrade}
                      className={`h-12 rounded-lg text-xs font-semibold transition border ${
                        duration === d.seconds
                          ? "bx-blue-gradient text-white border-transparent bx-glow"
                          : "border-white/10 text-muted-foreground hover:text-white hover:bg-white/5"
                      } ${activeTrade ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div>{d.label}</div>
                      <div className="text-[9px] opacity-80">+{(d.payoutRate * 100).toFixed(0)}%</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-muted-foreground">Amount (USDT)</span>
                  <span className="text-muted-foreground">Bal: {user ? user.balance.toFixed(2) : "—"}</span>
                </div>
                <Input
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                  disabled={!authed || !!activeTrade}
                  className="bg-white/5 border-white/10 h-10"
                />
                <div className="grid grid-cols-6 gap-1.5 mt-2">
                  {QUICK_AMOUNTS.map((a) => (
                    <button
                      key={a}
                      onClick={() => !activeTrade && setAmount(a)}
                      disabled={!authed || !!activeTrade}
                      className={`h-7 rounded text-[10px] font-medium border transition ${
                        amount === a
                          ? "border-[#2196f3] text-white bg-[#2196f3]/15"
                          : "border-white/10 text-muted-foreground hover:text-white hover:bg-white/5"
                      } ${!authed || activeTrade ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payout preview */}
              <div className="bx-glass-soft rounded-lg p-3 mb-4 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Potential profit</span>
                  <span className="text-[#00c853] font-bold">+{potentialProfit.toFixed(2)} USDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total return on win</span>
                  <span className="text-white font-semibold">{totalReturn.toFixed(2)} USDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payout rate</span>
                  <span className="text-white">{(payoutRate * 100).toFixed(0)}%</span>
                </div>
              </div>

              <Button
                onClick={placeTrade}
                disabled={placing || !!activeTrade || !authed}
                className="w-full bx-blue-gradient bx-glow text-white border-0 h-11"
              >
                {!authed ? (
                  <span className="inline-flex items-center gap-2"><Lock className="h-4 w-4" /> Login to trade</span>
                ) : placing ? (
                  <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Placing...</span>
                ) : activeTrade ? (
                  <span>Trade active — {activeTrade.remaining}s</span>
                ) : direction ? (
                  `Buy ${direction} ${coin.symbol}`
                ) : (
                  "Select direction"
                )}
              </Button>
            </div>

            {/* Recent trades */}
            <div className="bx-glass rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <History className="h-4 w-4 text-[#2196f3]" /> Recent trades
              </h3>
              {!authed ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  Login to view your trade history.
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No trades yet. Place your first trade above.
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto bx-scroll space-y-1.5">
                  {history.slice(0, 10).map((t) => {
                    const Icon = t.direction === "UP" ? ArrowUp : ArrowDown;
                    const color = t.direction === "UP" ? "text-[#00c853]" : "text-[#ff3b30]";
                    return (
                      <div key={t.id} className="flex items-center justify-between text-xs border border-white/5 rounded-md px-2.5 py-2 hover:bg-white/5">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-3.5 w-3.5 ${color}`} />
                          <div>
                            <div className="text-white font-medium">{t.symbol} • {t.duration}s</div>
                            <div className="text-[10px] text-muted-foreground">
                              {new Date(t.createdAt).toLocaleTimeString()} • {t.amount} USDT
                            </div>
                          </div>
                        </div>
                        {t.result === "PENDING" ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-400">PENDING</span>
                        ) : t.result === "WIN" ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#00c853]/15 text-[#00c853]">+{t.profit.toFixed(2)}</span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#ff3b30]/15 text-[#ff3b30]">{t.profit.toFixed(2)}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Result modal */}
      <AnimatePresence>
        {resultModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#02060f]/80 backdrop-blur-sm p-4"
            onClick={() => setResultModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bx-glass rounded-2xl p-8 max-w-sm w-full text-center bx-glow"
            >
              <button onClick={() => setResultModal(null)} className="absolute top-3 right-3 text-muted-foreground hover:text-white">
                <X className="h-4 w-4" />
              </button>
              {resultModal.result === "WIN" ? (
                <>
                  <div className="h-20 w-20 rounded-full bg-[#00c853]/15 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-10 w-10 text-[#00c853]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#00c853]">You Won!</h3>
                  <p className="text-sm text-muted-foreground mt-1">{resultModal.symbol} • {resultModal.direction}</p>
                  <div className="bx-glass-soft rounded-lg p-4 mt-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Entry</span><span className="text-white">{formatPrice(resultModal.entryPrice)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Exit</span><span className="text-white">{formatPrice(resultModal.exitPrice)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Profit</span><span className="text-[#00c853] font-bold">+{resultModal.profit.toFixed(2)} USDT</span></div>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-20 w-20 rounded-full bg-[#ff3b30]/15 flex items-center justify-center mx-auto mb-4">
                    <XCircle className="h-10 w-10 text-[#ff3b30]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#ff3b30]">You Lost</h3>
                  <p className="text-sm text-muted-foreground mt-1">{resultModal.symbol} • {resultModal.direction}</p>
                  <div className="bx-glass-soft rounded-lg p-4 mt-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Entry</span><span className="text-white">{formatPrice(resultModal.entryPrice)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Exit</span><span className="text-white">{formatPrice(resultModal.exitPrice)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Loss</span><span className="text-[#ff3b30] font-bold">{resultModal.profit.toFixed(2)} USDT</span></div>
                  </div>
                </>
              )}
              <Button onClick={() => setResultModal(null)} className="mt-5 w-full bx-blue-gradient bx-glow text-white border-0">
                Trade again
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default TradeView;
