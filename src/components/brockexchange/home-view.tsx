"use client";

import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  ArrowRight,
  Zap,
  ShieldCheck,
  Headset,
  Coins,
  Percent,
  Gauge,
  LineChart,
  Smartphone,
  UserPlus,
  CreditCard,
  Trophy,
  Star,
} from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { COINS, formatPrice, genSparkline } from "@/lib/market-data";
import { toast } from "sonner";

const FEATURES = [
  { icon: Zap, title: "Instant Trading", body: "Execute orders in milliseconds with our matching engine." },
  { icon: ShieldCheck, title: "Secure Wallet", body: "Cold-storage custody with multi-signature protection." },
  { icon: Headset, title: "24/7 Support", body: "Real human brokers available around the clock." },
  { icon: Coins, title: "Multi-Coin", body: "Trade 12+ top assets including BTC, ETH, SOL, and more." },
  { icon: Percent, title: "Low Fees", body: "Industry-lowest spreads. No hidden charges. Ever." },
  { icon: Gauge, title: "Fast Settlement", body: "Payouts processed within seconds of trade expiry." },
  { icon: LineChart, title: "Pro Charts", body: "Bollinger Bands, MA, support/resistance — all built-in." },
  { icon: Smartphone, title: "Mobile Ready", body: "Trade seamlessly across desktop, tablet, and mobile." },
];

const STEPS = [
  { icon: UserPlus, title: "Register", body: "Sign up with an invitation code in under 60 seconds." },
  { icon: CreditCard, title: "Deposit", body: "Fund your account via card, bank, or crypto." },
  { icon: Trophy, title: "Trade & Win", body: "Predict the market and earn up to 50% returns." },
];

const RETURNS = [
  { dur: "30s", pct: 20, color: "from-[#2196f3] to-[#0D47A1]" },
  { dur: "60s", pct: 30, color: "from-[#42a5f5] to-[#1565C0]" },
  { dur: "120s", pct: 50, color: "from-[#64b5f6] to-[#0D47A1]" },
];

const HERO_STATS = [
  { label: "Active Traders", value: "50K+" },
  { label: "24h Volume", value: "$2.4B+" },
  { label: "Listed Coins", value: "12" },
  { label: "Uptime", value: "99.9%" },
];

const BIG_STATS = [
  { value: "$2.4B+", label: "24h Trading Volume" },
  { value: "50K+", label: "Registered Traders" },
  { value: "12M+", label: "Trades Settled" },
  { value: "99.9%", label: "Platform Uptime" },
];

// Pre-compute sparkline data once for market cards
const MARKET_CARDS = COINS.slice(0, 8).map((coin) => {
  const data = genSparkline(coin.basePrice, 24).map((v, i) => ({ i, v }));
  const change = ((data[data.length - 1].v - data[0].v) / data[0].v) * 100;
  return { coin, data, change };
});

