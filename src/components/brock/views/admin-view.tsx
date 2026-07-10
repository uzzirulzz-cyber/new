"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Wallet,
  CandlestickChart,
  TrendingUp,
  CreditCard,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  Settings,
  LogOut,
  Search,
  RefreshCw,
  Lock,
  Ban,
  CheckCircle2,
  XCircle,
  Snowflake,
  Send,
  ArrowDownToLine,
  ArrowUpFromLine,
  Bell,
  Activity,
  Coins,
  Users2,
  DollarSign,
  Clock,
} from "lucide-react";
import { useAuth, apiFetch } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { BrandWordmark } from "../logo";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { COINS, formatPrice } from "@/lib/market-data";

type Section =
  | "dashboard"
  | "users"
  | "wallet"
  | "trades"
  | "market"
  | "payments"
  | "messaging"
  | "reports"
  | "security"
  | "settings";

const NAV: { id: Section; label: string; icon: React.ElementType; group: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Overview" },
  { id: "users", label: "User Management", icon: Users, group: "Overview" },
  { id: "wallet", label: "Wallet Management", icon: Wallet, group: "Operations" },
  { id: "trades", label: "Trade Management", icon: CandlestickChart, group: "Operations" },
  { id: "market", label: "Market Management", icon: TrendingUp, group: "Operations" },
  { id: "payments", label: "Payments", icon: CreditCard, group: "Operations" },
  { id: "messaging", label: "Messaging", icon: MessageSquare, group: "System" },
  { id: "reports", label: "Reports", icon: BarChart3, group: "System" },
  { id: "security", label: "Security", icon: ShieldCheck, group: "System" },
  { id: "settings", label: "Settings", icon: Settings, group: "System" },
];

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

type Stats = {
  totalUsers: number;
  customers: number;
  subAgents: number;
  activeTrades: number;
  settledTrades: number;
  totalTrades: number;
  totalBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  todayDeposits: number;
  todayWithdrawals: number;
  pendingApprovals: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  revenue: number;
};

