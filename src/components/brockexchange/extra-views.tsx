"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  Star,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Wallet,
  Snowflake,
  PieChart,
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
  XCircle,
  Clock,
  Bell,
  Info,
  AlertTriangle,
  User as UserIcon,
  Shield,
  Copy,
  Crown,
  Smartphone,
  Mail,
  Phone,
  Globe,
  Save,
  Lock,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { COINS, formatPrice, genSparkline } from "@/lib/market-data";
import { toast } from "sonner";

const WATCH_KEY = "brock-exchange-watchlist";

function getWatchlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(WATCH_KEY) || "[]");
  } catch {
    return [];
  }
}
function toggleWatch(symbol: string) {
  const list = getWatchlist();
  const next = list.includes(symbol) ? list.filter((s) => s !== symbol) : [...list, symbol];
  localStorage.setItem(WATCH_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("watchlist-change"));
}

// ─── Shared star toggle button ────────────────────────────────
function StarButton({ symbol, size = 16 }: { symbol: string; size?: number }) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const sync = () => setActive(getWatchlist().includes(symbol));
    sync();
    window.addEventListener("watchlist-change", sync);
    return () => window.removeEventListener("watchlist-change", sync);
  }, [symbol]);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleWatch(symbol);
        toast.success(active ? "Removed from watchlist" : "Added to watchlist");
      }}
      className="p-1 hover:bg-white/5 rounded"
      aria-label="Toggle watchlist"
    >
      <Star
        style={{ width: size, height: size }}
        className={active ? "fill-[#f59e0b] text-[#f59e0b]" : "text-muted-foreground"}
      />
    </button>
  );
}

// Coin cards with sparklines for markets view
function useCoinCards() {
  return useMemo(() => {
    return COINS.map((coin) => {
      const data = genSparkline(coin.basePrice, 24).map((v, i) => ({ i, v }));
      const change = ((data[data.length - 1].v - data[0].v) / data[0].v) * 100;
      return { coin, data, change };
    });
  }, []);
}

