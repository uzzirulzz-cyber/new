"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CandlestickChart,
  Users,
  ArrowLeftRight,
  Wallet,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  ShieldCheck,
  Zap,
  Store,
  LineChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OverviewSection } from "@/components/dashboard/overview-section";
import { MarketsSection } from "@/components/dashboard/markets-section";
import { UsersSection } from "@/components/dashboard/users-section";
import { TransactionsSection } from "@/components/dashboard/transactions-section";
import { WalletsSection } from "@/components/dashboard/wallets-section";
import { SettingsSection } from "@/components/dashboard/settings-section";
import { TradingSection } from "@/components/trading/trading-section";

type Mode = "trading" | "admin";

type SectionKey =
  | "overview"
  | "markets"
  | "users"
  | "transactions"
  | "wallets"
  | "settings";

interface NavItem {
  key: SectionKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "markets", label: "Markets", icon: CandlestickChart, badge: "12" },
  { key: "users", label: "Users", icon: Users },
  { key: "transactions", label: "Transactions", icon: ArrowLeftRight, badge: "3" },
  { key: "wallets", label: "Wallets", icon: Wallet },
  { key: "settings", label: "Settings", icon: Settings },
];

const SECTION_TITLES: Record<SectionKey, { title: string; subtitle: string }> = {
  overview: { title: "Overview", subtitle: "Real-time snapshot of exchange performance" },
  markets: { title: "Markets", subtitle: "Trading pairs, prices, and liquidity" },
  users: { title: "Users", subtitle: "Accounts, KYC status, and balances" },
  transactions: { title: "Transactions", subtitle: "Trades, deposits, withdrawals & transfers" },
  wallets: { title: "Wallets", subtitle: "Hot, cold, and reserve asset balances" },
  settings: { title: "Settings", subtitle: "Exchange configuration and risk controls" },
};

const MODE_META: Record<Mode, { label: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }> = {
  trading: { label: "Trading", subtitle: "Place orders, track positions, manage your portfolio", icon: LineChart },
  admin: { label: "Admin Console", subtitle: "Exchange operations & risk controls", icon: LayoutDashboard },
};