function Dashboard({ syncTick }: { syncTick: number }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [revenueSeries, setRevenueSeries] = useState<{ date: string; revenue: number }[]>([]);
  const [coinVolume, setCoinVolume] = useState<{ symbol: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await apiFetch("/api/admin/stats");
        const data = await res.json();
        if (cancelled) return;
        if (data.stats) setStats(data.stats);
        if (data.revenueSeries) setRevenueSeries(data.revenueSeries);
        if (data.coinVolume) setCoinVolume(data.coinVolume);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [syncTick]);

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bx-glass rounded-xl p-4 h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users2} label="Total Users" value={stats.totalUsers.toString()} sub={`${stats.customers} customers • ${stats.subAgents} agents`} />
        <StatCard icon={Activity} label="Active Trades" value={stats.activeTrades.toString()} sub={`${stats.settledTrades} settled`} color="#00c853" />
        <StatCard icon={TrendingUp} label="Total Trades" value={stats.totalTrades.toString()} color="#a855f7" />
        <StatCard icon={DollarSign} label="Revenue" value={`$${stats.revenue.toFixed(2)}`} sub="house profit" color="#f59e0b" />
        <StatCard icon={Wallet} label="Custodial Balance" value={`$${stats.totalBalance.toFixed(2)}`} color="#2196f3" />
        <StatCard icon={ArrowDownToLine} label="Total Deposits" value={`$${stats.totalDeposits.toFixed(2)}`} sub={`Today: $${stats.todayDeposits.toFixed(2)}`} color="#00c853" />
        <StatCard icon={ArrowUpFromLine} label="Total Withdrawals" value={`$${stats.totalWithdrawals.toFixed(2)}`} sub={`Today: $${stats.todayWithdrawals.toFixed(2)}`} color="#ff3b30" />
        <StatCard icon={Clock} label="Pending Approvals" value={stats.pendingApprovals.toString()} sub={`${stats.pendingDeposits}D / ${stats.pendingWithdrawals}W`} color="#f59e0b" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bx-glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Revenue (last 7 days)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueSeries}>
              <defs>
                <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2196f3" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#2196f3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <RTooltip contentStyle={{ background: "#0a1322", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#2196f3" strokeWidth={2} fill="url(#rev-grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bx-glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Top coins by volume</h3>
          <div className="space-y-3">
            {coinVolume.length === 0 ? (
              <p className="text-xs text-muted-foreground">No trade volume yet.</p>
            ) : (
              coinVolume.map((c) => {
                const max = Math.max(...coinVolume.map((x) => x.count), 1);
                const pct = (c.count / max) * 100;
                const coin = COINS.find((x) => x.symbol === c.symbol);
                return (
                  <div key={c.symbol}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-white font-medium">{coin?.icon} {c.symbol}</span>
                      <span className="text-muted-foreground">{c.count}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bx-blue-gradient" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type AdminUser = {
  id: string;
  uid: string;
  email: string;
  name: string;
  role: string;
  status: string;
  balance: number;
  vipLevel: number;
  referralCode: string;
  invitationCode: string | null;
  linkedSubAgentId: string | null;
  mustChangePassword: boolean;
  createdAt: string;
  tradesCount: number;
};

function UsersSection({ syncTick }: { syncTick: number }) {
  const { user: admin } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [adjustAmt, setAdjustAmt] = useState<number>(0);
  const [adjustAction, setAdjustAction] = useState<"CREDIT" | "DEBIT" | "FREEZE_FUNDS" | "UNFREEZE_FUNDS" | "FREEZE_ACCOUNT" | "UNFREEZE_ACCOUNT">("CREDIT");
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");
  const [logins, setLogins] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await apiFetch("/api/admin/users");
        const data = await res.json();
        if (!cancelled && data.users) setUsers(data.users);
      } catch {} finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [syncTick]);

  const filtered = users.filter(
    (u) => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.uid.toLowerCase().includes(search.toLowerCase())
  );

  const openUser = async (u: AdminUser) => {
    setSelected(u);
    setLogins([]);
    try {
      const res = await apiFetch(`/api/admin/users/${u.id}/logins`);
      const data = await res.json();
      if (data.logs) setLogins(data.logs);
    } catch {}
  };

  const doAdjust = async () => {
    if (!selected) return;
    try {
      const res = await apiFetch("/api/admin/wallet", {
        method: "PATCH",
        body: JSON.stringify({ userId: selected.id, action: adjustAction, amount: adjustAmt, reason: `Admin ${adjustAction}` }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`${adjustAction} applied`);
        setUsers((prev) => prev.map((u) => (u.id === selected.id ? { ...u, balance: data.user?.balance ?? u.balance, status: data.user?.status ?? u.status } : u)));
        setSelected((prev) => (prev ? { ...prev, balance: data.user?.balance ?? prev.balance, status: data.user?.status ?? prev.status } : prev));
      } else {
        toast.error(data.error || "Failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const sendNotif = async () => {
    if (!selected || !notifTitle || !notifBody) return;
    try {
      const res = await apiFetch("/api/admin/notifications", {
        method: "POST",
        body: JSON.stringify({ userId: selected.id, title: notifTitle, body: notifBody, type: "info" }),
      });
      if (res.ok) {
        toast.success("Notification sent");
        setNotifTitle("");
        setNotifBody("");
      } else {
        toast.error("Failed");
      }
    } catch {}
  };

  if (loading) return <div className="bx-glass rounded-xl p-8 text-center text-muted-foreground">Loading users...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or UID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10"
          />
        </div>
        <Badge variant="outline" className="border-white/10 text-muted-foreground">{users.length} total</Badge>
      </div>

      <div className="bx-glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto bx-scroll">
          <table className="w-full text-sm">
            <thead className="bg-white/5 sticky top-0">
              <tr className="text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Balance</th>
                <th className="px-4 py-3 font-medium">Trades</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                    <div className="text-[10px] text-muted-foreground">{u.uid}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={u.role === "SUB_AGENT" ? "border-[#a855f7]/40 text-[#a855f7]" : "border-white/10 text-muted-foreground"}>
                      {u.role.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-white">{u.balance.toFixed(2)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.tradesCount}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={u.status === "ACTIVE" ? "border-[#00c853]/40 text-[#00c853]" : u.status === "FROZEN" ? "border-[#42a5f5]/40 text-[#42a5f5]" : "border-[#ff3b30]/40 text-[#ff3b30]"}>
                      {u.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" onClick={() => openUser(u)} className="h-7 text-xs border-white/10">Manage</Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#02060f]/80 backdrop-blur-sm p-4" onClick={() => setSelected(null)}>
          <div className="bx-glass rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto bx-scroll bx-glow" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{selected.name}</h3>
                <p className="text-xs text-muted-foreground">{selected.email} • {selected.uid}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 text-sm">
              <div><div className="text-xs text-muted-foreground">Role</div><div className="text-white">{selected.role.replace("_", " ")}</div></div>
              <div><div className="text-xs text-muted-foreground">Status</div><div className="text-white">{selected.status}</div></div>
              <div><div className="text-xs text-muted-foreground">Balance</div><div className="text-white">{selected.balance.toFixed(2)} USDT</div></div>
              <div><div className="text-xs text-muted-foreground">VIP</div><div className="text-white">{selected.vipLevel}</div></div>
              <div><div className="text-xs text-muted-foreground">Trades</div><div className="text-white">{selected.tradesCount}</div></div>
              <div><div className="text-xs text-muted-foreground">Referral</div><div className="text-white">{selected.referralCode}</div></div>
              <div><div className="text-xs text-muted-foreground">Invited by</div><div className="text-white">{selected.invitationCode || "—"}</div></div>
              <div><div className="text-xs text-muted-foreground">Joined</div><div className="text-white text-xs">{new Date(selected.createdAt).toLocaleDateString()}</div></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Wallet actions */}
              <div className="bx-glass-soft rounded-lg p-4">
                <h4 className="text-sm font-semibold text-white mb-3">Wallet actions</h4>
                <div className="space-y-2">
                  <Select value={adjustAction} onValueChange={(v) => setAdjustAction(v as any)}>
                    <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#0a1322] border-white/10">
                      <SelectItem value="CREDIT">Credit (add funds)</SelectItem>
                      <SelectItem value="DEBIT">Debit (remove funds)</SelectItem>
                      <SelectItem value="FREEZE_FUNDS">Freeze funds</SelectItem>
                      <SelectItem value="UNFREEZE_FUNDS">Unfreeze funds</SelectItem>
                      <SelectItem value="FREEZE_ACCOUNT">Freeze account</SelectItem>
                      <SelectItem value="UNFREEZE_ACCOUNT">Unfreeze account</SelectItem>
                    </SelectContent>
                  </Select>
                  {(adjustAction === "CREDIT" || adjustAction === "DEBIT") && (
                    <Input type="number" placeholder="Amount USDT" value={adjustAmt || ""} onChange={(e) => setAdjustAmt(Number(e.target.value))} className="bg-white/5 border-white/10" />
                  )}
                  <Button onClick={doAdjust} className="w-full bx-blue-gradient bx-glow text-white border-0 h-9">Apply action</Button>
                </div>
              </div>

              {/* Send notification */}
              <div className="bx-glass-soft rounded-lg p-4">
                <h4 className="text-sm font-semibold text-white mb-3">Send notification</h4>
                <div className="space-y-2">
                  <Input placeholder="Title" value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} className="bg-white/5 border-white/10 h-9" />
                  <Textarea placeholder="Message..." value={notifBody} onChange={(e) => setNotifBody(e.target.value)} rows={3} className="bg-white/5 border-white/10" />
                  <Button onClick={sendNotif} className="w-full bx-blue-gradient bx-glow text-white border-0 h-9"><Send className="h-3.5 w-3.5 mr-1.5" /> Send</Button>
                </div>
              </div>
            </div>

            {/* Login history */}
            <div className="bx-glass-soft rounded-lg p-4 mt-4">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#2196f3]" /> Login history</h4>
              {logins.length === 0 ? (
                <p className="text-xs text-muted-foreground">No login attempts.</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto bx-scroll">
                  {logins.map((l) => (
                    <div key={l.id} className="flex items-center justify-between text-xs border border-white/5 rounded px-2.5 py-1.5">
                      <span className="text-muted-foreground">{new Date(l.createdAt).toLocaleString()}</span>
                      <span className={l.success ? "text-[#00c853]" : "text-[#ff3b30]"}>{l.success ? "Success" : "Failed"} • {l.reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WalletSection() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [d, w] = await Promise.all([
          apiFetch("/api/admin/deposits").then((r) => r.json()),
          apiFetch("/api/admin/withdrawals").then((r) => r.json()),
        ]);
        if (d.deposits) setDeposits(d.deposits);
        if (w.withdrawals) setWithdrawals(w.withdrawals);
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, []);

  const processTx = async (txId: string, action: "APPROVE" | "REJECT", type: "DEPOSIT" | "WITHDRAWAL") => {
    try {
      const endpoint = type === "DEPOSIT" ? "/api/admin/deposits" : "/api/admin/withdrawals";
      const res = await apiFetch(endpoint, { method: "PATCH", body: JSON.stringify({ txId, action }) });
      if (res.ok) {
        toast.success(`${type} ${action}D`);
        if (type === "DEPOSIT") setDeposits((prev) => prev.map((t) => (t.txId === txId ? { ...t, status: action === "APPROVE" ? "APPROVED" : "REJECTED" } : t)));
        else setWithdrawals((prev) => prev.map((t) => (t.txId === txId ? { ...t, status: action === "APPROVE" ? "APPROVED" : "REJECTED" } : t)));
      } else {
        toast.error("Failed");
      }
    } catch {}
  };

  if (loading) return <div className="bx-glass rounded-xl p-8 text-center text-muted-foreground">Loading transactions...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={ArrowDownToLine} label="Pending deposits" value={deposits.filter((d) => d.status === "PENDING").length.toString()} color="#00c853" />
        <StatCard icon={ArrowUpFromLine} label="Pending withdrawals" value={withdrawals.filter((w) => w.status === "PENDING").length.toString()} color="#ff3b30" />
        <StatCard icon={CheckCircle2} label="Approved deposits" value={deposits.filter((d) => d.status === "APPROVED").length.toString()} color="#2196f3" />
        <StatCard icon={XCircle} label="Rejected" value={(deposits.filter((d) => d.status === "REJECTED").length + withdrawals.filter((w) => w.status === "REJECTED").length).toString()} color="#f59e0b" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bx-glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Pending deposits</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto bx-scroll">
            {deposits.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No deposits.</p>
            ) : (
              deposits.map((d) => (
                <div key={d.id} className="flex items-center justify-between text-sm border border-white/5 rounded-md p-3">
                  <div>
                    <div className="text-white font-medium">{d.user?.name || "Unknown"}</div>
                    <div className="text-xs text-muted-foreground">{d.txId} • {d.method}</div>
                    <div className="text-xs text-[#00c853]">+{d.amount.toFixed(2)} USDT</div>
                  </div>
                  {d.status === "PENDING" ? (
                    <div className="flex gap-1">
                      <Button size="sm" onClick={() => processTx(d.txId, "APPROVE", "DEPOSIT")} className="h-7 text-xs bg-[#00c853] hover:bg-[#009624] text-white border-0">Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => processTx(d.txId, "REJECT", "DEPOSIT")} className="h-7 text-xs border-[#ff3b30]/40 text-[#ff3b30]">Reject</Button>
                    </div>
                  ) : (
                    <Badge variant="outline" className={d.status === "APPROVED" ? "border-[#00c853]/40 text-[#00c853]" : "border-[#ff3b30]/40 text-[#ff3b30]"}>{d.status}</Badge>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bx-glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Pending withdrawals</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto bx-scroll">
            {withdrawals.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No withdrawals.</p>
            ) : (
              withdrawals.map((w) => (
                <div key={w.id} className="flex items-center justify-between text-sm border border-white/5 rounded-md p-3">
                  <div>
                    <div className="text-white font-medium">{w.user?.name || "Unknown"}</div>
                    <div className="text-xs text-muted-foreground">{w.txId} • {w.method}</div>
                    <div className="text-xs text-[#ff3b30]">-{w.amount.toFixed(2)} USDT</div>
                  </div>
                  {w.status === "PENDING" ? (
                    <div className="flex gap-1">
                      <Button size="sm" onClick={() => processTx(w.txId, "APPROVE", "WITHDRAWAL")} className="h-7 text-xs bg-[#00c853] hover:bg-[#009624] text-white border-0">Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => processTx(w.txId, "REJECT", "WITHDRAWAL")} className="h-7 text-xs border-[#ff3b30]/40 text-[#ff3b30]">Reject</Button>
                    </div>
                  ) : (
                    <Badge variant="outline" className={w.status === "APPROVED" ? "border-[#00c853]/40 text-[#00c853]" : "border-[#ff3b30]/40 text-[#ff3b30]"}>{w.status}</Badge>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TradesSection({ syncTick }: { syncTick: number }) {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await apiFetch("/api/admin/trades");
        const data = await res.json();
        if (!cancelled && data.trades) setTrades(data.trades);
      } catch {} finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [syncTick]);

  if (loading) return <div className="bx-glass rounded-xl p-8 text-center text-muted-foreground">Loading trades...</div>;

  return (
    <div className="bx-glass rounded-xl overflow-hidden">
      <div className="overflow-x-auto bx-scroll">
        <table className="w-full text-sm">
          <thead className="bg-white/5 sticky top-0">
            <tr className="text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Trade ID</th>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Symbol</th>
              <th className="px-4 py-3 font-medium">Dir</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Result</th>
              <th className="px-4 py-3 font-medium">Profit</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t) => (
              <tr key={t.id} className="border-t border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 text-xs text-muted-foreground">{t.tradeId}</td>
                <td className="px-4 py-3 text-white">{t.user?.name || "—"}</td>
                <td className="px-4 py-3 text-white">{t.symbol}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={t.direction === "UP" ? "border-[#00c853]/40 text-[#00c853]" : "border-[#ff3b30]/40 text-[#ff3b30]"}>{t.direction}</Badge>
                </td>
                <td className="px-4 py-3 text-white">{t.amount.toFixed(2)}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.duration}s</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={t.result === "WIN" ? "border-[#00c853]/40 text-[#00c853]" : t.result === "LOSE" ? "border-[#ff3b30]/40 text-[#ff3b30]" : "border-amber-500/40 text-amber-500"}>{t.result}</Badge>
                </td>
                <td className={`px-4 py-3 ${t.profit > 0 ? "text-[#00c853]" : t.profit < 0 ? "text-[#ff3b30]" : "text-muted-foreground"}`}>{t.profit.toFixed(2)}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.status}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {trades.length === 0 && (
              <tr><td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">No trades yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MarketSection() {
  return (
    <div className="space-y-4">
      <div className="bx-glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Listed assets ({COINS.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {COINS.map((c) => (
            <div key={c.symbol} className="bx-glass-soft rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: `${c.color}22`, color: c.color }}>{c.icon}</div>
                <div>
                  <div className="text-sm font-semibold text-white">{c.symbol}</div>
                  <div className="text-[10px] text-muted-foreground">{c.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-white">{formatPrice(c.basePrice)}</div>
                <Switch defaultChecked />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bx-glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Trading configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { d: "30s", p: "20%" },
            { d: "60s", p: "30%" },
            { d: "120s", p: "50%" },
          ].map((x) => (
            <div key={x.d} className="bx-glass-soft rounded-lg p-4">
              <div className="text-xs text-muted-foreground">Duration {x.d}</div>
              <Input defaultValue={x.p} className="mt-2 bg-white/5 border-white/10" />
              <div className="text-[10px] text-muted-foreground mt-1">Payout rate</div>
            </div>
          ))}
        </div>
        <Button className="mt-4 bx-blue-gradient bx-glow text-white border-0">Save configuration</Button>
      </div>
    </div>
  );
}

function PaymentsSection() {
  return (
    <div className="bx-glass rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Payment gateways</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {["Stripe", "PayPal", "Coinbase", "Manual Bank", "USDT (TRC20)", "Visa/Mastercard"].map((g) => (
          <div key={g} className="bx-glass-soft rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">{g}</div>
              <div className="text-xs text-[#00c853]">Active</div>
            </div>
            <Switch defaultChecked />
          </div>
        ))}
      </div>
      <div className="mt-4 bx-glass-soft rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-2">USDT wallet (deposits)</h4>
        <Input readOnly value="TJZqYp7n3KsRbQ9XwL2vF8mH4cA6dE1g" className="bg-white/5 border-white/10 font-mono text-xs" />
      </div>
    </div>
  );
}

function MessagingSection() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");
  const send = () => {
    if (!title || !body) {
      toast.error("Title and body required");
      return;
    }
    toast.success(`Broadcast queued to ${audience}`);
    setTitle("");
    setBody("");
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bx-glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Broadcast message</h3>
        <div className="space-y-3">
          <Select value={audience} onValueChange={setAudience}>
            <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#0a1322] border-white/10">
              <SelectItem value="all">All users</SelectItem>
              <SelectItem value="customers">Customers only</SelectItem>
              <SelectItem value="agents">Sub-agents only</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-white/5 border-white/10" />
          <Textarea placeholder="Message body..." value={body} onChange={(e) => setBody(e.target.value)} rows={4} className="bg-white/5 border-white/10" />
          <Button onClick={send} className="bx-blue-gradient bx-glow text-white border-0"><Send className="h-4 w-4 mr-1.5" /> Send broadcast</Button>
        </div>
      </div>
      <div className="bx-glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Recent broadcasts</h3>
        <p className="text-xs text-muted-foreground">No broadcasts sent yet.</p>
      </div>
    </div>
  );
}

function ReportsSection() {
  const data = Array.from({ length: 7 }).map((_, i) => ({
    day: `Day ${i + 1}`,
    revenue: 200 + Math.random() * 800,
    deposits: 100 + Math.random() * 500,
    withdrawals: 50 + Math.random() * 300,
  }));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="MTD Revenue" value={`$${(data.reduce((a, d) => a + d.revenue, 0)).toFixed(0)}`} color="#00c853" />
        <StatCard icon={ArrowDownToLine} label="MTD Deposits" value={`$${(data.reduce((a, d) => a + d.deposits, 0)).toFixed(0)}`} color="#2196f3" />
        <StatCard icon={ArrowUpFromLine} label="MTD Withdrawals" value={`$${(data.reduce((a, d) => a + d.withdrawals, 0)).toFixed(0)}`} color="#ff3b30" />
        <StatCard icon={Activity} label="Active users" value="1,284" color="#a855f7" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bx-glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Revenue vs Withdrawals</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <RTooltip contentStyle={{ background: "#0a1322", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="revenue" fill="#00c853" radius={[4, 4, 0, 0]} />
              <Bar dataKey="withdrawals" fill="#ff3b30" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bx-glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Deposit trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <RTooltip contentStyle={{ background: "#0a1322", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="deposits" stroke="#2196f3" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function SecuritySection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bx-glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#2196f3]" /> Two-factor authentication</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-white">Require 2FA for all admins</div>
            <div className="text-xs text-muted-foreground">Enforce TOTP on next login</div>
          </div>
          <Switch defaultChecked />
        </div>
      </div>
      <div className="bx-glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Ban className="h-4 w-4 text-[#ff3b30]" /> IP whitelist</h3>
        <Input placeholder="0.0.0.0/0" className="bg-white/5 border-white/10" />
        <Button className="mt-2 w-full bx-blue-gradient bx-glow text-white border-0 h-9">Add IP</Button>
        <div className="mt-3 text-xs text-muted-foreground">No IPs whitelisted.</div>
      </div>
      <div className="bx-glass rounded-xl p-5 lg:col-span-2">
        <h3 className="text-sm font-semibold text-white mb-4">Audit log (recent admin actions)</h3>
        <p className="text-xs text-muted-foreground">Action logs are recorded for every admin operation. View them per-user in User Management.</p>
      </div>
    </div>
  );
}

function SettingsSection() {
  return (
    <div className="bx-glass rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Platform settings</h3>
      <Tabs defaultValue="general">
        <TabsList className="bg-white/5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="mt-4 space-y-3">
          <div><Label className="text-xs">Platform name</Label><Input defaultValue="Brock Exchange" className="bg-white/5 border-white/10" /></div>
          <div><Label className="text-xs">Support email</Label><Input defaultValue="support@brock.exchange" className="bg-white/5 border-white/10" /></div>
        </TabsContent>
        <TabsContent value="trading" className="mt-4 space-y-3">
          <div><Label className="text-xs">Min trade amount</Label><Input defaultValue="10" className="bg-white/5 border-white/10" /></div>
          <div><Label className="text-xs">Max trade amount</Label><Input defaultValue="10000" className="bg-white/5 border-white/10" /></div>
        </TabsContent>
        <TabsContent value="maintenance" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div><div className="text-sm text-white">Maintenance mode</div><div className="text-xs text-muted-foreground">Block customer logins</div></div>
            <Switch />
          </div>
          <Textarea placeholder="Maintenance message..." className="bg-white/5 border-white/10" />
        </TabsContent>
      </Tabs>
      <Button className="mt-4 bx-blue-gradient bx-glow text-white border-0">Save settings</Button>
    </div>
  );
}

export function AdminView() {
  const { user, navigate, logout } = useAuth();
  const [section, setSection] = useState<Section>("dashboard");
  const [syncTick, setSyncTick] = useState(0);

  if (!user || user.role !== "SUPER_ADMIN") {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="bx-glass rounded-2xl p-8 max-w-md text-center bx-glow">
          <div className="h-16 w-16 rounded-full bg-[#ff3b30]/15 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-[#ff3b30]" />
          </div>
          <h2 className="text-2xl font-bold text-white">403 • Access Denied</h2>
          <p className="mt-2 text-sm text-muted-foreground">Super admin access required.</p>
          <Button onClick={() => navigate("home")} className="mt-4 bx-blue-gradient bx-glow text-white border-0">Back to Home</Button>
        </div>
      </main>
    );
  }

  const handleLogout = async () => {
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
    logout();
    navigate("home");
  };

  const current = NAV.find((n) => n.id === section)!;
  const groups = Array.from(new Set(NAV.map((n) => n.group)));

  return (
    <main className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 border-r border-white/5 bg-[#02060f]/60 flex-col">
        <div className="p-5 border-b border-white/5">
          <BrandWordmark size={34} />
        </div>
        <nav className="flex-1 overflow-y-auto bx-scroll p-3 space-y-4">
          {groups.map((g) => (
            <div key={g}>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 mb-1.5">{g}</div>
              <div className="space-y-0.5">
                {NAV.filter((n) => n.group === g).map((n) => {
                  const active = n.id === section;
                  return (
                    <button
                      key={n.id}
                      onClick={() => setSection(n.id)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition ${
                        active ? "bx-glass text-white border-l-2 border-[#2196f3] bg-[#2196f3]/10" : "text-muted-foreground hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <n.icon className="h-4 w-4" />
                      {n.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-white/5 space-y-1">
          <button onClick={() => navigate("home")} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm text-muted-foreground hover:text-white hover:bg-white/5">
            <LayoutDashboard className="h-4 w-4" /> Back to site
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm text-[#ff3b30] hover:bg-[#ff3b30]/10">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-white/5 bg-[#02060f]/60 backdrop-blur px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <current.icon className="h-5 w-5 text-[#2196f3]" />
            <div>
              <h1 className="text-base font-bold text-white">{current.label}</h1>
              <p className="text-[10px] text-muted-foreground">Brock Exchange admin panel</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setSyncTick((t) => t + 1)} className="border-white/10 h-8 text-xs">
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Sync
            </Button>
            <div className="hidden md:flex items-center gap-2 px-2 py-1 rounded-md border border-white/10 bg-white/5">
              <div className="h-6 w-6 rounded-full bx-blue-gradient flex items-center justify-center text-xs font-bold text-white">{user.name.slice(0, 1)}</div>
              <span className="text-xs text-white">{user.name}</span>
            </div>
          </div>
        </header>

        {/* Mobile section pills */}
        <div className="lg:hidden border-b border-white/5 px-3 py-2 overflow-x-auto bx-scroll flex gap-1">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setSection(n.id)}
              className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-medium ${n.id === section ? "bx-blue-gradient text-white" : "text-muted-foreground border border-white/10"}`}
            >
              {n.label}
            </button>
          ))}
        </div>

        <div className="flex-1 p-5 overflow-y-auto bx-scroll">
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {section === "dashboard" && <Dashboard syncTick={syncTick} />}
            {section === "users" && <UsersSection syncTick={syncTick} />}
            {section === "wallet" && <WalletSection />}
            {section === "trades" && <TradesSection syncTick={syncTick} />}
            {section === "market" && <MarketSection />}
            {section === "payments" && <PaymentsSection />}
            {section === "messaging" && <MessagingSection />}
            {section === "reports" && <ReportsSection />}
            {section === "security" && <SecuritySection />}
            {section === "settings" && <SettingsSection />}
          </motion.div>
        </div>
      </div>
    </main>
  );
}

export default AdminView;