// ─── MarketsView ──────────────────────────────────────────────
export function MarketsView() {
  const { navigate } = useAuth();
  const all = useCoinCards();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("popular");

  const filtered = all
    .filter(({ coin }) => coin.name.toLowerCase().includes(query.toLowerCase()) || coin.symbol.toLowerCase().includes(query.toLowerCase()))
    .filter(({ coin }) => {
      if (category === "all") return true;
      if (category === "gainers") return true;
      if (category === "watch") return getWatchlist().includes(coin.symbol);
      return true;
    })
    .sort((a, b) => {
      if (sort === "price") return b.coin.basePrice - a.coin.basePrice;
      if (sort === "change") return b.change - a.change;
      if (sort === "name") return a.coin.name.localeCompare(b.coin.name);
      return 0;
    });

  return (
    <main className="flex-1 pt-16 bx-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            <span className="bx-text-gradient">Markets</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Browse and trade 12+ top crypto assets.</p>
        </div>

        <div className="bx-glass rounded-xl p-3 mb-5 flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search coin..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 bg-white/5 border-white/10"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-white/5 border-white/10 w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0a1322] border-white/10">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="gainers">Gainers</SelectItem>
              <SelectItem value="watch">My Watchlist</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="bg-white/5 border-white/10 w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0a1322] border-white/10">
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="change">Change</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(({ coin, data, change }, i) => (
            <motion.div
              key={coin.symbol}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bx-glass rounded-xl p-4 hover:bx-glow transition-all"
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
                    <div className="text-sm font-semibold">{coin.symbol}</div>
                    <div className="text-[10px] text-muted-foreground">{coin.name}</div>
                  </div>
                </div>
                <StarButton symbol={coin.symbol} />
              </div>
              <div className="h-12 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id={`mg-${coin.symbol}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={change >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0.5} />
                        <stop offset="100%" stopColor={change >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <YAxis domain={["dataMin", "dataMax"]} hide />
                    <Area type="monotone" dataKey="v" stroke={change >= 0 ? "#10b981" : "#ef4444"} strokeWidth={1.5} fill={`url(#mg-${coin.symbol})`} />
                    <RechartsTooltip
                      contentStyle={{ background: "#0a1322", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }}
                      labelFormatter={() => ""}
                      formatter={(v: any) => [formatPrice(Number(v)), coin.symbol]}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div>
                  <div className="text-sm font-mono font-semibold">{formatPrice(coin.basePrice)}</div>
                  <div className={`text-[10px] font-semibold ${change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                  </div>
                </div>
                <Button size="sm" onClick={() => navigate("trade")} className="bx-blue-gradient text-white border-0 h-7 text-xs">
                  Trade
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}

// ─── WatchlistView ────────────────────────────────────────────
export function WatchlistView() {
  const { navigate } = useAuth();
  const all = useCoinCards();
  const [, setTick] = useState(0);

  useEffect(() => {
    const sync = () => setTick((t) => t + 1);
    window.addEventListener("watchlist-change", sync);
    return () => window.removeEventListener("watchlist-change", sync);
  }, []);

  const watchlist = getWatchlist();
  const items = all.filter(({ coin }) => watchlist.includes(coin.symbol));

  return (
    <main className="flex-1 pt-16 bx-fade-in">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6 flex items-center gap-2">
          <Star className="h-6 w-6 text-[#f59e0b] fill-[#f59e0b]" />
          <h1 className="text-2xl font-bold">
            <span className="bx-text-gradient">Watchlist</span>
          </h1>
        </div>
        <div className="bx-glass rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground border-b border-white/5">
              <tr>
                <th className="text-left font-medium py-3 px-4">Coin</th>
                <th className="text-right font-medium py-3 px-4">Price</th>
                <th className="text-right font-medium py-3 px-4 hidden sm:table-cell">24h Change</th>
                <th className="text-center font-medium py-3 px-4">Watch</th>
                <th className="text-right font-medium py-3 px-4">Trade</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-foreground">
                    Your watchlist is empty. Add coins from <button onClick={() => navigate("markets")} className="text-[#42a5f5] underline">Markets</button>.
                  </td>
                </tr>
              ) : (
                items.map(({ coin, change }) => (
                  <tr key={coin.symbol} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: `${coin.color}22`, color: coin.color }}>
                          {coin.icon}
                        </div>
                        <div>
                          <div className="font-semibold">{coin.symbol}</div>
                          <div className="text-[10px] text-muted-foreground">{coin.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">{formatPrice(coin.basePrice)}</td>
                    <td className={`py-3 px-4 text-right font-mono hidden sm:table-cell ${change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StarButton symbol={coin.symbol} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button size="sm" onClick={() => navigate("trade")} className="bx-blue-gradient text-white border-0 h-7 text-xs">
                        Trade
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

// ─── AssetsView ───────────────────────────────────────────────
export function AssetsView() {
  const { user } = useAuth();
  const balance = user?.balance || 0;
  const frozen = 0; // demo
  const available = balance - frozen;

  const holdings = COINS.slice(0, 6).map((coin, i) => {
    const qty = (balance / (coin.basePrice * (i + 1.2))) * 0.05;
    const value = qty * coin.basePrice;
    return { coin, qty, value, change: (Math.random() * 8 - 3) };
  });

  const cards = [
    { icon: Wallet, label: "Total Assets", value: `$${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: "from-[#2196f3] to-[#0D47A1]" },
    { icon: ArrowUpRight, label: "Available", value: `$${available.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: "from-[#10b981] to-[#047857]" },
    { icon: Snowflake, label: "Frozen", value: `$${frozen.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: "from-[#f59e0b] to-[#b45309]" },
    { icon: PieChart, label: "Coin Holdings", value: String(holdings.length), color: "from-[#42a5f5] to-[#1565C0]" },
  ];

  return (
    <main className="flex-1 pt-16 bx-fade-in">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-2xl font-bold mb-6">
          <span className="bx-text-gradient">Assets</span>
        </h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {cards.map((c) => (
            <Card key={c.label} className="bx-glass p-4 relative overflow-hidden border-white/5">
              <div className={`absolute -top-6 -right-6 h-20 w-20 rounded-full bg-gradient-to-br ${c.color} opacity-20 blur-2xl`} />
              <div className="relative">
                <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center mb-2`}>
                  <c.icon className="h-4 w-4 text-white" />
                </div>
                <div className="text-xl font-bold">{c.value}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{c.label}</div>
              </div>
            </Card>
          ))}
        </div>
        <div className="bx-glass rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <h2 className="text-sm font-semibold">Coin Holdings</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground border-b border-white/5">
              <tr>
                <th className="text-left font-medium py-2 px-4">Coin</th>
                <th className="text-right font-medium py-2 px-4">Qty</th>
                <th className="text-right font-medium py-2 px-4">Value (USD)</th>
                <th className="text-right font-medium py-2 px-4 hidden sm:table-cell">24h</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map(({ coin, qty, value, change }) => (
                <tr key={coin.symbol} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${coin.color}22`, color: coin.color }}>
                        {coin.icon}
                      </div>
                      <div className="font-semibold">{coin.symbol}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-xs">{qty.toFixed(6)}</td>
                  <td className="py-3 px-4 text-right font-mono">${value.toFixed(2)}</td>
                  <td className={`py-3 px-4 text-right font-mono hidden sm:table-cell ${change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

// ─── DepositView ──────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: "bank", label: "Bank Transfer", icon: "🏦" },
  { id: "card", label: "Credit/Debit Card", icon: "💳" },
  { id: "crypto", label: "Crypto Wallet", icon: "₿" },
  { id: "usdt", label: "USDT (TRC20)", icon: "₮" },
  { id: "paypal", label: "PayPal", icon: "🅿" },
  { id: "skrill", label: "Skrill", icon: "🅢" },
];

export function DepositView() {
  const { apiFetch, setUser, user } = useAuth();
  const [method, setMethod] = useState("bank");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(amount);
    if (!n || n <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/api/wallet/deposit", {
        method: "POST",
        body: JSON.stringify({ amount: n, method }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Deposit request of $${n} submitted.`);
        setAmount("");
      } else {
        toast.error(data.error || "Failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 pt-16 bx-fade-in">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-2 mb-6">
          <ArrowDownToLine className="h-6 w-6 text-emerald-400" />
          <h1 className="text-2xl font-bold">
            <span className="bx-text-gradient">Deposit</span>
          </h1>
        </div>
        <form onSubmit={submit} className="bx-glass rounded-xl p-5 sm:p-6 space-y-5">
          <div>
            <Label className="text-xs">Payment Method</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    method === m.id
                      ? "border-[#2196f3] bg-[#2196f3]/15"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="text-xl">{m.icon}</div>
                  <div className="text-xs font-medium mt-1">{m.label}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="damount" className="text-xs">Amount (USD)</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="damount"
                type="number"
                min={10}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7 bg-white/5 border-white/10"
                placeholder="100.00"
              />
            </div>
            <div className="flex gap-1.5 mt-2">
              {[100, 500, 1000, 5000].map((v) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => setAmount(String(v))}
                  className="flex-1 py-1 text-xs rounded bg-white/5 hover:bg-white/10 text-muted-foreground"
                >
                  ${v}
                </button>
              ))}
            </div>
          </div>
          {user && (
            <div className="bx-glass-soft rounded-lg p-3 text-xs flex items-center justify-between">
              <span className="text-muted-foreground">Current Balance</span>
              <span className="font-mono text-[#42a5f5]">
                ${user.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bx-blue-gradient bx-glow text-white border-0 h-11"
          >
            {loading ? "Submitting..." : "Submit Deposit Request"}
          </Button>
          <p className="text-[10px] text-muted-foreground text-center">
            Deposits are typically credited within 1–10 minutes after confirmation.
          </p>
        </form>
      </div>
    </main>
  );
}

// ─── WithdrawView ─────────────────────────────────────────────
export function WithdrawView() {
  const { apiFetch, user } = useAuth();
  const [method, setMethod] = useState("bank");
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(amount);
    if (!n || n <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    if (!destination) {
      toast.error("Enter destination account/address.");
      return;
    }
    if (user && n > user.balance) {
      toast.error("Insufficient balance.");
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/api/wallet/withdraw", {
        method: "POST",
        body: JSON.stringify({ amount: n, method, destination }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Withdrawal request of $${n} submitted.`);
        setAmount("");
        setDestination("");
      } else {
        toast.error(data.error || "Failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 pt-16 bx-fade-in">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-2 mb-6">
          <ArrowUpFromLine className="h-6 w-6 text-red-400" />
          <h1 className="text-2xl font-bold">
            <span className="bx-text-gradient">Withdraw</span>
          </h1>
        </div>
        <form onSubmit={submit} className="bx-glass rounded-xl p-5 sm:p-6 space-y-5">
          <div>
            <Label className="text-xs">Withdrawal Method</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    method === m.id
                      ? "border-[#2196f3] bg-[#2196f3]/15"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="text-xl">{m.icon}</div>
                  <div className="text-xs font-medium mt-1">{m.label}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="wdest" className="text-xs">Destination Account / Address</Label>
            <Input
              id="wdest"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="bg-white/5 border-white/10 mt-1"
              placeholder="Account number or wallet address"
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="wamount" className="text-xs">Amount (USD)</Label>
              {user && (
                <button
                  type="button"
                  onClick={() => setAmount(String(user.balance))}
                  className="text-[10px] text-[#42a5f5]"
                >
                  Available: ${user.balance.toFixed(2)} · MAX
                </button>
              )}
            </div>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="wamount"
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7 bg-white/5 border-white/10"
                placeholder="100.00"
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bx-blue-gradient bx-glow text-white border-0 h-11"
          >
            {loading ? "Submitting..." : "Submit Withdrawal Request"}
          </Button>
          <p className="text-[10px] text-muted-foreground text-center">
            Funds will be locked immediately and processed within 1–24 hours.
          </p>
        </form>
      </div>
    </main>
  );
}

// ─── HistoryView ──────────────────────────────────────────────
interface Trade {
  id: string;
  tradeId: string;
  symbol: string;
  direction: string;
  amount: number;
  duration: number;
  entryPrice: number;
  exitPrice: number | null;
  status: string;
  result: string;
  profit: number;
  createdAt: string;
}

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export function HistoryView() {
  const { apiFetch } = useAuth();
  const [tab, setTab] = useState("trades");
  const [trades, setTrades] = useState<Trade[]>([]);
  const [txns, setTxns] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tRes, nRes] = await Promise.all([
        apiFetch("/api/trade/history"),
        apiFetch("/api/notifications"),
      ]);
      const tData = await tRes.json();
      const nData = await nRes.json();
      if (tRes.ok) setTrades(tData.trades || []);
      if (nRes.ok) setTxns(nData.notifications || []);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
     
  }, []);

  return (
    <main className="flex-1 pt-16 bx-fade-in">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-2xl font-bold mb-6">
          <span className="bx-text-gradient">History</span>
        </h1>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-white/5">
            <TabsTrigger value="trades">Trading History</TabsTrigger>
            <TabsTrigger value="txns">Transactions</TabsTrigger>
          </TabsList>
          <TabsContent value="trades">
            <div className="bx-glass rounded-xl overflow-hidden">
              <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground border-b border-white/5 sticky top-0 bg-[#0a1322]">
                    <tr>
                      <th className="text-left font-medium py-2 px-3">Time</th>
                      <th className="text-left font-medium py-2 px-3">Pair</th>
                      <th className="text-center font-medium py-2 px-3">Dir</th>
                      <th className="text-right font-medium py-2 px-3">Amount</th>
                      <th className="text-right font-medium py-2 px-3 hidden sm:table-cell">Entry</th>
                      <th className="text-right font-medium py-2 px-3 hidden sm:table-cell">Exit</th>
                      <th className="text-center font-medium py-2 px-3">Status</th>
                      <th className="text-right font-medium py-2 px-3">P/L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
                    ) : trades.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">No trades yet.</td></tr>
                    ) : (
                      trades.map((t) => (
                        <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 text-xs">
                          <td className="py-2 px-3 text-muted-foreground">{new Date(t.createdAt).toLocaleString()}</td>
                          <td className="py-2 px-3 font-semibold">{t.symbol}</td>
                          <td className="py-2 px-3 text-center">
                            <span className={t.direction === "UP" ? "text-emerald-400" : "text-red-400"}>
                              {t.direction === "UP" ? "▲" : "▼"}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-mono">${t.amount.toFixed(2)}</td>
                          <td className="py-2 px-3 text-right font-mono hidden sm:table-cell">{formatPrice(t.entryPrice)}</td>
                          <td className="py-2 px-3 text-right font-mono hidden sm:table-cell">{t.exitPrice ? formatPrice(t.exitPrice) : "—"}</td>
                          <td className="py-2 px-3 text-center">
                            <Badge variant="outline" className={`text-[10px] ${t.status === "ACTIVE" ? "border-[#42a5f5]/40 text-[#42a5f5]" : t.result === "WIN" ? "border-emerald-400/40 text-emerald-400" : "border-red-400/40 text-red-400"}`}>
                              {t.status === "ACTIVE" ? "Active" : t.result}
                            </Badge>
                          </td>
                          <td className={`py-2 px-3 text-right font-mono ${t.profit > 0 ? "text-emerald-400" : t.profit < 0 ? "text-red-400" : ""}`}>
                            {t.status === "SETTLED" ? `${t.profit >= 0 ? "+" : ""}$${t.profit.toFixed(2)}` : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="txns">
            <div className="bx-glass rounded-xl p-4 sm:p-5">
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {loading ? (
                  <p className="text-center text-xs text-muted-foreground py-8">Loading...</p>
                ) : txns.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-8">No transactions yet.</p>
                ) : (
                  txns.map((n) => (
                    <div key={n.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                      <div className="h-8 w-8 rounded-full bg-[#2196f3]/20 flex items-center justify-center shrink-0">
                        <Info className="h-4 w-4 text-[#42a5f5]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{n.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{n.body}</div>
                        <div className="text-[10px] text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

// ─── ProfileView ──────────────────────────────────────────────
export function ProfileView() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const copyUid = async () => {
    try {
      await navigator.clipboard.writeText(user.uid);
      setCopied(true);
      toast.success("UID copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed");
    }
  };

  const details = [
    { label: "Full Name", value: user.name, icon: UserIcon },
    { label: "Email", value: user.email, icon: Mail },
    { label: "Phone", value: user.phone || "—", icon: Phone },
    { label: "Country", value: user.country || "—", icon: Globe },
    { label: "Account Status", value: user.status, icon: Shield },
    { label: "KYC Status", value: user.kycStatus, icon: Shield },
    { label: "Registered", value: new Date(user.registeredAt as any).toLocaleDateString(), icon: Clock },
    { label: "Last Login", value: user.lastLoginAt ? new Date(user.lastLoginAt as any).toLocaleDateString() : "—", icon: Clock },
  ];

  return (
    <main className="flex-1 pt-16 bx-fade-in">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-2xl font-bold mb-6">
          <span className="bx-text-gradient">Profile</span>
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4">
          {/* Left card */}
          <div className="space-y-4">
            <div className="bx-glass rounded-xl p-5 text-center">
              <Avatar className="h-20 w-20 mx-auto mb-3 border-2 border-[#2196f3]/40">
                <AvatarFallback className="bg-[#2196f3]/20 text-[#42a5f5] text-xl font-bold">
                  {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-lg font-bold">{user.name}</h2>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
                <Badge variant="outline" className="border-[#42a5f5]/40 text-[#42a5f5]">
                  {user.role}
                </Badge>
                <Badge variant="outline" className="border-[#f59e0b]/40 text-[#f59e0b]">
                  <Crown className="h-3 w-3 mr-1" /> VIP {user.vipLevel}
                </Badge>
              </div>
            </div>
            <div className="bx-glass rounded-xl p-5">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">UID</div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-white">{user.uid}</span>
                <Button size="sm" variant="ghost" onClick={copyUid} className="h-7">
                  {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Invitation Code</div>
                <div className="font-mono text-sm text-[#42a5f5]">{user.invitationCode || "—"}</div>
              </div>
            </div>
          </div>
          {/* Right details */}
          <div className="bx-glass rounded-xl p-5 sm:p-6">
            <h3 className="text-sm font-semibold mb-4">Account Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {details.map((d) => (
                <div key={d.label} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="h-8 w-8 rounded-lg bg-[#2196f3]/15 flex items-center justify-center shrink-0">
                    <d.icon className="h-4 w-4 text-[#42a5f5]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{d.label}</div>
                    <div className="text-sm font-medium text-white truncate">{d.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Balance</div>
              <div className="text-2xl font-bold bx-text-gradient">
                ${user.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── NotificationsView ────────────────────────────────────────
export function NotificationsView() {
  const { apiFetch } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/notifications");
      const data = await res.json();
      if (res.ok) setItems(data.notifications || []);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
     
  }, []);

  const markAllRead = async () => {
    try {
      await apiFetch("/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ markAll: true }),
      });
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All marked as read");
    } catch {
      toast.error("Failed");
    }
  };

  const iconFor = (type: string) => {
    if (type === "success") return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    if (type === "warning") return <AlertTriangle className="h-4 w-4 text-[#f59e0b]" />;
    if (type === "error") return <XCircle className="h-4 w-4 text-red-400" />;
    return <Info className="h-4 w-4 text-[#42a5f5]" />;
  };

  const unread = items.filter((n) => !n.read).length;

  return (
    <main className="flex-1 pt-16 bx-fade-in">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-[#42a5f5]" />
            <h1 className="text-2xl font-bold">
              <span className="bx-text-gradient">Notifications</span>
            </h1>
            {unread > 0 && (
              <Badge className="bg-red-500/20 text-red-400 border-red-400/40 text-[10px]">
                {unread} unread
              </Badge>
            )}
          </div>
          <Button size="sm" variant="outline" onClick={markAllRead} disabled={unread === 0} className="border-white/10">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Mark all read
          </Button>
        </div>
        <div className="space-y-2">
          {loading ? (
            <div className="text-center text-xs text-muted-foreground py-12">Loading...</div>
          ) : items.length === 0 ? (
            <div className="bx-glass rounded-xl p-10 text-center">
              <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No notifications yet.</p>
            </div>
          ) : (
            items.map((n) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bx-glass rounded-xl p-4 flex items-start gap-3 ${!n.read ? "border-l-2 border-l-[#2196f3]" : ""}`}
              >
                <div className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  {iconFor(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-white">{n.title}</div>
                    {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-[#2196f3] shrink-0" />}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{n.body}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

// ─── SettingsView ─────────────────────────────────────────────
const COUNTRIES = ["United States", "United Kingdom", "United Arab Emirates", "Singapore", "Pakistan", "India"];

export function SettingsView() {
  const { user, setUser, apiFetch, logout, navigate } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [country, setCountry] = useState(user?.country || "");
  const [saving, setSaving] = useState(false);

  // Password change form
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  if (!user) return null;

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // No backend profile endpoint; reflect locally
    setUser({ ...user, name, phone, country });
    toast.success("Profile saved");
    setSaving(false);
  };

  const changePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (next !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setPwdLoading(true);
    try {
      const res = await apiFetch("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password changed.");
        setCurrent(""); setNext(""); setConfirm("");
      } else {
        toast.error(data.error || "Failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <main className="flex-1 pt-16 bx-fade-in">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <h1 className="text-2xl font-bold">
          <span className="bx-text-gradient">Settings</span>
        </h1>

        {/* Profile editor */}
        <form onSubmit={saveProfile} className="bx-glass rounded-xl p-5 sm:p-6 space-y-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-[#42a5f5]" /> Profile
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Full Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-white/5 border-white/10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email (locked)</Label>
              <Input value={user.email} disabled className="bg-white/5 border-white/10 text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" className="bg-white/5 border-white/10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="bg-white/5 border-white/10 w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a1322] border-white/10">
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={saving} className="bx-blue-gradient text-white border-0">
            <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>

        {/* Password change */}
        <form onSubmit={changePwd} className="bx-glass rounded-xl p-5 sm:p-6 space-y-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#42a5f5]" /> Change Password
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Current</Label>
              <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} className="bg-white/5 border-white/10" required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">New</Label>
              <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} className="bg-white/5 border-white/10" required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Confirm</Label>
              <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="bg-white/5 border-white/10" required />
            </div>
          </div>
          <Button type="submit" disabled={pwdLoading} className="bx-blue-gradient text-white border-0">
            <Lock className="h-4 w-4 mr-1" /> {pwdLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>

        {/* Session info */}
        <div className="bx-glass rounded-xl p-5 sm:p-6">
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <Smartphone className="h-4 w-4 text-[#42a5f5]" /> Session
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">User ID</span>
              <span className="font-mono">{user.uid}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Role</span>
              <Badge variant="outline" className="border-[#42a5f5]/40 text-[#42a5f5] text-[10px]">{user.role}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Last Login</span>
              <span>{user.lastLoginAt ? new Date(user.lastLoginAt as any).toLocaleString() : "—"}</span>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => { logout(); navigate("home"); }}
            className="mt-4 text-red-400 border-red-400/30 hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4 mr-1" /> Sign Out
          </Button>
        </div>
      </div>
    </main>
  );
}

// Re-export lucide icon for shared usage
export { TrendingUp };
