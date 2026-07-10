"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Copy,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  Search,
  Snowflake,
  Sun,
  Users,
  Wallet,
  CandlestickChart,
  TrendingUp,
  Share2,
  CheckCircle2,
} from "lucide-react";
import { useAuth, apiFetch } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BrandWordmark } from "../logo";
import { toast } from "sonner";

type Customer = {
  id: string;
  uid: string;
  name: string;
  email: string;
  status: string;
  balance: number;
  vipLevel: number;
  tradesCount: number;
  createdAt: string;
};

type Trade = {
  id: string;
  tradeId: string;
  symbol: string;
  direction: "UP" | "DOWN";
  amount: number;
  result: "PENDING" | "WIN" | "LOSE";
  profit: number;
  status: "ACTIVE" | "SETTLED";
  createdAt: string;
  user?: { name: string; email: string };
};

function StatCard({ icon: Icon, label, value, sub, color = "#2196f3" }: { icon: React.ElementType; label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bx-glass rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: `${color}1a`, color }}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-2 text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

export function SubAgentDashboard() {
  const { user, navigate, logout } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [c, t] = await Promise.all([
          apiFetch("/api/subagent/customers").then((r) => r.json()),
          apiFetch("/api/subagent/trades").then((r) => r.json()),
        ]);
        if (!cancelled) {
          if (c.customers) setCustomers(c.customers);
          if (t.trades) setTrades(t.trades);
        }
      } catch {} finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!user || user.role !== "SUB_AGENT") {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="bx-glass rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-white">Access denied</h2>
          <p className="text-sm text-muted-foreground mt-2">Sub-agent account required.</p>
          <Button onClick={() => navigate("home")} className="mt-4 bx-blue-gradient bx-glow text-white border-0">Back to Home</Button>
        </div>
      </main>
    );
  }

  const active = customers.filter((c) => c.status === "ACTIVE").length;
  const totalBalance = customers.reduce((a, c) => a + c.balance, 0);
  const filtered = customers.filter(
    (c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()) || c.uid.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFreeze = async (c: Customer) => {
    const action = c.status === "ACTIVE" ? "FREEZE" : "UNFREEZE";
    try {
      const res = await apiFetch("/api/subagent/customers", {
        method: "PATCH",
        body: JSON.stringify({ customerId: c.id, action }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`${c.name} ${action === "FREEZE" ? "frozen" : "unfrozen"}`);
        setCustomers((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: data.customer.status } : x)));
      } else {
        toast.error(data.error || "Failed");
      }
    } catch {}
  };

  const copyCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    setCopied(true);
    toast.success("Invitation code copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
    logout();
    navigate("home");
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="border-b border-white/5 bg-[#02060f]/80 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <BrandWordmark size={34} />
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-[#a855f7]/40 text-[#a855f7]">SUB-AGENT</Badge>
            <Button size="sm" variant="outline" onClick={handleLogout} className="border-white/10 h-8 text-xs">
              <LogOut className="h-3.5 w-3.5 mr-1.5" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 bx-fade-in">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <LayoutDashboard className="h-3.5 w-3.5" /> Agent Dashboard
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Welcome back, <span className="bx-text-gradient">{user.name}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your customers, monitor trades, and share your invitation code.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <StatCard icon={Users} label="My Customers" value={customers.length.toString()} sub={`${active} active`} />
          <StatCard icon={Wallet} label="Total Balance" value={`$${totalBalance.toFixed(2)}`} sub="customer funds" color="#00c853" />
          <StatCard icon={CandlestickChart} label="Customer Trades" value={trades.length.toString()} sub="recent" color="#a855f7" />
          <StatCard icon={TrendingUp} label="Commission Rate" value={`${user.vipLevel * 2}%`} sub="on trades" color="#f59e0b" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
          {/* Customers */}
          <div className="lg:col-span-2 bx-glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">My Customers</h3>
              <div className="relative w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 bg-white/5 border-white/10 text-xs" />
              </div>
            </div>
            {loading ? (
              <div className="text-center text-xs text-muted-foreground py-8">Loading customers...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground py-8">No customers found. Share your invitation code to grow.</div>
            ) : (
              <div className="overflow-x-auto bx-scroll">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="px-2 py-2 font-medium">Customer</th>
                      <th className="px-2 py-2 font-medium">Balance</th>
                      <th className="px-2 py-2 font-medium">Trades</th>
                      <th className="px-2 py-2 font-medium">Status</th>
                      <th className="px-2 py-2 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => (
                      <tr key={c.id} className="border-t border-white/5">
                        <td className="px-2 py-2">
                          <div className="text-white font-medium text-sm">{c.name}</div>
                          <div className="text-[10px] text-muted-foreground">{c.email}</div>
                        </td>
                        <td className="px-2 py-2 text-white">{c.balance.toFixed(2)}</td>
                        <td className="px-2 py-2 text-muted-foreground">{c.tradesCount}</td>
                        <td className="px-2 py-2">
                          <Badge variant="outline" className={c.status === "ACTIVE" ? "border-[#00c853]/40 text-[#00c853]" : "border-[#42a5f5]/40 text-[#42a5f5]"}>
                            {c.status}
                          </Badge>
                        </td>
                        <td className="px-2 py-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleFreeze(c)}
                            className="h-7 text-xs border-white/10"
                          >
                            {c.status === "ACTIVE" ? <><Snowflake className="h-3 w-3 mr-1" /> Freeze</> : <><Sun className="h-3 w-3 mr-1" /> Unfreeze</>}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Invitation share card */}
          <div className="bx-glass rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Share2 className="h-4 w-4 text-[#2196f3]" /> Invitation Code</h3>
            <div className="bx-blue-gradient rounded-xl p-5 text-center bx-glow">
              <div className="text-xs text-white/80 uppercase tracking-wider">Your referral code</div>
              <div className="text-3xl font-black text-white mt-2 tracking-wider">{user.referralCode}</div>
              <Button onClick={copyCode} className="mt-3 bg-white text-[#0d47a1] hover:bg-white/90 h-9 text-sm font-semibold w-full">
                {copied ? <><CheckCircle2 className="h-4 w-4 mr-1.5" /> Copied!</> : <><Copy className="h-4 w-4 mr-1.5" /> Copy code</>}
              </Button>
            </div>
            <div className="mt-4 text-xs text-muted-foreground leading-relaxed">
              Share this code with new traders. They'll be linked to your account and you'll earn commission on their trades.
            </div>
            <div className="mt-4 bx-glass-soft rounded-lg p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total referrals</span>
                <span className="text-white font-semibold">{customers.length}</span>
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-muted-foreground">Commission earned</span>
                <span className="text-[#00c853] font-semibold">$0.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent trades */}
        <div className="bx-glass rounded-xl p-5 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Customer trades</h3>
            <Button size="sm" variant="ghost" className="text-xs text-muted-foreground" onClick={() => window.location.reload()}>
              <RefreshCw className="h-3 w-3 mr-1.5" /> Refresh
            </Button>
          </div>
          {loading ? (
            <div className="text-center text-xs text-muted-foreground py-8">Loading trades...</div>
          ) : trades.length === 0 ? (
            <div className="text-center text-xs text-muted-foreground py-8">No trades from your customers yet.</div>
          ) : (
            <div className="overflow-x-auto bx-scroll">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-2 py-2 font-medium">Customer</th>
                    <th className="px-2 py-2 font-medium">Symbol</th>
                    <th className="px-2 py-2 font-medium">Dir</th>
                    <th className="px-2 py-2 font-medium">Amount</th>
                    <th className="px-2 py-2 font-medium">Result</th>
                    <th className="px-2 py-2 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.slice(0, 15).map((t) => (
                    <tr key={t.id} className="border-t border-white/5">
                      <td className="px-2 py-2 text-white">{t.user?.name || "—"}</td>
                      <td className="px-2 py-2 text-white">{t.symbol}</td>
                      <td className="px-2 py-2">
                        <Badge variant="outline" className={t.direction === "UP" ? "border-[#00c853]/40 text-[#00c853]" : "border-[#ff3b30]/40 text-[#ff3b30]"}>{t.direction}</Badge>
                      </td>
                      <td className="px-2 py-2 text-white">{t.amount.toFixed(2)}</td>
                      <td className="px-2 py-2">
                        <Badge variant="outline" className={t.result === "WIN" ? "border-[#00c853]/40 text-[#00c853]" : t.result === "LOSE" ? "border-[#ff3b30]/40 text-[#ff3b30]" : "border-amber-500/40 text-amber-500"}>{t.result}</Badge>
                      </td>
                      <td className="px-2 py-2 text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default SubAgentDashboard;
