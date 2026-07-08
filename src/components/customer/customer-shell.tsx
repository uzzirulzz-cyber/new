"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, LayoutDashboard, CandlestickChart, Wallet, BarChart3, User,
  ArrowDownLeft, ArrowUpRight, ArrowLeftRight, History, Bell,
  Menu, X, LogOut, Search, ChevronDown, Star, Settings,
  Coins, PieChart, Snowflake, TrendingUp, TrendingDown,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useHashRoute } from "@/hooks/use-hash-route";
import { Brand } from "@/components/brand";
import { TickerTape } from "@/components/ticker-tape";
import { marketPairs } from "@/lib/dashboard-data";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fmtUsd } from "@/lib/format";
import { CustomerDashboard } from "./customer-dashboard";
import { CustomerTrade } from "./customer-trade";
import { CustomerWallet } from "./customer-wallet";
import { CustomerAnalytics } from "./customer-analytics";
import { CustomerProfile } from "./customer-profile";
import { CustomerTransactions } from "./customer-transactions";

export type CustomerSection =
  | "home" | "dashboard" | "markets" | "watchlist" | "trade" | "analytics" | "assets"
  | "wallet" | "recharge" | "withdraw" | "transfer" | "history"
  | "profile" | "notifications" | "settings";

const NAV: { key: CustomerSection; label: string; icon: any; group: string }[] = [
  { key: "home", label: "Home", icon: Home, group: "Main" },
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Main" },
  { key: "markets", label: "Markets", icon: Coins, group: "Main" },
  { key: "watchlist", label: "Watchlist", icon: Star, group: "Main" },
  { key: "trade", label: "Trade", icon: CandlestickChart, group: "Main" },
  { key: "analytics", label: "Analytics", icon: BarChart3, group: "Main" },
  { key: "assets", label: "Assets", icon: PieChart, group: "Main" },
  { key: "wallet", label: "Wallet", icon: Wallet, group: "Funds" },
  { key: "recharge", label: "Recharge", icon: ArrowDownLeft, group: "Funds" },
  { key: "withdraw", label: "Withdraw", icon: ArrowUpRight, group: "Funds" },
  { key: "transfer", label: "Transfer", icon: ArrowLeftRight, group: "Funds" },
  { key: "history", label: "History", icon: History, group: "Funds" },
  { key: "profile", label: "Profile", icon: User, group: "Account" },
  { key: "notifications", label: "Notifications", icon: Bell, group: "Account" },
  { key: "settings", label: "Settings", icon: Settings, group: "Account" },
];