export function HomeView() {
  const { navigate, user } = useAuth();

  const handleTrade = () => navigate(user ? "trade" : "register");

  return (
    <main className="flex-1 pt-16">
      {/* 1. Hero */}
      <section className="relative overflow-hidden bx-grid-bg border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D47A1]/20 via-transparent to-[#2196f3]/15" />
        <motion.div
          className="absolute top-20 -left-32 h-96 w-96 rounded-full bg-[#2196f3]/10 blur-3xl"
          animate={{ y: [0, 40, 0] }}
          transition={{ duration: 14, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 -right-20 h-80 w-80 rounded-full bg-[#42a5f5]/10 blur-3xl"
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300 mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 bx-pulse-dot" />
              Live Trading
            </div>
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-tight">
              The future of trading on
              <br />
              <span className="bx-text-gradient">Brock Exchange</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
              Trade binary options on 12+ top crypto assets with up to 50% returns in 120 seconds.
              Pro charting, instant payouts, 24/7 human support.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => navigate("trade")}
                className="bx-blue-gradient bx-glow text-white border-0 h-12 px-7 text-base"
              >
                Start Trading <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={() => navigate("login")}
                variant="outline"
                className="h-12 px-7 text-base border-white/10"
              >
                Login
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {HERO_STATS.map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold bx-text-gradient">{s.value}</div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Floating coin icons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:block h-96"
          >
            <motion.div
              className="absolute top-0 left-1/4 h-24 w-24 rounded-2xl bx-glass flex items-center justify-center text-4xl bx-glow"
              animate={{ y: [0, -18, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              style={{ color: COINS[0].color }}
            >
              {COINS[0].icon}
            </motion.div>
            <motion.div
              className="absolute top-1/3 right-0 h-20 w-20 rounded-2xl bx-glass flex items-center justify-center text-3xl"
              animate={{ y: [0, 22, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              style={{ color: COINS[1].color }}
            >
              {COINS[1].icon}
            </motion.div>
            <motion.div
              className="absolute bottom-8 left-0 h-16 w-16 rounded-2xl bx-glass flex items-center justify-center text-2xl"
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              style={{ color: COINS[3].color }}
            >
              {COINS[3].icon}
            </motion.div>
            <motion.div
              className="absolute bottom-1/4 right-1/4 h-14 w-14 rounded-2xl bx-glass flex items-center justify-center text-xl"
              animate={{ y: [0, 14, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              style={{ color: COINS[5].color }}
            >
              {COINS[5].icon}
            </motion.div>

            {/* Center glow */}
            <div className="absolute inset-1/4 rounded-full bg-[#2196f3]/10 blur-3xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-48 w-48 rounded-full bx-blue-gradient bx-glow flex items-center justify-center text-7xl text-white font-bold">
                ₿
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Ticker tape */}
      <section className="border-b border-white/5 bg-[#02060f] py-3 overflow-hidden">
        <div className="bx-ticker-track gap-8 whitespace-nowrap">
          {[...COINS, ...COINS].map((c, i) => (
            <span key={i} className="inline-flex items-center gap-2 text-sm">
              <span style={{ color: c.color }} className="font-bold">
                {c.icon}
              </span>
              <span className="font-semibold text-white">{c.symbol}</span>
              <span className="text-muted-foreground">{formatPrice(c.basePrice)}</span>
              <span className="text-emerald-400 text-xs">
                {(Math.random() * 4 - 1.5).toFixed(2)}%
              </span>
            </span>
          ))}
        </div>
      </section>

      {/* 3. Features grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold">
            Everything you need to <span className="bx-text-gradient">trade like a pro</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Powerful tools, robust security, and human support — all built into one platform.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bx-glass rounded-xl p-5 hover:bx-glow transition-all"
            >
              <div className="h-10 w-10 rounded-lg bx-blue-gradient flex items-center justify-center mb-3">
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-white">{f.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Live market */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 border-t border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold">
              <span className="bx-text-gradient">Live Market</span>
            </h2>
            <p className="mt-2 text-muted-foreground">Real-time prices on top crypto assets.</p>
          </div>
          <Button
            onClick={() => navigate("markets")}
            variant="outline"
            className="border-white/10 self-start sm:self-auto"
          >
            View all markets <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MARKET_CARDS.map(({ coin, data, change }, i) => (
            <motion.div
              key={coin.symbol}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="bx-glass rounded-xl p-4 hover:bx-glow transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: `${coin.color}22`, color: coin.color }}
                  >
                    {coin.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{coin.symbol}</div>
                    <div className="text-[10px] text-muted-foreground">{coin.name}</div>
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold ${change >= 0 ? "text-emerald-400" : "text-red-400"}`}
                >
                  {change >= 0 ? "+" : ""}
                  {change.toFixed(2)}%
                </span>
              </div>
              <div className="h-16 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id={`g-${coin.symbol}`} x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor={change >= 0 ? "#10b981" : "#ef4444"}
                          stopOpacity={0.6}
                        />
                        <stop
                          offset="100%"
                          stopColor={change >= 0 ? "#10b981" : "#ef4444"}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <YAxis domain={["dataMin", "dataMax"]} hide />
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke={change >= 0 ? "#10b981" : "#ef4444"}
                      strokeWidth={1.5}
                      fill={`url(#g-${coin.symbol})`}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        background: "#0a1322",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8,
                        fontSize: 11,
                      }}
                      labelFormatter={() => ""}
                      formatter={(v: any) => [formatPrice(Number(v)), coin.symbol]}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-mono font-semibold">{formatPrice(coin.basePrice)}</span>
                <Button
                  size="sm"
                  onClick={handleTrade}
                  className="bx-blue-gradient text-white border-0 h-7 text-xs"
                >
                  Trade
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 border-t border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold">
            How it <span className="bx-text-gradient">works</span>
          </h2>
          <p className="mt-3 text-muted-foreground">Three simple steps to start earning.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bx-glass rounded-xl p-6 text-center relative"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 h-7 w-7 rounded-full bx-blue-gradient bx-glow flex items-center justify-center text-xs font-bold text-white">
                {i + 1}
              </div>
              <div className="h-14 w-14 rounded-2xl bx-blue-gradient flex items-center justify-center mx-auto mt-3 mb-4">
                <s.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. Returns showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 border-t border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold">
            Up to <span className="bx-text-gradient">50% returns</span> in 120 seconds
          </h2>
          <p className="mt-3 text-muted-foreground">Choose your timeframe. Higher time = higher payout.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {RETURNS.map((r, i) => (
            <motion.div
              key={r.dur}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`bx-glass rounded-2xl p-6 text-center bx-glow relative overflow-hidden`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${r.color} opacity-10`}
              />
              <div className="relative">
                <div className="text-5xl font-extrabold bx-text-gradient">{r.pct}%</div>
                <div className="text-sm text-muted-foreground mt-1">payout in {r.dur}</div>
                <Button
                  onClick={handleTrade}
                  className="mt-5 bx-blue-gradient text-white border-0 w-full"
                >
                  Trade {r.dur}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 7. CTA banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 border-t border-white/5">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bx-blue-gradient rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden bx-glow"
        >
          <div className="absolute inset-0 bx-grid-bg opacity-30" />
          <div className="relative">
            <Star className="h-8 w-8 text-white/80 mx-auto mb-3" />
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Start Trading Today
            </h2>
            <p className="mt-3 text-white/80 max-w-xl mx-auto">
              Join 50,000+ traders earning on Brock Exchange. Get $10,000 demo balance on
              registration.
            </p>
            <Button
              onClick={() => navigate("register")}
              className="mt-6 bg-white text-[#0D47A1] hover:bg-white/90 h-12 px-8 text-base font-semibold"
            >
              Create Free Account <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* 8. Stats strip */}
      <section className="border-t border-white/5 bg-[#02060f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {BIG_STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="text-center"
            >
              <div className="text-3xl sm:text-4xl font-extrabold bx-text-gradient">{s.value}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default HomeView;
