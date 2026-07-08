"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, LayoutDashboard, CandlestickChart, Wallet, BarChart3, User,
  ArrowDownLeft, ArrowUpRight, ArrowLeftRight, History, Bell,
  Menu, X, LogOut, Search, ChevronDown,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Brand } from "@/components/brand";
import { TickerTape } from "@/components/ticker-tape";
import { Button } from "@/components/ui/button";
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
  | "home" | "dashboard" | "trade" | "wallet" | "analytics"
  | "recharge" | "withdraw" | "transfer" | "history" | "profile" | "notifications";

const NAV: { key: CustomerSection; label: string; icon: any; group: string }[] = [
  { key: "home", label: "Home", icon: Home, group: "Main" },
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Main" },
  { key: "trade", label: "Trade", icon: CandlestickChart, group: "Main" },
  { key: "analytics", label: "Analytics", icon: BarChart3, group: "Main" },
  { key: "wallet", label: "Wallet", icon: Wallet, group: "Funds" },
  { key: "recharge", label: "Recharge", icon: ArrowDownLeft, group: "Funds" },
  { key: "withdraw", label: "Withdraw", icon: ArrowUpRight, group: "Funds" },
  { key: "transfer", label: "Transfer", icon: ArrowLeftRight, group: "Funds" },
  { key: "history", label: "History", icon: History, group: "Funds" },
  { key: "profile", label: "Profile", icon: User, group: "Account" },
  { key: "notifications", label: "Notifications", icon: Bell, group: "Account" },
];

export function CustomerShell() {
  const { user, wallet, logout, refresh } = useAuth();
  const [section, setSection] = useState<CustomerSection>("home");
  const [mobileNav, setMobileNav] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);

  // Navigate to trade screen with a specific coin pre-selected
  const navigateToTrade = (coin: string) => {
    setSelectedCoin(coin);
    setSection("trade");
  };

  const navigate = (s: CustomerSection) => {
    if (s === "home" || s === "dashboard") {
      // "Home" and "Dashboard" both go to dashboard view (no reload)
      setSection("home");
    } else {
      setSection(s);
    }
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
                  const active = section === item.key;
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
                        const active = section === item.key;
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
              {section === "trade" && <CustomerTrade onSettled={refresh} initialCoin={selectedCoin} />}
              {section === "wallet" && <CustomerWallet />}
              {section === "analytics" && <CustomerAnalytics />}
              {section === "recharge" && <CustomerWallet mode="recharge" />}
              {section === "withdraw" && <CustomerWallet mode="withdraw" />}
              {section === "transfer" && <CustomerWallet mode="transfer" />}
              {section === "history" && <CustomerTransactions />}
              {section === "profile" && <CustomerProfile />}
              {section === "notifications" && <CustomerNotifications />}
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