export function CustomerShell() {
  const { user, wallet, logout, refresh } = useAuth();
  const { route, navigate: navigateHash } = useHashRoute("home");
  const [mobileNav, setMobileNav] = useState(false);

  // Derive section + selected coin from the URL hash
  const section = (route.section as CustomerSection) || "home";
  const selectedCoin = route.params.get("coin");

  // Navigate to a section (updates the URL hash → bookmarkable)
  const navigate = (s: CustomerSection) => {
    if (s === "home" || s === "dashboard") {
      navigateHash("home");
    } else {
      navigateHash(s);
    }
  };

  // Navigate to trade screen with a specific coin pre-selected
  const navigateToTrade = (coin: string) => {
    navigateHash("trade", { coin });
  };

  const groups = Array.from(new Set(NAV.map((n) => n.group)));

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar sticky top-0 h-screen z-20">
        <div className="flex h-16 items-center border-b border-sidebar-border px-5 header-backdrop">
          <Brand />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          {groups.map((group) => (
            <div key={group}>
              <p className="px-3 pb-2 text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold">{group}</p>
              <div className="space-y-1">
                {NAV.filter((n) => n.group === group).map((item) => {
                  const Icon = item.icon;
                  const active = (item.key === "home" || item.key === "dashboard")
                    ? (section === "home" || section === "dashboard")
                    : section === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => navigate(item.key)}
                      className={`group relative w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                        active ? "nav-active-gold font-semibold" : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${active ? "text-amber-500" : ""}`} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {active && (
                        <motion.div layoutId="customer-nav" className="absolute left-0 h-6 w-1 rounded-r-full bg-amber-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <div className="rounded-xl border border-amber-500/20 p-3 bg-gradient-to-br from-amber-500/15 to-amber-500/5">
            <p className="text-xs font-semibold text-amber-400">Available Balance</p>
            <p className="text-lg font-bold mt-0.5">{wallet ? fmtUsd(wallet.available) : "—"}</p>
            <Button
              size="sm"
              className="w-full mt-2 h-7 btn-gold-gradient text-xs"
              onClick={() => navigate("recharge")}
            >
              <ArrowDownLeft className="h-3 w-3 mr-1" /> Recharge Funds
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileNav && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/70" onClick={() => setMobileNav(false)} />
            <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              className="lg:hidden fixed left-0 top-0 z-50 w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
                <Brand />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMobileNav(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-4">
                {groups.map((group) => (
                  <div key={group}>
                    <p className="px-3 pb-2 text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold">{group}</p>
                    <div className="space-y-1">
                      {NAV.filter((n) => n.group === group).map((item) => {
                        const Icon = item.icon;
                        const active = (item.key === "home" || item.key === "dashboard")
                          ? (section === "home" || section === "dashboard")
                          : section === item.key;
                        return (
                          <button key={item.key}
                            onClick={() => { navigate(item.key); setMobileNav(false); }}
                            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                              active ? "nav-active-gold font-semibold" : "text-muted-foreground hover:bg-sidebar-accent"
                            }`}>
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="header-backdrop sticky top-0 z-30 flex h-16 items-center gap-3 px-4 lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9" onClick={() => setMobileNav(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden md:block">
            <h1 className="text-lg font-bold capitalize">{section === "home" ? "Home" : section}</h1>
            <p className="text-xs text-muted-foreground">BlockExchange.buzz · Trade Smarter. Grow Faster.</p>
          </div>
          <div className="ml-auto flex items-center gap-2 lg:gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-[10px] text-muted-foreground">UID</p>
              <p className="text-xs font-mono font-semibold text-amber-500">{user?.uid}</p>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-[10px] text-muted-foreground">Balance</p>
              <p className="text-sm font-bold">{wallet ? fmtUsd(wallet.available) : "—"}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-sidebar-accent">
                  <Avatar className="h-8 w-8 border border-sidebar-border">
                    <AvatarFallback className="bg-amber-500/15 text-amber-400 text-xs font-semibold">
                      {user?.name?.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-popover border-sidebar-border">
                <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
                <p className="px-2 text-[10px] text-muted-foreground">{user?.email}</p>
                <DropdownMenuSeparator className="bg-sidebar-border" />
                <DropdownMenuItem onClick={() => navigate("profile")}>
                  <User className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("notifications")}>
                  <Bell className="mr-2 h-4 w-4" /> Notifications
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("wallet")}>
                  <Wallet className="mr-2 h-4 w-4" /> Wallet
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-sidebar-border" />
                <DropdownMenuItem className="text-red-400" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <TickerTape />

        <main className="flex-1 p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={section + (selectedCoin || "")}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {(section === "home" || section === "dashboard") && (
                <CustomerDashboard onNavigate={navigate} onTradeCoin={navigateToTrade} />
              )}
              {section === "markets" && <CustomerMarkets onTradeCoin={navigateToTrade} />}
              {section === "watchlist" && <CustomerWatchlist onTradeCoin={navigateToTrade} />}
              {section === "trade" && <CustomerTrade onSettled={refresh} initialCoin={selectedCoin} />}
              {section === "analytics" && <CustomerAnalytics />}
              {section === "assets" && <CustomerAssets onNavigate={navigate} />}
              {section === "wallet" && <CustomerWallet />}
              {section === "recharge" && <CustomerWallet mode="recharge" />}
              {section === "withdraw" && <CustomerWallet mode="withdraw" />}
              {section === "transfer" && <CustomerWallet mode="transfer" />}
              {section === "history" && <CustomerTransactions />}
              {section === "profile" && <CustomerProfile />}
              {section === "notifications" && <CustomerNotifications />}
              {section === "settings" && <CustomerSettings />}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="mt-auto border-t border-sidebar-border px-4 lg:px-6 py-4">
          <div className="flex justify-between text-xs text-muted-foreground">
            <p>© 2026 BlockExchange.buzz · <span className="text-amber-500">Trade Smarter.</span> <span className="text-blue-400">Grow Faster.</span></p>
            <p className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 pulse-dot" />
              All systems operational
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Inline notifications view (simple)
function CustomerNotifications() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [system, setSystem] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications").then(r => r.json()).then(data => {
      setNotifs(data.notifications || []);
      setSystem(data.system || []);
      setLoading(false);
    });
  }, []);

  const markAll = async () => {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ markAll: true }) });
    setNotifs(notifs.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Notifications</h2>
        <Button variant="outline" size="sm" onClick={markAll} disabled={!notifs.some(n => !n.read)}>
          Mark all read
        </Button>
      </div>

      {system.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">System Announcements</p>
          {system.map((n) => (
            <div key={n.id} className="card-gradient rounded-xl p-4 border-l-2 border-amber-500">
              <p className="font-semibold text-sm">{n.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
              <p className="text-[10px] text-muted-foreground mt-2">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Your Notifications</p>
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
        ) : notifs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No notifications yet.</p>
        ) : (
          notifs.map((n) => (
            <div key={n.id} className={`card-gradient rounded-xl p-4 ${!n.read ? "border-l-2 border-blue-500" : "opacity-60"}`}>
              <div className="flex items-start justify-between">
                <p className="font-semibold text-sm">{n.title}</p>
                {!n.read && <span className="h-2 w-2 rounded-full bg-blue-500" />}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
              <p className="text-[10px] text-muted-foreground mt-2">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Markets — full searchable grid of all cryptocurrencies ───
function CustomerMarkets({ onTradeCoin }: { onTradeCoin: (coin: string) => void }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"volume" | "change" | "price" | "name">("volume");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const filtered = marketPairs
    .filter((m) => !search || m.pair.toLowerCase().includes(search.toLowerCase()) || m.base.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") return a.base.localeCompare(b.base);
      if (sortBy === "price") return b.lastPrice - a.lastPrice;
      if (sortBy === "change") return b.change24h - a.change24h;
      return b.volume24h - a.volume24h;
    });

  const toggleFav = (coin: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(coin)) next.delete(coin);
      else next.add(coin);
      return next;
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Markets</h2>
        <p className="text-sm text-muted-foreground">All {marketPairs.length} supported cryptocurrencies · click any coin to trade</p>
      </div>

      <Card className="card-gradient p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search coin (e.g. BTC, ETH, SOL)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-9 bg-sidebar-accent/60"
            />
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-sidebar-accent/40 p-1">
            {(["volume", "change", "price", "name"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-3 py-1 text-xs rounded-md capitalize transition-colors ${
                  sortBy === s ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s === "volume" ? "Volume" : s === "change" ? "24h %" : s === "price" ? "Price" : "Name"}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((coin) => (
          <div
            key={coin.base}
            className="card-gradient rounded-xl p-4 cursor-pointer transition-all hover:border-amber-500/40 hover:scale-[1.02]"
            onClick={() => onTradeCoin(coin.base)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span
                  className="h-10 w-10 flex items-center justify-center rounded-full text-base font-bold shrink-0"
                  style={{ background: `${coin.iconColor}25`, color: coin.iconColor }}
                >
                  {coin.icon}
                </span>
                <div>
                  <p className="text-sm font-bold">{coin.base}</p>
                  <p className="text-[10px] text-muted-foreground">{coin.pair}</p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); toggleFav(coin.base); }}
                className="text-muted-foreground/40 hover:text-amber-400"
              >
                <Star className={`h-4 w-4 ${favorites.has(coin.base) ? "fill-amber-400 text-amber-400" : ""}`} />
              </button>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-lg font-mono font-bold">{fmtUsd(coin.lastPrice)}</p>
                <p className={`text-xs font-medium ${coin.change24h >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {coin.change24h >= 0 ? "▲" : "▼"} {Math.abs(coin.change24h).toFixed(2)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground">24h Vol</p>
                <p className="text-xs font-mono">{(coin.volume24h / 1000).toFixed(1)}K</p>
              </div>
            </div>
            <Button
              size="sm"
              className={`w-full mt-3 h-8 text-xs ${
                coin.change24h >= 0 ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              Trade {coin.base}
            </Button>
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-center py-8 text-sm text-muted-foreground">No coins match your search.</p>
      )}
    </div>
  );
}

// ─── Watchlist — favorited coins ──────────────────────────────
function CustomerWatchlist({ onTradeCoin }: { onTradeCoin: (coin: string) => void }) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set(["BTC", "ETH"]));

  const watchlistCoins = marketPairs.filter((m) => favorites.has(m.base));

  const removeFav = (coin: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.delete(coin);
      return next;
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Watchlist</h2>
        <p className="text-sm text-muted-foreground">Your favorited cryptocurrencies · click to trade</p>
      </div>

      {watchlistCoins.length === 0 ? (
        <Card className="card-gradient p-12 text-center">
          <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-bold mb-2">No Favorites Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Go to Markets and tap the star icon on any coin to add it to your watchlist.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {watchlistCoins.map((coin) => (
            <div
              key={coin.base}
              className="card-gradient rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-amber-500/40 transition-all"
              onClick={() => onTradeCoin(coin.base)}
            >
              <span
                className="h-10 w-10 flex items-center justify-center rounded-full text-base font-bold shrink-0"
                style={{ background: `${coin.iconColor}25`, color: coin.iconColor }}
              >
                {coin.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold">{coin.base}</p>
                <p className="text-[10px] text-muted-foreground">{coin.pair}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono font-bold">{fmtUsd(coin.lastPrice)}</p>
                <p className={`text-xs ${coin.change24h >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeFav(coin.base); }}
                className="text-amber-400 hover:text-amber-300 p-1"
              >
                <Star className="h-4 w-4 fill-amber-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Assets — portfolio overview ──────────────────────────────
function CustomerAssets({ onNavigate }: { onNavigate: (s: CustomerSection) => void }) {
  const { wallet } = useAuth();
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trades?limit=100").then(r => r.json()).then(d => {
      setTrades(d.trades || []);
      setLoading(false);
    });
  }, []);

  const settledTrades = trades.filter(t => t.status === "SETTLED");
  const wins = settledTrades.filter(t => t.result === "WIN");
  const losses = settledTrades.filter(t => t.result === "LOSS");

  const cards = [
    { label: "Total Assets", value: wallet?.totalAssets || 0, color: "text-blue-400", icon: Wallet },
    { label: "Available Balance", value: wallet?.available || 0, color: "text-emerald-400", icon: ArrowDownLeft },
    { label: "Frozen Balance", value: wallet?.frozen || 0, color: "text-amber-400", icon: Snowflake },
    { label: "Total Profit", value: wallet?.totalProfit || 0, color: (wallet?.totalProfit || 0) >= 0 ? "text-emerald-400" : "text-red-400", icon: TrendingUp },
    { label: "Today's Profit", value: wallet?.todayProfit || 0, color: (wallet?.todayProfit || 0) >= 0 ? "text-emerald-400" : "text-red-400", icon: TrendingDown },
    { label: "Winning Trades", value: wins.length, color: "text-emerald-400", icon: BarChart3, isCount: true },
    { label: "Losing Trades", value: losses.length, color: "text-red-400", icon: BarChart3, isCount: true },
    { label: "Total Trades", value: settledTrades.length, color: "text-blue-400", icon: BarChart3, isCount: true },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Assets</h2>
        <p className="text-sm text-muted-foreground">Complete portfolio overview · synchronized with backend</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className="card-gradient p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{c.label}</p>
                  <p className={`mt-1 text-lg font-bold ${c.color}`}>
                    {c.isCount ? c.value : fmtUsd(c.value)}
                  </p>
                </div>
                <c.icon className={`h-5 w-5 ${c.color} shrink-0`} />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Button variant="outline" className="h-12" onClick={() => onNavigate("recharge")}>
          <ArrowDownLeft className="mr-2 h-4 w-4" /> Deposit
        </Button>
        <Button variant="outline" className="h-12" onClick={() => onNavigate("withdraw")}>
          <ArrowUpRight className="mr-2 h-4 w-4" /> Withdraw
        </Button>
        <Button variant="outline" className="h-12" onClick={() => onNavigate("transfer")}>
          <ArrowLeftRight className="mr-2 h-4 w-4" /> Transfer
        </Button>
        <Button variant="outline" className="h-12" onClick={() => onNavigate("history")}>
          <History className="mr-2 h-4 w-4" /> History
        </Button>
      </div>
    </div>
  );
}

// ─── Settings — user preferences & security ───────────────────
function CustomerSettings() {
  const { user, changePassword } = useAuth();
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) {
      setMsg({ type: "error", text: "New passwords do not match" });
      return;
    }
    if (newPwd.length < 6) {
      setMsg({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }
    setLoading(true);
    const result = await changePassword({ currentPassword: oldPwd, newPassword: newPwd, confirmPassword: confirmPwd });
    if (result.success) {
      setMsg({ type: "success", text: "Password changed successfully" });
      setOldPwd(""); setNewPwd(""); setConfirmPwd("");
    } else {
      setMsg({ type: "error", text: result.error || "Failed to change password" });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your account security and preferences</p>
      </div>

      <Card className="card-gradient p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Settings className="h-4 w-4 text-amber-500" /> Change Password
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Current Password</label>
            <Input
              type="password"
              value={oldPwd}
              onChange={(e) => setOldPwd(e.target.value)}
              className="mt-1 h-10 bg-sidebar-accent/60"
              required
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">New Password</label>
            <Input
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              className="mt-1 h-10 bg-sidebar-accent/60"
              required
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Confirm New Password</label>
            <Input
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              className="mt-1 h-10 bg-sidebar-accent/60"
              required
            />
          </div>
          {msg && (
            <div className={`rounded-lg px-3 py-2 text-sm ${msg.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
              {msg.text}
            </div>
          )}
          <Button type="submit" disabled={loading} className="btn-gold-gradient h-10">
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </Card>

      <Card className="card-gradient p-6">
        <h3 className="font-bold mb-4">Account Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">UID</span><span className="font-mono text-amber-500">{user?.uid}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{user?.email}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Role</span><span className="capitalize">{user?.role.toLowerCase()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">KYC Status</span><span className="capitalize">{user?.kycStatus.toLowerCase()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Invitation Code</span><span className="font-mono">{user?.invitationCode || "—"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Referral Code</span><span className="font-mono">{user?.referralCode}</span></div>
        </div>
      </Card>
    </div>
  );
}
