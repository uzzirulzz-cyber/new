"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { fmtUsd, fmtCompact, fmtNum } from "@/lib/format";
import {
  tradeablePairs,
  genCandles,
  genOrderBook,
  genRecentTrades,
  portfolio,
  openOrders,
  orderHistory,
  TIMEFRAMES,
  type Candle,
} from "@/lib/trading-data";

type Side = "buy" | "sell";

export function TradingSection() {
  const [selectedPair, setSelectedPair] = useState(tradeablePairs[0].pair);
  const [search, setSearch] = useState("");
  const [starredOnly, setStarredOnly] = useState(false);
  const [starred, setStarred] = useState<Set<string>>(new Set(["BTC/USDT", "ETH/USDT"]));
  const [timeframe, setTimeframe] = useState("15m");
  const [side, setSide] = useState<Side>("buy");
  const [orderType, setOrderType] = useState<"limit" | "market">("limit");
  const [priceInput, setPriceInput] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [pct, setPct] = useState(0);
  const [tick, setTick] = useState(0);

  // Simulated live ticker — bump prices ~1.5s to feel "real-time"
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1500);
    return () => clearInterval(id);
  }, []);

  const pair = useMemo(
    () => tradeablePairs.find((p) => p.pair === selectedPair) ?? tradeablePairs[0],
    [selectedPair]
  );

  // Apply a small live wiggle to last price so the UI feels alive
  const livePrice = useMemo(() => {
    const wiggle = Math.sin(tick * 0.7) * pair.lastPrice * 0.0008;
    return pair.lastPrice + wiggle;
  }, [pair, tick]);

  const candles = useMemo(() => genCandles(pair.lastPrice, 60), [pair.lastPrice, pair.pair]);
  const { bids, asks } = useMemo(() => genOrderBook(livePrice), [livePrice]);
  const recentTrades = useMemo(() => genRecentTrades(livePrice, 14), [livePrice]);

  const maxBidTotal = bids[bids.length - 1]?.total ?? 1;
  const maxAskTotal = asks[asks.length - 1]?.total ?? 1;

  const filteredMarkets = useMemo(() => {
    return tradeablePairs.filter((p) => {
      if (search && !p.pair.toLowerCase().includes(search.toLowerCase())) return false;
      if (starredOnly && !starred.has(p.pair)) return false;
      return true;
    });
  }, [search, starredOnly, starred]);

  // Portfolio totals
  const portfolioTotal = portfolio.reduce((s, p) => s + p.usd, 0);
  const portfolioChange = portfolio.reduce((s, p) => s + p.usd * (p.change24h / 100), 0);
  const portfolioChangePct = (portfolioChange / portfolioTotal) * 100;

  // Find USDT balance for buy-side slider
  const usdtBalance = portfolio.find((p) => p.asset === "USDT")?.balance ?? 0;
  const baseBalance = portfolio.find((p) => p.asset === pair.base)?.balance ?? 0;

  // Order form derived values
  const price = orderType === "market" ? livePrice : Number(priceInput) || 0;
  const amount = Number(amountInput) || 0;
  const total = price * amount;

  const setSlider = (p: number) => {
    setPct(p);
    if (side === "buy") {
      const spend = (usdtBalance * p) / 100;
      setAmountInput(spend && price ? (spend / price).toFixed(4) : "");
    } else {
      const sell = (baseBalance * p) / 100;
      setAmountInput(sell.toFixed(4));
    }
  };

  const toggleStar = (pairName: string) => {
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(pairName)) next.delete(pairName);
      else next.add(pairName);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Top portfolio strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="card-gradient p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Portfolio Value</p>
          <p className="mt-1 text-xl font-semibold">{fmtUsd(portfolioTotal, { compact: true })}</p>
          <p className={`text-[10px] mt-0.5 ${portfolioChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {portfolioChange >= 0 ? "+" : ""}
            {fmtUsd(portfolioChange)} ({portfolioChangePct.toFixed(2)}%) today
          </p>
        </Card>
        {portfolio.slice(0, 3).map((p) => (
          <Card key={p.asset} className="card-gradient p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{p.asset}</p>
              <span
                className="h-5 w-5 flex items-center justify-center rounded-full text-[10px] font-bold"
                style={{ background: `${p.iconColor}25`, color: p.iconColor }}
              >
                {p.icon}
              </span>
            </div>
            <p className="mt-1 text-xl font-semibold">{fmtNum(p.balance, p.asset === "USDT" ? 2 : 4)}</p>
            <p className={`text-[10px] mt-0.5 ${p.change24h >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {p.change24h >= 0 ? "+" : ""}
              {p.change24h.toFixed(2)}% · {fmtUsd(p.usd, { compact: true })}
            </p>
          </Card>
        ))}
      </div>

      {/* Main 3-column trading grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)_300px] gap-4">
        {/* Left: market list */}
        <Card className="card-gradient p-0 overflow-hidden xl:sticky xl:top-20 xl:self-start xl:max-h-[calc(100vh-6rem)] flex flex-col">
          <div className="p-3 border-b border-border space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search pair…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs bg-muted/40"
              />
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setStarredOnly(false)}
                className={`flex-1 py-1 text-[10px] rounded-md transition-colors ${
                  !starredOnly ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStarredOnly(true)}
                className={`flex-1 py-1 text-[10px] rounded-md transition-colors flex items-center justify-center gap-1 ${
                  starredOnly ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Star className={`h-3 w-3 ${starredOnly ? "fill-amber-400 text-amber-400" : ""}`} />
                Starred
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 text-[10px] text-muted-foreground border-b border-border">
            <span className="flex-1">Pair</span>
            <span className="text-right w-16">Last</span>
            <span className="text-right w-12">24h</span>
          </div>
          <div className="overflow-y-auto flex-1">
            {filteredMarkets.map((m) => {
              const isSel = m.pair === selectedPair;
              const isStar = starred.has(m.pair);
              return (
                <button
                  key={m.pair}
                  onClick={() => {
                    setSelectedPair(m.pair);
                    setPriceInput(m.lastPrice.toFixed(m.lastPrice < 1 ? 6 : 2));
                    setAmountInput("");
                    setPct(0);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors border-b border-border/40 ${
                    isSel ? "bg-emerald-500/10" : "hover:bg-muted/30"
                  }`}
                >
                  <Star
                    className={`h-3 w-3 shrink-0 cursor-pointer ${
                      isStar ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40 hover:text-foreground"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStar(m.pair);
                    }}
                  />
                  <span
                    className="h-4 w-4 flex items-center justify-center rounded-full text-[9px] font-bold shrink-0"
                    style={{ background: `${m.iconColor}25`, color: m.iconColor }}
                  >
                    {m.icon}
                  </span>
                  <span className="flex-1 text-left font-medium truncate">{m.base}/{m.quote}</span>
                  <span className="text-right w-16 font-mono text-[11px]">
                    {fmtUsd(m.lastPrice)}
                  </span>
                  <span
                    className={`text-right w-12 font-mono text-[10px] ${
                      m.change24h >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {m.change24h >= 0 ? "+" : ""}
                    {m.change24h.toFixed(1)}%
                  </span>
                </button>
              );
            })}
            {filteredMarkets.length === 0 && (
              <div className="px-3 py-8 text-center text-xs text-muted-foreground">
                No pairs match.
              </div>
            )}
          </div>
        </Card>

        {/* Center: chart + open orders */}
        <div className="space-y-4 min-w-0">
          <Card className="card-gradient p-4">
            {/* Pair header */}
            <div className="flex flex-wrap items-center gap-4 mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="h-9 w-9 flex items-center justify-center rounded-full text-base font-bold"
                  style={{ background: `${pair.iconColor}25`, color: pair.iconColor }}
                >
                  {pair.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold">{pair.pair}</h2>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${
                        pair.change24h >= 0
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-red-500/15 text-red-400"
                      }`}
                    >
                      {pair.change24h >= 0 ? "+" : ""}
                      {pair.change24h.toFixed(2)}%
                    </Badge>
                  </div>
                  <div className="text-[10px] text-muted-foreground">{pair.base} / {pair.quote}</div>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <motion.span
                  key={livePrice.toFixed(4)}
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl font-semibold font-mono"
                >
                  {fmtUsd(livePrice)}
                </motion.span>
                <span className="text-[10px] text-muted-foreground">live</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot ml-1" />
              </div>
              <div className="ml-auto flex items-center gap-4 text-[11px] text-muted-foreground">
                <div>
                  <span>24h H </span>
                  <span className="font-mono text-foreground">{fmtUsd(pair.high24h)}</span>
                </div>
                <div>
                  <span>24h L </span>
                  <span className="font-mono text-foreground">{fmtUsd(pair.low24h)}</span>
                </div>
                <div className="hidden sm:block">
                  <span>24h V </span>
                  <span className="font-mono text-foreground">{fmtCompact(pair.volume24h)} {pair.base}</span>
                </div>
              </div>
            </div>

            {/* Timeframe selector */}
            <div className="flex items-center gap-1 mb-2">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf.label}
                  onClick={() => setTimeframe(tf.label)}
                  className={`px-2 py-1 text-[10px] rounded transition-colors ${
                    timeframe === tf.label
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tf.label}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-1.5">
                <Badge variant="secondary" className="text-[10px] bg-muted/60">
                  Depth: 12 levels
                </Badge>
              </div>
            </div>

            {/* Candlestick chart */}
            <CandleChart candles={candles} lastPrice={livePrice} />
          </Card>

          {/* Open orders + history tabs */}
          <Card className="card-gradient p-0 overflow-hidden">
            <Tabs defaultValue="open">
              <div className="px-4 pt-3 border-b border-border">
                <TabsList className="bg-transparent p-0 h-auto">
                  <TabsTrigger
                    value="open"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-1.5 text-xs rounded-t-md border-b-2 border-transparent data-[state=active]:border-emerald-400 data-[state=active]:text-emerald-400"
                  >
                    Open Orders <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">{openOrders.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-1.5 text-xs rounded-t-md border-b-2 border-transparent data-[state=active]:border-emerald-400 data-[state=active]:text-emerald-400"
                  >
                    Order History
                  </TabsTrigger>
                  <TabsTrigger
                    value="portfolio"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-1.5 text-xs rounded-t-md border-b-2 border-transparent data-[state=active]:border-emerald-400 data-[state=active]:text-emerald-400"
                  >
                    Portfolio
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="open" className="mt-0 p-0">
                <OrdersTable />
              </TabsContent>
              <TabsContent value="history" className="mt-0 p-0">
                <HistoryTable />
              </TabsContent>
              <TabsContent value="portfolio" className="mt-0 p-0">
                <PortfolioTable />
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Right: trade form + order book + recent trades */}
        <div className="space-y-4 xl:sticky xl:top-20 xl:self-start xl:max-h-[calc(100vh-6rem)] overflow-y-auto pr-0.5">
          {/* Trade form */}
          <Card className="card-gradient p-4">
            <div className="grid grid-cols-2 gap-1 p-1 bg-muted/40 rounded-lg mb-3">
              <button
                onClick={() => setSide("buy")}
                className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                  side === "buy"
                    ? "bg-emerald-500 text-emerald-950"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Buy {pair.base}
              </button>
              <button
                onClick={() => setSide("sell")}
                className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                  side === "sell"
                    ? "bg-red-500 text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sell {pair.base}
              </button>
            </div>

            <div className="flex items-center gap-1 mb-3">
              <button
                onClick={() => setOrderType("limit")}
                className={`px-2.5 py-1 text-[10px] rounded ${
                  orderType === "limit" ? "bg-muted text-foreground" : "text-muted-foreground"
                }`}
              >
                Limit
              </button>
              <button
                onClick={() => setOrderType("market")}
                className={`px-2.5 py-1 text-[10px] rounded ${
                  orderType === "market" ? "bg-muted text-foreground" : "text-muted-foreground"
                }`}
              >
                Market
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-muted-foreground">Available</label>
                <p className="text-xs font-mono">
                  {side === "buy"
                    ? `${fmtNum(usdtBalance, 2)} ${pair.quote}`
                    : `${fmtNum(baseBalance, 4)} ${pair.base}`}
                </p>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">
                  Price {orderType === "market" && "(market)"}
                </label>
                <Input
                  type="number"
                  placeholder={livePrice.toFixed(pair.lastPrice < 1 ? 6 : 2)}
                  value={orderType === "market" ? "" : priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  disabled={orderType === "market"}
                  className="h-8 text-xs font-mono bg-muted/40"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Amount ({pair.base})</label>
                <Input
                  type="number"
                  placeholder="0.0000"
                  value={amountInput}
                  onChange={(e) => {
                    setAmountInput(e.target.value);
                    setPct(0);
                  }}
                  className="h-8 text-xs font-mono bg-muted/40"
                />
              </div>
              {/* Slider */}
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={pct}
                onChange={(e) => setSlider(Number(e.target.value))}
                className="w-full h-1.5 accent-emerald-500 bg-muted rounded-full appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground">
                {[0, 25, 50, 75, 100].map((p) => (
                  <button
                    key={p}
                    onClick={() => setSlider(p)}
                    className="hover:text-foreground"
                  >
                    {p}%
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs pt-1">
                <span className="text-muted-foreground">Total</span>
                <span className="font-mono font-medium">{fmtUsd(total)}</span>
              </div>
              <Button
                className={`w-full mt-2 h-9 ${
                  side === "buy"
                    ? "bg-emerald-500 hover:bg-emerald-600 text-emerald-950"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
                disabled={amount <= 0}
              >
                {side === "buy" ? "Buy" : "Sell"} {pair.base}
              </Button>
              <p className="text-[9px] text-muted-foreground text-center">
                Fee: 0.10% · Est. {side === "buy" ? pair.base : pair.quote} fee:{" "}
                {side === "buy"
                  ? `${fmtNum(amount * 0.001, 4)} ${pair.base}`
                  : `${fmtNum(total * 0.001, 2)} ${pair.quote}`}
              </p>
            </div>
          </Card>

          {/* Order book */}
          <Card className="card-gradient p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold">Order Book</h3>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
                Live
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1 text-[10px] text-muted-foreground px-1 pb-1 border-b border-border/40">
              <span>Price ({pair.quote})</span>
              <span className="text-right">Size ({pair.base})</span>
              <span className="text-right">Total</span>
            </div>
            {/* Asks (reversed: highest at top, lowest at bottom near mid) */}
            <div className="space-y-0.5 py-1">
              {[...asks].reverse().map((a, i) => (
                <div
                  key={`a-${i}`}
                  className="relative grid grid-cols-3 gap-1 text-[10px] py-0.5 px-1"
                >
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-red-500/10"
                    style={{ width: `${(a.total / maxAskTotal) * 100}%` }}
                  />
                  <span className="relative text-red-400 font-mono">{fmtNum(a.price, pair.lastPrice < 1 ? 6 : 2)}</span>
                  <span className="relative text-right font-mono">{fmtNum(a.size, 4)}</span>
                  <span className="relative text-right font-mono text-muted-foreground">{fmtCompact(a.total)}</span>
                </div>
              ))}
            </div>
            {/* Mid */}
            <div className="flex items-center justify-between px-1 py-1.5 border-y border-border/40 bg-muted/30">
              <span className={`text-sm font-mono font-semibold ${pair.change24h >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {fmtUsd(livePrice)}
              </span>
              <div className="flex items-center gap-1">
                {pair.change24h >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-400" />
                )}
                <span className="text-[10px] text-muted-foreground">Spread {fmtNum((asks[0].price - bids[0].price) / livePrice * 100, 3)}%</span>
              </div>
            </div>
            {/* Bids */}
            <div className="space-y-0.5 py-1">
              {bids.map((b, i) => (
                <div
                  key={`b-${i}`}
                  className="relative grid grid-cols-3 gap-1 text-[10px] py-0.5 px-1"
                >
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-emerald-500/10"
                    style={{ width: `${(b.total / maxBidTotal) * 100}%` }}
                  />
                  <span className="relative text-emerald-400 font-mono">{fmtNum(b.price, pair.lastPrice < 1 ? 6 : 2)}</span>
                  <span className="relative text-right font-mono">{fmtNum(b.size, 4)}</span>
                  <span className="relative text-right font-mono text-muted-foreground">{fmtCompact(b.total)}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent trades */}
          <Card className="card-gradient p-3">
            <h3 className="text-xs font-semibold mb-2">Recent Trades</h3>
            <div className="grid grid-cols-3 gap-1 text-[10px] text-muted-foreground px-1 pb-1 border-b border-border/40">
              <span>Price</span>
              <span className="text-right">Size</span>
              <span className="text-right">Time</span>
            </div>
            <div className="max-h-44 overflow-y-auto">
              {recentTrades.map((t) => (
                <div key={t.id} className="grid grid-cols-3 gap-1 text-[10px] py-0.5 px-1">
                  <span className={`font-mono ${t.side === "buy" ? "text-emerald-400" : "text-red-400"}`}>
                    {fmtNum(t.price, pair.lastPrice < 1 ? 6 : 2)}
                  </span>
                  <span className="text-right font-mono">{fmtNum(t.size, 4)}</span>
                  <span className="text-right font-mono text-muted-foreground">{t.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/** Lightweight SVG candlestick chart (no chart-lib dependency, always crisp). */
function CandleChart({ candles, lastPrice }: { candles: Candle[]; lastPrice: number }) {
  const w = 720;
  const h = 280;
  const padL = 8;
  const padR = 56;
  const padT = 12;
  const padB = 28;

  const prices = candles.flatMap((c) => [c.h, c.l]);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const plotW = w - padL - padR;
  const plotH = h - padT - padB;
  const cw = plotW / candles.length;
  const bodyW = Math.max(2, cw * 0.55);

  const y = (p: number) => padT + plotH - ((p - min) / range) * plotH;
  const x = (i: number) => padL + i * cw + cw / 2;

  // y-axis ticks
  const ticks = Array.from({ length: 5 }, (_, i) => {
    const v = min + (range * i) / 4;
    return { v, y: y(v) };
  });

  // volume bars baseline
  const maxVol = Math.max(...candles.map((c) => c.v));
  const volH = 24;
  const volBase = h - padB + 2;

  const first = candles[0]?.o ?? 0;
  const last = candles[candles.length - 1]?.c ?? 0;
  const up = last >= first;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-72 min-w-[560px]" preserveAspectRatio="none">
        {/* horizontal grid */}
        {ticks.map((t) => (
          <g key={t.v}>
            <line
              x1={padL}
              x2={w - padR}
              y1={t.y}
              y2={t.y}
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="2 4"
            />
            <text
              x={w - padR + 4}
              y={t.y + 3}
              fill="rgba(255,255,255,0.45)"
              fontSize={9}
              fontFamily="monospace"
            >
              {fmtNum(t.v, t.v < 1 ? 6 : t.v < 100 ? 2 : 0)}
            </text>
          </g>
        ))}
        {/* candles */}
        {candles.map((c, i) => {
          const cup = c.c >= c.o;
          const color = cup ? "#10b981" : "#ef4444";
          const bodyTop = y(Math.max(c.o, c.c));
          const bodyBottom = y(Math.min(c.o, c.c));
          const bodyHeight = Math.max(1, bodyBottom - bodyTop);
          const cx = x(i);
          return (
            <g key={i}>
              {/* wick */}
              <line
                x1={cx}
                x2={cx}
                y1={y(c.h)}
                y2={y(c.l)}
                stroke={color}
                strokeWidth={1}
                opacity={0.85}
              />
              {/* body */}
              <rect
                x={cx - bodyW / 2}
                y={bodyTop}
                width={bodyW}
                height={bodyHeight}
                fill={color}
                opacity={cup ? 0.95 : 0.85}
                rx={0.5}
              />
              {/* volume bar (semi-transparent) */}
              <rect
                x={cx - bodyW / 2}
                y={volBase - (c.v / maxVol) * volH}
                width={bodyW}
                height={(c.v / maxVol) * volH}
                fill={color}
                opacity={0.18}
              />
            </g>
          );
        })}
        {/* last price marker */}
        <line
          x1={padL}
          x2={w - padR}
          y1={y(lastPrice)}
          y2={y(lastPrice)}
          stroke={up ? "#10b981" : "#ef4444"}
          strokeWidth={1}
          strokeDasharray="3 3"
          opacity={0.8}
        />
        <rect
          x={w - padR}
          y={y(lastPrice) - 7}
          width={padR}
          height={14}
          fill={up ? "#10b981" : "#ef4444"}
          rx={2}
        />
        <text
          x={w - padR + 4}
          y={y(lastPrice) + 3}
          fill="#0a0f0d"
          fontSize={9}
          fontWeight={700}
          fontFamily="monospace"
        >
          {fmtNum(lastPrice, lastPrice < 1 ? 6 : 2)}
        </text>
      </svg>
    </div>
  );
}

function OrdersTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border text-[10px] text-muted-foreground">
            <th className="text-left font-medium pl-4 py-2">Pair</th>
            <th className="text-left font-medium py-2 hidden sm:table-cell">Type</th>
            <th className="text-left font-medium py-2">Side</th>
            <th className="text-right font-medium py-2">Price</th>
            <th className="text-right font-medium py-2">Size</th>
            <th className="text-right font-medium py-2 hidden md:table-cell">Filled</th>
            <th className="text-right font-medium py-2 hidden sm:table-cell">Time</th>
            <th className="text-right font-medium pr-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {openOrders.map((o) => (
            <tr key={o.id} className="border-b border-border/40 hover:bg-muted/20">
              <td className="pl-4 py-2.5 font-medium">{o.pair}</td>
              <td className="py-2.5 hidden sm:table-cell capitalize text-muted-foreground">{o.type}</td>
              <td className="py-2.5">
                <Badge
                  variant="secondary"
                  className={`text-[10px] capitalize ${
                    o.side === "buy"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-red-500/15 text-red-400"
                  }`}
                >
                  {o.side}
                </Badge>
              </td>
              <td className="text-right py-2.5 font-mono">{fmtNum(o.price, o.price < 1 ? 6 : 2)}</td>
              <td className="text-right py-2.5 font-mono">{fmtNum(o.size, 4)}</td>
              <td className="text-right py-2.5 hidden md:table-cell">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-12 h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full ${o.side === "buy" ? "bg-emerald-400" : "bg-red-400"}`}
                      style={{ width: `${o.filled}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground w-7">{o.filled}%</span>
                </div>
              </td>
              <td className="text-right py-2.5 hidden sm:table-cell font-mono text-[10px] text-muted-foreground">{o.placedAt}</td>
              <td className="text-right pr-4 py-2.5">
                <Button variant="ghost" size="sm" className="h-7 text-[10px] text-muted-foreground hover:text-red-400">
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </td>
            </tr>
          ))}
          {openOrders.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center py-8 text-muted-foreground text-xs">
                No open orders.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function HistoryTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border text-[10px] text-muted-foreground">
            <th className="text-left font-medium pl-4 py-2">Pair</th>
            <th className="text-left font-medium py-2 hidden sm:table-cell">Type</th>
            <th className="text-left font-medium py-2">Side</th>
            <th className="text-right font-medium py-2">Price</th>
            <th className="text-right font-medium py-2">Size</th>
            <th className="text-right font-medium py-2 hidden sm:table-cell">Total</th>
            <th className="text-right font-medium py-2">Status</th>
            <th className="text-right font-medium pr-4 py-2 hidden md:table-cell">Time</th>
          </tr>
        </thead>
        <tbody>
          {orderHistory.map((o) => (
            <tr key={o.id} className="border-b border-border/40 hover:bg-muted/20">
              <td className="pl-4 py-2.5 font-medium">{o.pair}</td>
              <td className="py-2.5 hidden sm:table-cell capitalize text-muted-foreground">{o.type}</td>
              <td className="py-2.5">
                <Badge
                  variant="secondary"
                  className={`text-[10px] capitalize ${
                    o.side === "buy"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-red-500/15 text-red-400"
                  }`}
                >
                  {o.side}
                </Badge>
              </td>
              <td className="text-right py-2.5 font-mono">{fmtNum(o.price, o.price < 1 ? 6 : 2)}</td>
              <td className="text-right py-2.5 font-mono">{fmtNum(o.size, 4)}</td>
              <td className="text-right py-2.5 hidden sm:table-cell font-mono">{fmtUsd(o.total)}</td>
              <td className="text-right py-2.5">
                <Badge
                  variant="secondary"
                  className={`text-[10px] capitalize ${
                    o.status === "filled"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {o.status}
                </Badge>
              </td>
              <td className="text-right pr-4 py-2.5 hidden md:table-cell font-mono text-[10px] text-muted-foreground">{o.executedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PortfolioTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border text-[10px] text-muted-foreground">
            <th className="text-left font-medium pl-4 py-2">Asset</th>
            <th className="text-right font-medium py-2">Balance</th>
            <th className="text-right font-medium py-2">USD Value</th>
            <th className="text-right font-medium py-2 hidden sm:table-cell">24h</th>
            <th className="text-right font-medium pr-4 py-2 hidden md:table-cell">Allocation</th>
          </tr>
        </thead>
        <tbody>
          {portfolio.map((p) => {
            const totalUsd = portfolio.reduce((s, x) => s + x.usd, 0);
            const pct = (p.usd / totalUsd) * 100;
            return (
              <tr key={p.asset} className="border-b border-border/40 hover:bg-muted/20">
                <td className="pl-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-7 w-7 flex items-center justify-center rounded-full text-xs font-bold"
                      style={{ background: `${p.iconColor}25`, color: p.iconColor }}
                    >
                      {p.icon}
                    </span>
                    <span className="font-medium">{p.asset}</span>
                  </div>
                </td>
                <td className="text-right py-2.5 font-mono">{fmtNum(p.balance, p.asset === "USDT" ? 2 : 4)}</td>
                <td className="text-right py-2.5 font-mono">{fmtUsd(p.usd)}</td>
                <td className="text-right py-2.5 hidden sm:table-cell">
                  <span className={p.change24h >= 0 ? "text-emerald-400" : "text-red-400"}>
                    {p.change24h >= 0 ? "+" : ""}
                    {p.change24h.toFixed(2)}%
                  </span>
                </td>
                <td className="text-right pr-4 py-2.5 hidden md:table-cell">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-emerald-400" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground w-8">{pct.toFixed(1)}%</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
