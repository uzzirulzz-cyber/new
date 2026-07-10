"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CandlestickChart,
  ChevronRight,
  Headset,
  Lock,
  ShieldCheck,
  Sparkles,
  Trophy,
  Wallet,
  Zap,
} from "lucide-react";
import { COINS, formatPrice, type Coin } from "@/lib/market-data";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";

function useLivePrices() {
  const [prices, setPrices] = useState(() => COINS.map((c) => ({ coin: c, price: c.basePrice, change: 0 })));
  useEffect(() => {
    const id = setInterval(() => {
      setPrices((prev) =>
        prev.map((p) => {
          const drift = (Math.random() - 0.5) * p.coin.basePrice * 0.003;
          const newPrice = Math.max(0.0001, p.price + drift);
          const change = ((newPrice - p.coin.basePrice) / p.coin.basePrice) * 100;
          return { ...p, price: newPrice, change };
        })
      );
    }, 2200);
    return () => clearInterval(id);
  }, []);
  return prices;
}

function genSparkline(coin: Coin) {
  const pts: { i: number; v: number }[] = [];
  let v = coin.basePrice;
  for (let i = 0; i < 24; i++) {
    v = Math.max(0.0001, v + (Math.random() - 0.5) * coin.basePrice * 0.012);
    pts.push({ i, v });
  }
  return pts;
}

