"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, ArrowLeftRight, CandlestickChart,
  Gift, Menu, X, LogOut, ChevronDown, Loader2, Search,
  TrendingUp, DollarSign, Trophy, UserCheck, Copy, Check,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fmtUsd, fmtNum } from "@/lib/format";
import { toast } from "sonner";

export type AgentSection = "dashboard" | "customers" | "trades" | "payments" | "referral";

const NAV: { key: AgentSection; label: string; icon: any }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "customers", label: "My Customers", icon: Users },
  { key: "trades", label: "Customer Trades", icon: CandlestickChart },
  { key: "payments", label: "Payments", icon: ArrowLeftRight },
  { key: "referral", label: "Referral Code", icon: Gift },
];

export function AgentShell() {
  const { user, logout } = useAuth();
  const [section, setSection] = useState<AgentSection>("dashboard");
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar sticky top-0 h-screen z-20">
        <div className="flex h-16 items-center border-b border-sidebar-border px-5 header-backdrop">
          <Brand />
        </div>
        <div className="px-3 pt-3">
          <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-2 text-center">
            <p className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider">Sub-Agent Console</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = section === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setSection(item.key)}
                className={`group relative w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                  active ? "nav-active-gold font-semibold" : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-amber-500" : ""}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {active && (
                  <motion.div layoutId="agent-nav" className="absolute left-0 h-6 w-1 rounded-r-full bg-amber-500" />
                )}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <div className="rounded-xl border border-purple-500/20 p-3 bg-gradient-to-br from-purple-500/15 to-purple-500/5">
            <p className="text-xs font-semibold text-purple-400">Your Invitation Code</p>
            <p className="text-lg font-bold font-mono mt-0.5">{user?.referralCode}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Customers use this to register</p>
          </div>
        </div>
      </aside>

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
              <nav className="flex-1 px-3 py-4 space-y-1">
                {NAV.map((item) => {
                  const Icon = item.icon;
                  const active = section === item.key;
                  return (
                    <button key={item.key}
                      onClick={() => { setSection(item.key); setMobileNav(false); }}
                      className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                        active ? "nav-active-gold font-semibold" : "text-muted-foreground hover:bg-sidebar-accent"
                      }`}>
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="header-backdrop sticky top-0 z-30 flex h-16 items-center gap-3 px-4 lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9" onClick={() => setMobileNav(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden md:block">
            <h1 className="text-lg font-bold capitalize">{section === "dashboard" ? "Agent Dashboard" : section}</h1>
            <p className="text-xs text-muted-foreground">BlockExchange.buzz · Sub-Agent Console</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="text-[10px] text-muted-foreground">Agent</p>
              <p className="text-xs font-semibold text-purple-400">{user?.name} · {user?.referralCode}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-sidebar-accent">
                  <Avatar className="h-8 w-8 border border-sidebar-border">
                    <AvatarFallback className="bg-purple-500/15 text-purple-400 text-xs font-semibold">
                      {user?.name?.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-popover border-sidebar-border">
                <p className="px-2 text-sm font-medium">{user?.name}</p>
                <p className="px-2 text-[10px] text-muted-foreground">{user?.email}</p>
                <DropdownMenuSeparator className="bg-sidebar-border" />
                <DropdownMenuItem className="text-red-400" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {section === "dashboard" && <AgentDashboard />}
              {section === "customers" && <AgentCustomers />}
              {section === "trades" && <AgentTrades />}
              {section === "payments" && <AgentPayments />}
              {section === "referral" && <AgentReferral />}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="mt-auto border-t border-sidebar-border px-4 lg:px-6 py-4">
          <div className="flex justify-between text-xs text-muted-foreground">
            <p>© 2026 BlockExchange.buzz · Sub-Agent Console</p>
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

function AgentDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agent/stats")
      .then(r => r.json())
      .then(d => { setStats(d.stats); setLoading(false); });
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!stats) return null;

  const cards = [
    { label: "Total Customers", value: fmtNum(stats.totalCustomers, 0), icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Active Customers", value: fmtNum(stats.activeCustomers, 0), icon: UserCheck, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Customer Balance", value: fmtUsd(stats.customerBalance, { compact: true }), icon: DollarSign, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Total Deposits", value: fmtUsd(stats.totalDeposits, { compact: true }), icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Total Withdrawals", value: fmtUsd(stats.totalWithdrawals, { compact: true }), icon: DollarSign, color: "text-red-400", bg: "bg-red-500/10" },
    { label: "Total Trades", value: fmtNum(stats.totalTrades, 0), icon: CandlestickChart, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Winning Trades", value: fmtNum(stats.winningTrades, 0), icon: Trophy, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Commission Rate", value: `${stats.commissionRate}%`, icon: Gift, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Commission Earned", value: fmtUsd(stats.totalCommission), icon: DollarSign, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Pending Deposits", value: fmtNum(stats.pendingDeposits, 0), icon: ArrowLeftRight, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className="card-gradient p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{s.label}</p>
                  <p className={`mt-1 text-lg font-bold ${s.color}`}>{s.value}</p>
                </div>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${s.bg}`}>
                  <s.icon className="h-4 w-4" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function AgentCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    fetch(`/api/agent/customers?${params}`)
      .then(r => r.json())
      .then(d => {
        if (!cancelled) {
          setCustomers(d.customers || []);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [query]);

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <Card className="card-gradient p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by UID, email, name, or mobile..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-9 bg-sidebar-accent/60"
          />
        </div>
      </Card>

      <Card className="card-gradient p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No customers yet. Share your invitation code to invite customers.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sidebar-border text-[10px] text-muted-foreground uppercase">
                  <th className="text-left font-medium pl-4 py-3">Customer</th>
                  <th className="text-left font-medium py-3 hidden md:table-cell">UID</th>
                  <th className="text-right font-medium py-3">Balance</th>
                  <th className="text-center font-medium py-3">Status</th>
                  <th className="text-right font-medium pr-4 py-3 hidden lg:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-sidebar-border/40 hover:bg-sidebar-accent/20">
                    <td className="pl-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-500/30 to-blue-500/30 text-xs font-bold shrink-0">
                          {c.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{c.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 hidden md:table-cell font-mono text-xs text-amber-500">{c.uid}</td>
                    <td className="text-right py-3 font-mono text-sm font-medium">
                      {c.wallet ? fmtUsd(c.wallet.available + c.wallet.frozen) : "—"}
                    </td>
                    <td className="text-center py-3">
                      <Badge variant="secondary" className={`text-[9px] capitalize ${c.status === "ACTIVE" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                        {c.status.toLowerCase()}
                      </Badge>
                    </td>
                    <td className="text-right pr-4 py-3 hidden lg:table-cell text-[10px] text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function AgentTrades() {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/agent/trades?limit=100")
      .then(r => r.json())
      .then(d => {
        if (!cancelled) {
          setTrades(d.trades || []);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="card-gradient p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : trades.length === 0 ? (
          <p className="text-center py-12 text-sm text-muted-foreground">No trades from your customers yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sidebar-border text-[10px] text-muted-foreground uppercase">
                  <th className="text-left font-medium pl-4 py-3">Trade ID</th>
                  <th className="text-left font-medium py-3">Customer</th>
                  <th className="text-left font-medium py-3">Coin</th>
                  <th className="text-left font-medium py-3">Dir</th>
                  <th className="text-right font-medium py-3">Amount</th>
                  <th className="text-right font-medium py-3">P&L</th>
                  <th className="text-center font-medium py-3">Result</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => (
                  <tr key={t.id} className="border-b border-sidebar-border/40 hover:bg-sidebar-accent/20">
                    <td className="pl-4 py-3 font-mono text-[10px]">{t.tradeId}</td>
                    <td className="py-3">
                      <p className="text-xs font-medium">{t.user?.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{t.user?.uid}</p>
                    </td>
                    <td className="py-3 font-medium">{t.coin}</td>
                    <td className="py-3">
                      <span className={t.direction === "UP" ? "text-emerald-400" : "text-red-400"}>
                        {t.direction === "UP" ? "↑ Up" : "↓ Down"}
                      </span>
                    </td>
                    <td className="text-right py-3 font-mono">{fmtUsd(t.amount)}</td>
                    <td className="text-right py-3 font-mono">
                      <span className={t.profit >= 0 ? "text-emerald-400" : "text-red-400"}>
                        {t.profit >= 0 ? "+" : ""}{fmtUsd(t.profit)}
                      </span>
                    </td>
                    <td className="text-center py-3">
                      {t.status === "ACTIVE" ? (
                        <Badge variant="secondary" className="bg-amber-500/15 text-amber-400 text-[9px]">Active</Badge>
                      ) : t.result === "WIN" ? (
                        <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-400 text-[9px]">Win</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-500/15 text-red-400 text-[9px]">Loss</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function AgentPayments() {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/agent/payments?status=ALL")
      .then(r => r.json())
      .then(d => {
        if (!cancelled) {
          setTxs(d.transactions || []);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="card-gradient p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : txs.length === 0 ? (
          <p className="text-center py-12 text-sm text-muted-foreground">No payment requests from your customers yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sidebar-border text-[10px] text-muted-foreground uppercase">
                  <th className="text-left font-medium pl-4 py-3">Transaction</th>
                  <th className="text-left font-medium py-3">Customer</th>
                  <th className="text-left font-medium py-3">Type</th>
                  <th className="text-right font-medium py-3">Amount</th>
                  <th className="text-center font-medium py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((tx) => (
                  <tr key={tx.id} className="border-b border-sidebar-border/40 hover:bg-sidebar-accent/20">
                    <td className="pl-4 py-3">
                      <p className="text-xs font-mono font-medium">{tx.txId}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(tx.createdAt).toLocaleString()}</p>
                    </td>
                    <td className="py-3">
                      <p className="text-xs font-medium">{tx.user?.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{tx.user?.uid}</p>
                    </td>
                    <td className="py-3">
                      <Badge variant="secondary" className={`text-[9px] ${tx.type === "DEPOSIT" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                        {tx.type}
                      </Badge>
                    </td>
                    <td className="text-right py-3 font-mono font-bold">{fmtUsd(tx.amount)}</td>
                    <td className="text-center py-3">
                      <Badge variant="secondary" className={`text-[9px] ${tx.status === "SUCCESSFUL" ? "bg-emerald-500/15 text-emerald-400" : tx.status === "PENDING" ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400"}`}>
                        {tx.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function AgentReferral() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(user?.referralCode || "");
    setCopied(true);
    toast.success("Invitation code copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="card-gradient p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/15">
            <Gift className="h-8 w-8 text-purple-400" />
          </div>
        </div>
        <h2 className="text-xl font-bold">Your Invitation Code</h2>
        <p className="text-sm text-muted-foreground mt-2 mb-6">
          Share this code with potential customers. They'll use it during registration and be permanently linked to you.
        </p>

        <div className="bg-sidebar-accent/40 border border-purple-500/30 rounded-xl p-6 mb-6">
          <p className="text-4xl font-bold font-mono text-purple-400 tracking-wider">{user?.referralCode}</p>
        </div>

        <Button onClick={copyCode} className="btn-gold-gradient h-11 px-6">
          {copied ? <><Check className="mr-2 h-4 w-4" /> Copied!</> : <><Copy className="mr-2 h-4 w-4" /> Copy Code</>}
        </Button>

        <div className="mt-6 text-left bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
          <p className="text-xs font-semibold text-blue-400 mb-1">How it works:</p>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Share your code <span className="font-mono text-amber-400">{user?.referralCode}</span> with potential customers</li>
            <li>They register at BlockExchange.buzz using your code</li>
            <li>They're permanently linked to your agent account</li>
            <li>You earn commission on their trading activity</li>
            <li>View all your customers in the "My Customers" tab</li>
          </ol>
        </div>
      </Card>
    </div>
  );
}
