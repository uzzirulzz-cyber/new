"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Wallet,
  TrendingUp,
  Copy,
  Check,
  Snowflake,
  Unlock,
  Search,
  RefreshCw,
  LogOut,
  Activity,
} from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Customer {
  id: string;
  uid: string;
  email: string;
  name: string;
  status: string;
  balance: number;
  vipLevel: number;
  createdAt: string;
  lastLoginAt: string | null;
  _count?: { trades: number };
}

interface Trade {
  id: string;
  tradeId: string;
  symbol: string;
  direction: string;
  amount: number;
  duration: number;
  status: string;
  result: string;
  profit: number;
  createdAt: string;
  user: { name: string; uid: string };
}

export function SubAgentDashboard() {
  const { user, logout, navigate, apiFetch } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [custRes, trRes] = await Promise.all([
        apiFetch("/api/subagent/customers"),
        apiFetch("/api/subagent/trades"),
      ]);
      const custData = await custRes.json();
      const trData = await trRes.json();
      if (custRes.ok) setCustomers(custData.customers || []);
      if (trRes.ok) setTrades(trData.trades || []);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
     
  }, []);

  if (!user) return null;

  const activeCustomers = customers.filter((c) => c.status === "ACTIVE");
  const totalBalance = customers.reduce((s, c) => s + (c.balance || 0), 0);
  const totalTrades = customers.reduce((s, c) => s + (c._count?.trades || 0), 0);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.uid.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase())
  );

  const copyCode = async () => {
    if (!user.referralCode) return;
    try {
      await navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      toast.success("Invitation code copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed");
    }
  };

  const toggleFreeze = async (c: Customer) => {
    const action = c.status === "ACTIVE" ? "FREEZE" : "UNFREEZE";
    try {
      const res = await apiFetch("/api/subagent/customers", {
        method: "PATCH",
        body: JSON.stringify({ customerUserId: c.id, action }),
      });
      if (res.ok) {
        toast.success(`${c.name} ${action === "FREEZE" ? "frozen" : "unfrozen"}`);
        fetchData();
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const stats = [
    { icon: Users, label: "My Customers", value: customers.length, color: "from-[#2196f3] to-[#0D47A1]" },
    { icon: UserCheck, label: "Active Customers", value: activeCustomers.length, color: "from-[#10b981] to-[#047857]" },
    { icon: Wallet, label: "Customer Balance", value: `$${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: "from-[#42a5f5] to-[#1565C0]" },
    { icon: TrendingUp, label: "Customer Trades", value: totalTrades, color: "from-[#f59e0b] to-[#b45309]" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bx-glass border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={36} />
            <Badge variant="outline" className="border-[#42a5f5]/40 text-[#42a5f5] text-[10px]">
              SUB-AGENT PORTAL
            </Badge>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Welcome,</span>
            <span className="font-semibold text-white">{user.name}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-[#42a5f5] font-mono">Code: {user.referralCode}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={fetchData} className="text-muted-foreground">
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                logout();
                navigate("home");
              }}
              className="text-red-400"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
        {/* Welcome strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bx-glass rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div>
            <h1 className="text-lg font-bold">
              Welcome, {user.name}{" "}
              <span className="text-muted-foreground font-normal">·</span>{" "}
              <span className="bx-text-gradient">Invitation code {user.referralCode}</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              UID {user.uid} · VIP Level {user.vipLevel}
            </p>
          </div>
          <Button
            onClick={copyCode}
            variant="outline"
            className="border-[#2196f3]/30 bg-[#2196f3]/10 text-[#42a5f5] hover:bg-[#2196f3]/20"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {user.referralCode}
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bx-glass rounded-xl p-4 relative overflow-hidden"
            >
              <div className={`absolute -top-6 -right-6 h-20 w-20 rounded-full bg-gradient-to-br ${s.color} opacity-20 blur-2xl`} />
              <div className="relative">
                <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-2`}>
                  <s.icon className="h-4 w-4 text-white" />
                </div>
                <div className="text-xl font-bold">{s.value}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                  {s.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
          {/* Customers table */}
          <section className="bx-glass rounded-xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-[#42a5f5]" /> Customers
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search name, UID, email..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-8 h-8 bg-white/5 border-white/10 text-sm max-w-xs"
                />
              </div>
            </div>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="text-muted-foreground border-b border-white/5">
                  <tr>
                    <th className="text-left font-medium py-2 px-2">Name</th>
                    <th className="text-left font-medium py-2 px-2">UID</th>
                    <th className="text-right font-medium py-2 px-2">Balance</th>
                    <th className="text-right font-medium py-2 px-2">Trades</th>
                    <th className="text-center font-medium py-2 px-2">Status</th>
                    <th className="text-right font-medium py-2 px-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground">
                        Loading...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground">
                        No customers yet.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c) => (
                      <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-2 px-2">
                          <div className="font-medium text-white">{c.name}</div>
                          <div className="text-[10px] text-muted-foreground">{c.email}</div>
                        </td>
                        <td className="py-2 px-2 font-mono text-[10px] text-muted-foreground">
                          {c.uid}
                        </td>
                        <td className="py-2 px-2 text-right font-mono">
                          ${c.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-2 text-right">{c._count?.trades || 0}</td>
                        <td className="py-2 px-2 text-center">
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              c.status === "ACTIVE"
                                ? "border-emerald-400/40 text-emerald-400"
                                : "border-red-400/40 text-red-400"
                            }`}
                          >
                            {c.status}
                          </Badge>
                        </td>
                        <td className="py-2 px-2 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleFreeze(c)}
                            className="h-7 text-[11px] px-2"
                          >
                            {c.status === "ACTIVE" ? (
                              <>
                                <Snowflake className="h-3 w-3 mr-1" /> Freeze
                              </>
                            ) : (
                              <>
                                <Unlock className="h-3 w-3 mr-1" /> Unfreeze
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Recent trades + share card */}
          <div className="space-y-4">
            <section className="bx-glass rounded-xl p-4 sm:p-5">
              <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
                <Activity className="h-4 w-4 text-[#42a5f5]" /> Recent Trades
              </h2>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {trades.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-6">
                    No trades from your customers yet.
                  </p>
                ) : (
                  trades.slice(0, 12).map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 text-xs"
                    >
                      <div>
                        <div className="font-medium text-white">
                          {t.symbol} ·{" "}
                          <span
                            className={
                              t.direction === "UP" ? "text-emerald-400" : "text-red-400"
                            }
                          >
                            {t.direction}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {t.user?.name} · ${t.amount}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-[10px] text-muted-foreground">
                          {t.status}
                        </div>
                        {t.status === "SETTLED" && (
                          <div
                            className={`text-[10px] font-mono ${
                              t.profit >= 0 ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            {t.profit >= 0 ? "+" : ""}${t.profit.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="bx-glass rounded-xl p-4 sm:p-5 bx-glow relative overflow-hidden">
              <div className="absolute inset-0 bx-blue-gradient opacity-10" />
              <div className="relative">
                <h2 className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <LayoutDashboard className="h-4 w-4 text-[#42a5f5]" /> Invitation Code
                </h2>
                <p className="text-xs text-muted-foreground mb-3">
                  Share this code with new customers to onboard them under your agency.
                </p>
                <div className="bx-glass-soft rounded-lg p-3 flex items-center justify-between">
                  <span className="font-mono text-lg font-bold bx-text-gradient">
                    {user.referralCode}
                  </span>
                  <Button size="sm" onClick={copyCode} className="bx-blue-gradient text-white border-0 h-7">
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    Copy
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SubAgentDashboard;