export default function Home() {
  const [mode, setMode] = useState<Mode>("trading");
  const [active, setActive] = useState<SectionKey>("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const modeMeta = MODE_META[mode];
  const meta = mode === "admin" ? SECTION_TITLES[active] : { title: "Trading Floor", subtitle: modeMeta.subtitle };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar sticky top-0 h-screen">
        <SidebarContent
          mode={mode}
          setMode={setMode}
          active={active}
          setActive={setActive}
        />
      </aside>

      {/* Sidebar (mobile drawer) */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileNavOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 z-50 w-64 h-screen bg-sidebar border-r border-border flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <Brand mode={mode} />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileNavOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ModeSwitcher mode={mode} setMode={setMode} />
              {mode === "admin" && (
                <NavList
                  active={active}
                  setActive={(k) => {
                    setActive(k);
                    setMobileNavOpen(false);
                  }}
                />
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 backdrop-blur-xl px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden md:flex flex-col min-w-0">
            <h1 className="text-lg font-semibold leading-tight truncate">{meta.title}</h1>
            <p className="text-xs text-muted-foreground truncate">{meta.subtitle}</p>
          </div>

          {/* Desktop mode switcher (topbar) */}
          <div className="hidden lg:flex items-center gap-1 mx-auto rounded-lg bg-muted/40 p-1">
            <ModeButton
              mode="trading"
              current={mode}
              onClick={() => setMode("trading")}
              label="Trading"
              icon={LineChart}
            />
            <ModeButton
              mode="admin"
              current={mode}
              onClick={() => setMode("admin")}
              label="Admin"
              icon={LayoutDashboard}
            />
          </div>

          <div className="ml-auto flex items-center gap-2 lg:gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={mode === "trading" ? "Search pairs…" : "Search users, txs, pairs…"}
                className="pl-9 h-9 w-44 md:w-64 bg-muted/40 border-border"
              />
            </div>

            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-400 pulse-dot" />
            </Button>

            <div className="h-6 w-px bg-border hidden sm:block" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-muted/60 transition-colors">
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarFallback className="bg-emerald-500/15 text-emerald-400 text-xs font-semibold">
                      {mode === "trading" ? "AT" : "BA"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start leading-tight">
                    <span className="text-xs font-medium">
                      {mode === "trading" ? "Alex Trader" : "Brock Admin"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {mode === "trading" ? "Tier 3 · KYC Verified" : "Super Admin"}
                    </span>
                  </div>
                  <ChevronDown className="hidden md:block h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>
                  {mode === "trading" ? "Trader Account" : "Admin Account"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Security
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Zap className="mr-2 h-4 w-4" />
                  API Keys
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-emerald-400 focus:text-emerald-400"
                  onClick={() => setMode(mode === "trading" ? "admin" : "trading")}
                >
                  <Store className="mr-2 h-4 w-4" />
                  Switch to {mode === "trading" ? "Admin" : "Trading"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-400 focus:text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Mobile section title + mode switcher */}
        <div className="md:hidden px-4 pt-4 space-y-3">
          <div className="flex items-center gap-1 rounded-lg bg-muted/40 p-1">
            <ModeButton
              mode="trading"
              current={mode}
              onClick={() => setMode("trading")}
              label="Trading"
              icon={LineChart}
              full
            />
            <ModeButton
              mode="admin"
              current={mode}
              onClick={() => setMode("admin")}
              label="Admin"
              icon={LayoutDashboard}
              full
            />
          </div>
          <div>
            <h1 className="text-xl font-semibold">{meta.title}</h1>
            <p className="text-sm text-muted-foreground">{meta.subtitle}</p>
          </div>
        </div>

        {/* Section content */}
        <main className="flex-1 p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${mode}-${mode === "admin" ? active : "trading"}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {mode === "trading" && <TradingSection />}
              {mode === "admin" && active === "overview" && <OverviewSection onNavigate={setActive} />}
              {mode === "admin" && active === "markets" && <MarketsSection />}
              {mode === "admin" && active === "users" && <UsersSection />}
              {mode === "admin" && active === "transactions" && <TransactionsSection />}
              {mode === "admin" && active === "wallets" && <WalletsSection />}
              {mode === "admin" && active === "settings" && <SettingsSection />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-border bg-background/60 px-4 lg:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>
              © 2026 Brock Exchange ·{" "}
              <span className={mode === "trading" ? "text-emerald-400" : "text-sky-400"}>
                {mode === "trading" ? "Trading Floor" : "Admin Console"}
              </span>{" "}
              v2.4.1
            </p>
            <p className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 pulse-dot" />
              All systems operational · API latency 42ms
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function SidebarContent({
  mode,
  setMode,
  active,
  setActive,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
  active: SectionKey;
  setActive: (k: SectionKey) => void;
}) {
  return (
    <>
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <Brand mode={mode} />
      </div>
      <ModeSwitcher mode={mode} setMode={setMode} />
      {mode === "admin" ? (
        <NavList active={active} setActive={setActive} />
      ) : (
        <TraderNavList />
      )}
      <div className="mt-auto p-4 border-t border-border">
        {mode === "trading" ? (
          <div className="rounded-xl bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border border-emerald-500/20 p-4">
            <p className="text-xs font-semibold text-emerald-400">Trading Mode</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Live order book, candlestick charts, and one-click buy/sell. Switch to Admin in the topbar to manage the exchange.
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-gradient-to-br from-sky-500/15 to-sky-500/5 border border-sky-500/20 p-4">
            <p className="text-xs font-semibold text-sky-400">System Status</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Trading engine, settlement, and custody are all online. Last incident 6 days ago.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function Brand({ mode }: { mode: Mode }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold text-lg shadow-lg ${
          mode === "trading"
            ? "bg-emerald-500 text-emerald-950 shadow-emerald-500/20"
            : "bg-sky-500 text-sky-950 shadow-sky-500/20"
        }`}
      >
        B
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-semibold">Brock Exchange</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          {mode === "trading" ? "Trading Floor" : "Admin Console"}
        </span>
      </div>
    </div>
  );
}

function ModeSwitcher({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  return (
    <div className="px-3 pt-3">
      <div className="grid grid-cols-2 gap-1 p-1 bg-muted/40 rounded-lg">
        <ModeButton
          mode="trading"
          current={mode}
          onClick={() => setMode("trading")}
          label="Trading"
          icon={LineChart}
          full
        />
        <ModeButton
          mode="admin"
          current={mode}
          onClick={() => setMode("admin")}
          label="Admin"
          icon={LayoutDashboard}
          full
        />
      </div>
    </div>
  );
}

function ModeButton({
  mode,
  current,
  onClick,
  label,
  icon: Icon,
  full,
}: {
  mode: Mode;
  current: Mode;
  onClick: () => void;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  full?: boolean;
}) {
  const isSel = mode === current;
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${
        isSel
          ? mode === "trading"
            ? "bg-emerald-500 text-emerald-950 shadow-sm"
            : "bg-sky-500 text-sky-950 shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      } ${full ? "flex-1" : "px-3"}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function NavList({
  active,
  setActive,
}: {
  active: SectionKey;
  setActive: (k: SectionKey) => void;
}) {
  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      <p className="px-3 pb-2 text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
        Admin Menu
      </p>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.key;
        return (
          <button
            key={item.key}
            onClick={() => setActive(item.key)}
            className={`group relative w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
              isActive
                ? "bg-sky-500/15 text-sky-400 font-medium"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }`}
          >
            <Icon className={`h-4 w-4 ${isActive ? "text-sky-400" : ""}`} />
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <Badge
                variant="secondary"
                className={`h-5 px-1.5 text-[10px] ${
                  isActive
                    ? "bg-sky-500/20 text-sky-300"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {item.badge}
              </Badge>
            )}
            {isActive && (
              <motion.div
                layoutId="admin-nav-indicator"
                className="absolute left-0 h-6 w-1 rounded-r-full bg-sky-400"
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

function TraderNavList() {
  const items = [
    { label: "Trade", icon: LineChart, active: true },
    { label: "Markets", icon: CandlestickChart, active: false },
    { label: "Portfolio", icon: Wallet, active: false },
    { label: "Orders", icon: ArrowLeftRight, active: false },
  ];
  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      <p className="px-3 pb-2 text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
        Trader Menu
      </p>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.label}
            className={`group relative w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
              item.active
                ? "bg-emerald-500/15 text-emerald-400 font-medium"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.active && (
              <motion.div
                layoutId="trader-nav-indicator"
                className="absolute left-0 h-6 w-1 rounded-r-full bg-emerald-400"
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
