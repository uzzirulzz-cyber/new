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

export default function Home() {
  const [active, setActive] = useState<SectionKey>("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const meta = SECTION_TITLES[active];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar sticky top-0 h-screen">
        <SidebarContent active={active} setActive={setActive} />
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
                <Brand />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileNavOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <NavList
                active={active}
                setActive={(k) => {
                  setActive(k);
                  setMobileNavOpen(false);
                }}
              />
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

          <div className="ml-auto flex items-center gap-2 lg:gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users, txs, pairs…"
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
                      BA
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start leading-tight">
                    <span className="text-xs font-medium">Brock Admin</span>
                    <span className="text-[10px] text-muted-foreground">Super Admin</span>
                  </div>
                  <ChevronDown className="hidden md:block h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
                <DropdownMenuItem className="text-red-400 focus:text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Mobile section title */}
        <div className="md:hidden px-4 pt-4">
          <h1 className="text-xl font-semibold">{meta.title}</h1>
          <p className="text-sm text-muted-foreground">{meta.subtitle}</p>
        </div>

        {/* Section content */}
        <main className="flex-1 p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {active === "overview" && <OverviewSection onNavigate={setActive} />}
              {active === "markets" && <MarketsSection />}
              {active === "users" && <UsersSection />}
              {active === "transactions" && <TransactionsSection />}
              {active === "wallets" && <WalletsSection />}
              {active === "settings" && <SettingsSection />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-border bg-background/60 px-4 lg:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>© 2026 Brock Exchange. Admin dashboard v2.4.1.</p>
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
  active,
  setActive,
}: {
  active: SectionKey;
  setActive: (k: SectionKey) => void;
}) {
  return (
    <>
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <Brand />
      </div>
      <NavList active={active} setActive={setActive} />
      <div className="mt-auto p-4 border-t border-border">
        <div className="rounded-xl bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border border-emerald-500/20 p-4">
          <p className="text-xs font-semibold text-emerald-400">System Status</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Trading engine, settlement, and custody are all online. Last incident 6 days ago.
          </p>
        </div>
      </div>
    </>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-emerald-950 font-bold text-lg shadow-lg shadow-emerald-500/20">
        B
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-semibold">Brock Exchange</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          Admin Console
        </span>
      </div>
    </div>
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
        Menu
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
                ? "bg-emerald-500/15 text-emerald-400 font-medium"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }`}
          >
            <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : ""}`} />
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <Badge
                variant="secondary"
                className={`h-5 px-1.5 text-[10px] ${
                  isActive
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {item.badge}
              </Badge>
            )}
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
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