function TickerTape() {
  const items = [...COINS, ...COINS];
  return (
    <div className="border-y border-white/5 bg-[#02060f]/60 overflow-hidden">
      <div className="bx-ticker-track py-2.5">
        {items.map((c, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-5 text-xs">
            <span style={{ color: c.color }} className="font-bold">{c.icon}</span>
            <span className="text-muted-foreground">{c.symbol}</span>
            <span className="text-white font-semibold">{formatPrice(c.basePrice)}</span>
            <span className="text-[#00c853]">+{(Math.random() * 2).toFixed(2)}%</span>
            <span className="text-white/10 mx-2">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function FloatingCoins() {
  const glyphs = ["₿", "Ξ", "◎", "B", "Ð", "₳"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {glyphs.map((g, i) => (
        <motion.span
          key={i}
          className="absolute text-4xl md:text-6xl font-bold text-[#2196f3]/15"
          style={{ left: `${10 + i * 15}%`, top: `${20 + (i % 3) * 22}%` }}
          animate={{ y: [0, -24, 0], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 }}
        >
          {g}
        </motion.span>
      ))}
    </div>
  );
}

function Hero() {
  const { navigate, user } = useAuth();
  return (
    <section className="relative overflow-hidden bx-grid-bg">
      <FloatingCoins />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 md:pt-28 pb-16 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2196f3]/30 bg-[#2196f3]/10 px-4 py-1.5 text-xs font-medium text-[#42a5f5] mb-6">
            <span className="h-2 w-2 rounded-full bg-[#00c853] bx-pulse-dot" />
            Live trading • 12+ assets • Up to 50% in 120s
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05]">
            Trade smarter.
            <br />
            <span className="bx-text-gradient">Grow faster.</span>
          </h1>
          <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Brock Exchange is the next-generation crypto trading platform. Trade binary options on
            BTC, ETH, SOL and 9 more assets with industry-leading payouts and lightning-fast settlement.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={() => navigate(user ? "trade" : "register")}
              className="bx-blue-gradient bx-glow text-white border-0 px-8 h-12 text-base"
            >
              {user ? "Start Trading" : "Get Started Free"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("login")}
              className="border-white/15 text-white hover:bg-white/5 h-12 px-8 text-base"
            >
              Login
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { label: "Active traders", value: "50K+" },
              { label: "Total volume", value: "$2.4B+" },
              { label: "Avg payout", value: "92%" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold bx-text-gradient">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: Zap, title: "Lightning execution", body: "Sub-second order matching. Trades settle in 30, 60 or 120 seconds.", color: "#2196f3" },
  { icon: ShieldCheck, title: "Bank-grade security", body: "256-bit SSL, cold-storage wallets, and 2FA across every account.", color: "#00c853" },
  { icon: Wallet, title: "Instant deposits", body: "Fund with card, bank, or crypto. Withdrawals processed 24/7.", color: "#f59e0b" },
  { icon: CandlestickChart, title: "Pro charting", body: "Bollinger Bands, moving averages, support/resistance built-in.", color: "#a855f7" },
  { icon: Headset, title: "24/7 support", body: "Real humans, all day. Average response under 2 minutes.", color: "#06b6d4" },
  { icon: BadgeCheck, title: "KYC verified", body: "Compliant onboarding. Your funds are protected by tier-1 banks.", color: "#ec4899" },
  { icon: Trophy, title: "Industry payouts", body: "Up to 50% returns on 120-second trades. No hidden fees.", color: "#10b981" },
  { icon: Sparkles, title: "VIP rewards", body: "Earn cashback, lower fees, and dedicated account managers.", color: "#e0e0e0" },
];

function FeaturesGrid() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold">
            Built for <span className="bx-text-gradient">serious traders</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            Every feature engineered for speed, security and clarity — so you can focus on the trade.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bx-glass rounded-xl p-5 hover:border-[#2196f3]/30 transition-colors"
            >
              <div
                className="h-11 w-11 rounded-lg flex items-center justify-center mb-4"
                style={{ background: `${f.color}1a`, color: f.color }}
              >
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MarketCard({ coin, onTrade }: { coin: Coin; onTrade: () => void }) {
  const spark = useMemo(() => genSparkline(coin), [coin]);
  const change = ((spark[spark.length - 1].v - spark[0].v) / spark[0].v) * 100;
  const up = change >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="bx-glass rounded-xl p-4 hover:border-[#2196f3]/30 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: `${coin.color}22`, color: coin.color }}
          >
            {coin.icon}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{coin.symbol}/USDT</div>
            <div className="text-[10px] text-muted-foreground">{coin.name}</div>
          </div>
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded ${up ? "text-[#00c853] bg-[#00c853]/10" : "text-[#ff3b30] bg-[#ff3b30]/10"}`}
        >
          {up ? "+" : ""}{change.toFixed(2)}%
        </span>
      </div>
      <div className="text-lg font-bold text-white">{formatPrice(coin.basePrice)}</div>
      <div className="h-12 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={spark}>
            <defs>
              <linearGradient id={`spark-${coin.symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={up ? "#00c853" : "#ff3b30"} stopOpacity={0.5} />
                <stop offset="100%" stopColor={up ? "#00c853" : "#ff3b30"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis domain={["dataMin", "dataMax"]} hide />
            <Area
              type="monotone"
              dataKey="v"
              stroke={up ? "#00c853" : "#ff3b30"}
              strokeWidth={1.5}
              fill={`url(#spark-${coin.symbol})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={onTrade}
        className="w-full mt-2 border-white/10 hover:border-[#2196f3]/40 hover:bg-[#2196f3]/10 hover:text-white"
      >
        Trade {coin.symbol} <ArrowRight className="ml-1 h-3 w-3" />
      </Button>
    </motion.div>
  );
}

function LiveMarkets() {
  const { navigate } = useAuth();
  const top = COINS.slice(0, 8);
  return (
    <section className="py-16 md:py-24 bg-[#02060f]/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Live <span className="bx-text-gradient">markets</span>
            </h2>
            <p className="mt-2 text-muted-foreground">Real-time prices across 12 assets. Tap any coin to trade.</p>
          </div>
          <Button variant="outline" onClick={() => navigate("markets")} className="border-white/10 hover:bg-white/5">
            View all markets <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {top.map((c) => (
            <MarketCard key={c.symbol} coin={c} onTrade={() => navigate("trade")} />
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { n: "01", title: "Register", body: "Sign up with an invitation code from your broker. Takes under 60 seconds.", icon: BadgeCheck },
  { n: "02", title: "Deposit", body: "Fund your wallet with card, bank transfer, or crypto. Instant credit.", icon: Wallet },
  { n: "03", title: "Trade & Win", body: "Pick an asset, choose UP or DOWN, set duration. Win up to 50% in 120s.", icon: Trophy },
];

function HowItWorks() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold">
            Trade in <span className="bx-text-gradient">three steps</span>
          </h2>
          <p className="mt-3 text-muted-foreground">From signup to your first win in minutes. No experience required.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bx-glass rounded-2xl p-6 relative overflow-hidden"
            >
              <div className="absolute -top-6 -right-6 text-8xl font-black text-[#2196f3]/10 select-none">{s.n}</div>
              <div className="relative">
                <div className="h-12 w-12 rounded-xl bx-blue-gradient flex items-center justify-center mb-4 bx-glow">
                  <s.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const RETURNS = [
  { dur: "30s", pct: "20%", color: "#2196f3", desc: "Quick-fire trades for fast movers" },
  { dur: "60s", pct: "30%", color: "#42a5f5", desc: "The sweet spot for most strategies" },
  { dur: "120s", pct: "50%", color: "#0d47a1", desc: "Max payouts for the patient trader" },
];

function ReturnsShowcase() {
  return (
    <section className="py-16 md:py-24 bg-[#02060f]/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2196f3]/30 bg-[#2196f3]/10 px-4 py-1 text-xs text-[#42a5f5] mb-4">
            <Trophy className="h-3.5 w-3.5" /> Industry-leading payouts
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">
            Pick your <span className="bx-text-gradient">duration</span>, win bigger
          </h2>
          <p className="mt-3 text-muted-foreground">Longer holds, higher payouts. Up to 50% returns in 120 seconds.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {RETURNS.map((r, i) => (
            <motion.div
              key={r.dur}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bx-glass rounded-2xl p-8 text-center relative overflow-hidden bx-glow"
              style={{ borderColor: `${r.color}40` }}
            >
              <div
                className="absolute inset-x-0 top-0 h-1"
                style={{ background: `linear-gradient(90deg, ${r.color}, transparent)` }}
              />
              <div className="text-5xl font-extrabold" style={{ color: r.color }}>{r.dur}</div>
              <div className="mt-3 text-4xl font-black bx-text-gradient">{r.pct}</div>
              <div className="text-xs text-muted-foreground mt-1">returns on win</div>
              <p className="mt-4 text-sm text-muted-foreground">{r.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBanner() {
  const { navigate, user } = useAuth();
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bx-blue-gradient p-10 md:p-16 text-center bx-glow-strong"
        >
          <div className="absolute inset-0 bx-grid-bg opacity-20" />
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white">
              Ready to make your <span className="text-white/90">first trade?</span>
            </h2>
            <p className="mt-4 text-white/80 max-w-xl mx-auto">
              Join 50,000+ traders. Get $10,000 demo balance on signup. No credit card required.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                onClick={() => navigate(user ? "trade" : "register")}
                className="bg-white text-[#0d47a1] hover:bg-white/90 h-12 px-8 text-base font-semibold"
              >
                {user ? "Open Trade Desk" : "Create Free Account"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("login")}
                className="border-white/40 text-white hover:bg-white/10 h-12 px-8 text-base"
              >
                Login
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const STATS = [
  { v: "50K+", l: "Active traders" },
  { v: "$2.4B+", l: "Volume traded" },
  { v: "12", l: "Listed assets" },
  { v: "99.9%", l: "Uptime SLA" },
];

function StatsStrip() {
  return (
    <section className="border-t border-white/5 bg-[#02060f]/80 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.l} className="text-center">
              <div className="text-3xl md:text-4xl font-bold bx-text-gradient">{s.v}</div>
              <div className="text-xs md:text-sm text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PatternLockTeaser() {
  const { navigate } = useAuth();
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2196f3]/30 bg-[#2196f3]/10 px-4 py-1 text-xs text-[#42a5f5] mb-4">
              <Lock className="h-3.5 w-3.5" /> Pro patterns
            </div>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              Bollinger Bands, MAs & <span className="bx-text-gradient">support levels</span> — built in
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Registered traders unlock the full charting suite: Bollinger Bands with ±2σ, fast & slow moving
              averages, and automatic support/resistance levels. Make informed calls, not guesses.
            </p>
            <ul className="mt-6 space-y-2 text-sm">
              {["Real-time Bollinger Bands (20-period, ±2σ)", "Fast & slow moving averages", "Auto support/resistance lines", "Locked for guests — register to reveal"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-[#00c853]" /> {t}
                </li>
              ))}
            </ul>
            <Button
              onClick={() => navigate("register")}
              className="mt-6 bx-blue-gradient bx-glow text-white border-0"
            >
              Unlock the patterns <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bx-glass rounded-2xl p-6 relative overflow-hidden h-80"
          >
            <div className="absolute inset-0 backdrop-blur-md bg-[#02060f]/40" />
            <div className="relative h-full flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-full bx-blue-gradient bx-glow flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Trading Pattern Locked</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                Register to reveal Bollinger Bands, Moving Averages, and Support/Resistance levels.
              </p>
              <Button
                onClick={() => navigate("register")}
                className="mt-4 bx-blue-gradient bx-glow text-white border-0"
              >
                Register Now
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function HomeView() {
  return (
    <main className="flex-1 bx-fade-in">
      <Hero />
      <TickerTape />
      <FeaturesGrid />
      <LiveMarkets />
      <HowItWorks />
      <ReturnsShowcase />
      <PatternLockTeaser />
      <CtaBanner />
      <StatsStrip />
    </main>
  );
}

export default HomeView;
