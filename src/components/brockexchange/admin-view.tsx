"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  CreditCard,
  BarChart3,
  Settings,
  Save,
  Coins,
  Wallet,
  MessageSquare,
  ShieldCheck,
  LogOut,
  Search,
  MoreVertical,
  Eye,
  Plus,
  Minus,
  Snowflake,
  Unlock,
  Bell,
  History,
  RefreshCw,
  Download,
  CheckCircle2,
  XCircle,
  Trophy,
  Activity,
} from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Section =
  | "dashboard" | "users" | "trades" | "payments"
  | "reports" | "settings" | "market" | "wallet" | "messaging" | "security";

const NAV: { id: Section; label: string; icon: any }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
  { id: "trades", label: "Trades", icon: TrendingUp },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "market", label: "Market", icon: Coins },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "messaging", label: "Messaging", icon: MessageSquare },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "settings", label: "Settings", icon: Settings },
];

export function AdminView() {
  const { user, logout, navigate, apiFetch } = useAuth();
  const [section, setSection] = useState<Section>("dashboard");

  if (!user || user.role !== "SUPER_ADMIN") return null;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 border-r border-white/5 bg-[#02060f] flex-col">
        <div className="h-16 px-4 flex items-center border-b border-white/5">
          <Logo size={36} />
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map((n) => {
            const active = section === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setSection(n.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active ? "bg-[#2196f3]/15 text-[#42a5f5] border border-[#2196f3]/30" : "text-muted-foreground hover:bg-white/5 hover:text-white border border-transparent"
                }`}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { logout(); navigate("home"); }}
            className="w-full text-red-400 justify-start"
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-white/5 bx-glass flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <div className="lg:hidden">
            <Logo size={32} />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-base font-semibold capitalize">{section}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex text-xs text-muted-foreground">Welcome,</span>
            <span className="text-sm font-semibold text-white">{user.name}</span>
            <Badge variant="outline" className="border-[#42a5f5]/40 text-[#42a5f5] text-[10px]">SUPER ADMIN</Badge>
          </div>
        </header>

        {/* Mobile nav */}
        <div className="lg:hidden border-b border-white/5 overflow-x-auto">
          <div className="flex gap-1 p-2 min-w-max">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => setSection(n.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${
                  section === n.id ? "bg-[#2196f3]/15 text-[#42a5f5]" : "text-muted-foreground"
                }`}
              >
                <n.icon className="h-3.5 w-3.5" />
                {n.label}
              </button>
            ))}
          </div>
        </div>

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {section === "dashboard" && <DashboardSection apiFetch={apiFetch} />}
          {section === "users" && <UsersSection apiFetch={apiFetch} />}
          {section === "trades" && <TradesSection apiFetch={apiFetch} />}
          {section === "payments" && <PaymentsSection apiFetch={apiFetch} />}
          {section === "reports" && <ReportsSection apiFetch={apiFetch} />}
          {section === "settings" && <SettingsSection />}
          {section === "market" && <PlaceholderSection icon={Coins} title="Market Management" />}
          {section === "wallet" && <PlaceholderSection icon={Wallet} title="Wallet Management" />}
          {section === "messaging" && <PlaceholderSection icon={MessageSquare} title="Messaging" />}
          {section === "security" && <PlaceholderSection icon={ShieldCheck} title="Security" />}
        </main>
      </div>
    </div>
  );
}

// ─── Dashboard section ────────────────────────────────────────
interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalAgents: number;
  totalTrades: number;
  activeTrades: number;
  revenue: number;
  totalDeposits: number;
  totalWithdrawals: number;
  todayDeposits: number;
  todayWithdrawals: number;
  winningTrades: number;
  losingTrades: number;
}

function DashboardSection({ apiFetch }: { apiFetch: any }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [series, setSeries] = useState<any[]>([]);
  const [coinVol, setCoinVol] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/admin/stats");
      const data = await res.json();
      if (res.ok) {
        setStats(data.stats);
        setSeries(data.revenueSeries || []);
        setCoinVol(data.coinVolume || []);
      }
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
     
  }, []);

  const cards: { label: string; value: string | number; icon: any; color: string }[] = stats
    ? [
        { label: "Total Users", value: stats.totalUsers, icon: Users, color: "from-[#2196f3] to-[#0D47A1]" },
        { label: "Active Users", value: stats.activeUsers, icon: Activity, color: "from-[#10b981] to-[#047857]" },
        { label: "Total Agents", value: stats.totalAgents, icon: ShieldCheck, color: "from-[#42a5f5] to-[#1565C0]" },
        { label: "Total Trades", value: stats.totalTrades, icon: TrendingUp, color: "from-[#f59e0b] to-[#b45309]" },
        { label: "Active Trades", value: stats.activeTrades, icon: Activity, color: "from-[#2196f3] to-[#0D47A1]" },
        { label: "Revenue", value: `$${stats.revenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: Wallet, color: "from-[#10b981] to-[#047857]" },
        { label: "Total Deposits", value: `$${stats.totalDeposits.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: CreditCard, color: "from-[#42a5f5] to-[#1565C0]" },
        { label: "Total Withdrawals", value: `$${stats.totalWithdrawals.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: CreditCard, color: "from-[#ef4444] to-[#991b1b]" },
        { label: "Today's Deposits", value: `$${stats.todayDeposits.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: CreditCard, color: "from-[#42a5f5] to-[#1565C0]" },
        { label: "Today's Withdrawals", value: `$${stats.todayWithdrawals.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: CreditCard, color: "from-[#ef4444] to-[#991b1b]" },
        { label: "Winning Trades", value: stats.winningTrades, icon: Trophy, color: "from-[#10b981] to-[#047857]" },
        { label: "Losing Trades", value: stats.losingTrades, icon: XCircle, color: "from-[#ef4444] to-[#991b1b]" },
      ]
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Platform overview at a glance.</p>
        <Button size="sm" variant="outline" onClick={fetch} disabled={loading} className="border-white/10">
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bx-glass rounded-xl p-4 h-24 animate-pulse" />
            ))
          : cards.map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="bx-glass p-3 relative overflow-hidden border-white/5 h-full">
                  <div className={`absolute -top-4 -right-4 h-16 w-16 rounded-full bg-gradient-to-br ${c.color} opacity-20 blur-xl`} />
                  <div className="relative">
                    <div className={`h-7 w-7 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center mb-2`}>
                      <c.icon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="text-lg font-bold">{c.value}</div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">{c.label}</div>
                  </div>
                </Card>
              </motion.div>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
        <Card className="bx-glass p-4 border-white/5">
          <h3 className="text-sm font-semibold mb-3">Revenue (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="admin-rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2196f3" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#2196f3" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" stroke="#8896b3" fontSize={11} />
                <YAxis stroke="#8896b3" fontSize={11} />
                <RechartsTooltip
                  contentStyle={{ background: "#0a1322", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: any) => [`$${Number(v).toFixed(2)}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2196f3" strokeWidth={2} fill="url(#admin-rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bx-glass p-4 border-white/5">
          <h3 className="text-sm font-semibold mb-3">Top Coins by Volume</h3>
          <div className="space-y-2">
            {coinVol.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No data yet.</p>
            ) : (
              coinVol.map((c) => (
                <div key={c.symbol} className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-xs">
                  <span className="font-semibold">{c.symbol}</span>
                  <Badge variant="outline" className="text-[10px] border-[#42a5f5]/40 text-[#42a5f5]">
                    {c.count} trades
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Users section ────────────────────────────────────────────
interface AdminUser {
  id: string;
  uid: string;
  email: string;
  name: string;
  role: string;
  status: string;
  balance: number;
  vipLevel: number;
  _count?: { trades: number };
  createdAt: string;
}

function UsersSection({ apiFetch }: { apiFetch: any }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionUser, setActionUser] = useState<AdminUser | null>(null);
  const [actionType, setActionType] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(query ? `/api/admin/users?q=${encodeURIComponent(query)}` : "/api/admin/users");
      const data = await res.json();
      if (res.ok) setUsers(data.users || []);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
     
  }, [query]);

  const openAction = (u: AdminUser, action: string) => {
    setActionUser(u);
    setActionType(action);
    setAmount("");
  };

  const runAction = async () => {
    if (!actionUser) return;
    setProcessing(true);
    try {
      let res;
      if (actionType === "CREDIT" || actionType === "DEBIT" || actionType === "FREEZE_ACCOUNT" || actionType === "UNFREEZE_ACCOUNT") {
        res = await apiFetch("/api/admin/wallet", {
          method: "PATCH",
          body: JSON.stringify({
            action: actionType,
            targetUserId: actionUser.id,
            amount: amount ? Number(amount) : undefined,
          }),
        });
      } else if (actionType === "SEND_NOTIFICATION") {
        res = await apiFetch("/api/admin/notifications", {
          method: "POST",
          body: JSON.stringify({
            userId: actionUser.id,
            title: "Admin Message",
            body: amount || "You have a new message from the admin team.",
            type: "info",
          }),
        });
      } else {
        toast.info("Feature coming soon");
        setProcessing(false);
        setActionUser(null);
        return;
      }
      const data = await res.json();
      if (res.ok) {
        toast.success(`Action ${actionType} completed`);
        fetchUsers();
        setActionUser(null);
      } else {
        toast.error(data.error || "Failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setProcessing(false);
    }
  };

  const needsAmount = actionType === "CREDIT" || actionType === "DEBIT";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by UID, email, name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 bg-white/5 border-white/10"
          />
        </div>
        <Button size="sm" variant="outline" onClick={fetchUsers} className="border-white/10">
          <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh
        </Button>
      </div>

      <div className="bx-glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[65vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground border-b border-white/5 sticky top-0 bg-[#0a1322] z-10">
              <tr>
                <th className="text-left font-medium py-3 px-3">Name</th>
                <th className="text-left font-medium py-3 px-3 hidden sm:table-cell">UID</th>
                <th className="text-left font-medium py-3 px-3">Role</th>
                <th className="text-right font-medium py-3 px-3">Balance</th>
                <th className="text-right font-medium py-3 px-3 hidden sm:table-cell">Trades</th>
                <th className="text-center font-medium py-3 px-3">Status</th>
                <th className="text-right font-medium py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">No users.</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 text-xs">
                    <td className="py-2 px-3">
                      <div className="font-medium text-white">{u.name}</div>
                      <div className="text-[10px] text-muted-foreground">{u.email}</div>
                    </td>
                    <td className="py-2 px-3 font-mono text-[10px] hidden sm:table-cell">{u.uid}</td>
                    <td className="py-2 px-3">
                      <Badge variant="outline" className="text-[10px] border-[#42a5f5]/40 text-[#42a5f5]">{u.role}</Badge>
                    </td>
                    <td className="py-2 px-3 text-right font-mono">${u.balance.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right hidden sm:table-cell">{u._count?.trades || 0}</td>
                    <td className="py-2 px-3 text-center">
                      <Badge variant="outline" className={`text-[10px] ${u.status === "ACTIVE" ? "border-emerald-400/40 text-emerald-400" : u.status === "FROZEN" ? "border-[#f59e0b]/40 text-[#f59e0b]" : "border-red-400/40 text-red-400"}`}>
                        {u.status}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-7 w-7">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-[#0a1322] border-white/10">
                          <DropdownMenuItem onClick={() => toast.info(`UID: ${u.uid}`)}>
                            <Eye className="mr-2 h-3.5 w-3.5" /> View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openAction(u, "CREDIT")}>
                            <Plus className="mr-2 h-3.5 w-3.5" /> Add Balance
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openAction(u, "DEBIT")}>
                            <Minus className="mr-2 h-3.5 w-3.5" /> Deduct Balance
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openAction(u, "FREEZE_ACCOUNT")}>
                            <Snowflake className="mr-2 h-3.5 w-3.5" /> Freeze Account
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openAction(u, "UNFREEZE_ACCOUNT")}>
                            <Unlock className="mr-2 h-3.5 w-3.5" /> Unfreeze Account
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openAction(u, "SEND_NOTIFICATION")}>
                            <Bell className="mr-2 h-3.5 w-3.5" /> Send Notification
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => toast.info("Open History view")}>
                            <History className="mr-2 h-3.5 w-3.5" /> Trading History
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.info("Login logs")}>
                            <Eye className="mr-2 h-3.5 w-3.5" /> Login History
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action dialog */}
      <Dialog open={!!actionUser} onOpenChange={(o) => !o && setActionUser(null)}>
        <DialogContent className="bx-glass border-white/10 max-w-sm">
          <DialogHeader>
            <DialogTitle className="capitalize">
              {actionType === "CREDIT" && "Add Balance"}
              {actionType === "DEBIT" && "Deduct Balance"}
              {actionType === "FREEZE_ACCOUNT" && "Freeze Account"}
              {actionType === "UNFREEZE_ACCOUNT" && "Unfreeze Account"}
              {actionType === "SEND_NOTIFICATION" && "Send Notification"}
            </DialogTitle>
            <DialogDescription>
              {actionUser?.name} ({actionUser?.uid})
            </DialogDescription>
          </DialogHeader>
          {needsAmount && (
            <div className="space-y-1.5">
              <Label className="text-xs">Amount (USD)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-white/5 border-white/10"
                placeholder="100.00"
                autoFocus
              />
            </div>
          )}
          {actionType === "SEND_NOTIFICATION" && (
            <div className="space-y-1.5">
              <Label className="text-xs">Message</Label>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-white/5 border-white/10"
                placeholder="Enter your message"
                autoFocus
              />
            </div>
          )}
          {(actionType === "FREEZE_ACCOUNT" || actionType === "UNFREEZE_ACCOUNT") && (
            <p className="text-xs text-muted-foreground">
              {actionType === "FREEZE_ACCOUNT"
                ? "The user will be unable to login or trade until unfrozen."
                : "The user account will be restored to active status."}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionUser(null)} className="border-white/10">
              Cancel
            </Button>
            <Button onClick={runAction} disabled={processing} className="bx-blue-gradient text-white border-0">
              {processing ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Trades section ───────────────────────────────────────────
function TradesSection({ apiFetch }: { apiFetch: any }) {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/admin/trades");
      const data = await res.json();
      if (res.ok) setTrades(data.trades || []);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
     
  }, []);

  return (
    <div className="space-y-4">
      <Button size="sm" variant="outline" onClick={fetch} className="border-white/10">
        <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh
      </Button>
      <div className="bx-glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="text-muted-foreground border-b border-white/5 sticky top-0 bg-[#0a1322]">
              <tr>
                <th className="text-left font-medium py-2 px-3">Trade ID</th>
                <th className="text-left font-medium py-2 px-3">User</th>
                <th className="text-left font-medium py-2 px-3">Pair</th>
                <th className="text-center font-medium py-2 px-3">Dir</th>
                <th className="text-right font-medium py-2 px-3">Amount</th>
                <th className="text-center font-medium py-2 px-3">Status</th>
                <th className="text-right font-medium py-2 px-3">P/L</th>
                <th className="text-left font-medium py-2 px-3 hidden sm:table-cell">Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
              ) : trades.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">No trades.</td></tr>
              ) : (
                trades.map((t) => (
                  <tr key={t.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 px-3 font-mono text-[10px]">{t.tradeId}</td>
                    <td className="py-2 px-3">
                      <div className="font-medium">{t.user?.name}</div>
                      <div className="text-[10px] text-muted-foreground">{t.user?.uid}</div>
                    </td>
                    <td className="py-2 px-3 font-semibold">{t.symbol}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={t.direction === "UP" ? "text-emerald-400" : "text-red-400"}>
                        {t.direction === "UP" ? "▲" : "▼"}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono">${t.amount.toFixed(2)}</td>
                    <td className="py-2 px-3 text-center">
                      <Badge variant="outline" className={`text-[10px] ${t.status === "ACTIVE" ? "border-[#42a5f5]/40 text-[#42a5f5]" : t.result === "WIN" ? "border-emerald-400/40 text-emerald-400" : "border-red-400/40 text-red-400"}`}>
                        {t.status === "ACTIVE" ? "Active" : t.result}
                      </Badge>
                    </td>
                    <td className={`py-2 px-3 text-right font-mono ${t.profit > 0 ? "text-emerald-400" : t.profit < 0 ? "text-red-400" : ""}`}>
                      {t.status === "SETTLED" ? `${t.profit >= 0 ? "+" : ""}$${t.profit.toFixed(2)}` : "—"}
                    </td>
                    <td className="py-2 px-3 text-[10px] text-muted-foreground hidden sm:table-cell">
                      {new Date(t.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Payments section ─────────────────────────────────────────
function PaymentsSection({ apiFetch }: { apiFetch: any }) {
  const [tab, setTab] = useState("deposits");
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const [dRes, wRes] = await Promise.all([
        apiFetch("/api/admin/deposits?status=PENDING"),
        apiFetch("/api/admin/withdrawals?status=PENDING"),
      ]);
      const dData = await dRes.json();
      const wData = await wRes.json();
      if (dRes.ok) setDeposits(dData.deposits || []);
      if (wRes.ok) setWithdrawals(wData.withdrawals || []);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
     
  }, []);

  const handleAction = async (type: "deposit" | "withdrawal", id: string, action: "APPROVE" | "REJECT") => {
    const url = type === "deposit" ? "/api/admin/deposits" : "/api/admin/withdrawals";
    try {
      const res = await apiFetch(url, {
        method: "PATCH",
        body: JSON.stringify({ transactionId: id, action }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`${type} ${action.toLowerCase()}`);
        fetch();
      } else {
        toast.error(data.error || "Failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const renderRows = (items: any[], type: "deposit" | "withdrawal") => {
    if (loading) return <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</td></tr>;
    if (items.length === 0) return <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No pending {type}s.</td></tr>;
    return items.map((t) => (
      <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 text-xs">
        <td className="py-2 px-3 font-mono text-[10px]">{t.txId}</td>
        <td className="py-2 px-3">
          <div className="font-medium">{t.user?.name}</div>
          <div className="text-[10px] text-muted-foreground">{t.user?.uid}</div>
        </td>
        <td className="py-2 px-3 font-mono">${t.amount.toFixed(2)}</td>
        <td className="py-2 px-3">{t.method}</td>
        <td className="py-2 px-3">
          <Badge variant="outline" className="text-[10px] border-[#f59e0b]/40 text-[#f59e0b]">{t.status}</Badge>
        </td>
        <td className="py-2 px-3 text-right">
          <div className="flex gap-1 justify-end">
            <Button size="sm" onClick={() => handleAction(type, t.id, "APPROVE")} className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 h-7 text-[10px] px-2">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
            </Button>
            <Button size="sm" onClick={() => handleAction(type, t.id, "REJECT")} className="bg-red-500 hover:bg-red-600 text-white border-0 h-7 text-[10px] px-2">
              <XCircle className="h-3 w-3 mr-1" /> Reject
            </Button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <div className="flex items-center justify-between mb-4">
        <TabsList className="bg-white/5">
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
        </TabsList>
        <Button size="sm" variant="outline" onClick={fetch} className="border-white/10">
          <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh
        </Button>
      </div>
      <TabsContent value="deposits">
        <div className="bx-glass rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground border-b border-white/5">
              <tr>
                <th className="text-left font-medium py-3 px-3">TxID</th>
                <th className="text-left font-medium py-3 px-3">User</th>
                <th className="text-left font-medium py-3 px-3">Amount</th>
                <th className="text-left font-medium py-3 px-3">Method</th>
                <th className="text-left font-medium py-3 px-3">Status</th>
                <th className="text-right font-medium py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>{renderRows(deposits, "deposit")}</tbody>
          </table>
        </div>
      </TabsContent>
      <TabsContent value="withdrawals">
        <div className="bx-glass rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground border-b border-white/5">
              <tr>
                <th className="text-left font-medium py-3 px-3">TxID</th>
                <th className="text-left font-medium py-3 px-3">User</th>
                <th className="text-left font-medium py-3 px-3">Amount</th>
                <th className="text-left font-medium py-3 px-3">Method</th>
                <th className="text-left font-medium py-3 px-3">Status</th>
                <th className="text-right font-medium py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>{renderRows(withdrawals, "withdrawal")}</tbody>
          </table>
        </div>
      </TabsContent>
    </Tabs>
  );
}

// ─── Reports section ──────────────────────────────────────────
function ReportsSection({ apiFetch }: { apiFetch: any }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [series, setSeries] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch("/api/admin/stats");
        const data = await res.json();
        if (res.ok) {
          setStats(data.stats);
          setSeries(data.revenueSeries || []);
        }
      } catch {
        /* noop */
      }
    })();
     
  }, []);

  const userGrowth = [
    { day: "Mon", users: 12 },
    { day: "Tue", users: 18 },
    { day: "Wed", users: 9 },
    { day: "Thu", users: 24 },
    { day: "Fri", users: 31 },
    { day: "Sat", users: 22 },
    { day: "Sun", users: 28 },
  ];

  const depVsWd = [
    { day: "Mon", deposits: 4200, withdrawals: 1800 },
    { day: "Tue", deposits: 3100, withdrawals: 2400 },
    { day: "Wed", deposits: 5400, withdrawals: 2900 },
    { day: "Thu", deposits: 6100, withdrawals: 3300 },
    { day: "Fri", deposits: 7200, withdrawals: 4100 },
    { day: "Sat", deposits: 4800, withdrawals: 3600 },
    { day: "Sun", deposits: 5500, withdrawals: 2900 },
  ];

  const tradeVolume = [
    { day: "Mon", volume: 240 },
    { day: "Tue", volume: 320 },
    { day: "Wed", volume: 280 },
    { day: "Thu", volume: 410 },
    { day: "Fri", volume: 520 },
    { day: "Sat", volume: 380 },
    { day: "Sun", volume: 460 },
  ];

  const exportCsv = (rows: any[], name: string) => {
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => r[h]).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${name}.csv downloaded`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => exportCsv(series, "revenue")} className="border-white/10">
          <Download className="h-3.5 w-3.5 mr-1" /> Revenue CSV
        </Button>
        <Button size="sm" variant="outline" onClick={() => exportCsv(userGrowth, "user-growth")} className="border-white/10">
          <Download className="h-3.5 w-3.5 mr-1" /> Users CSV
        </Button>
        <Button size="sm" variant="outline" onClick={() => exportCsv(depVsWd, "deposits-withdrawals")} className="border-white/10">
          <Download className="h-3.5 w-3.5 mr-1" /> Cashflow CSV
        </Button>
        <Button size="sm" variant="outline" onClick={() => exportCsv(tradeVolume, "trade-volume")} className="border-white/10">
          <Download className="h-3.5 w-3.5 mr-1" /> Volume CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bx-glass p-4 border-white/5">
          <h3 className="text-sm font-semibold mb-3">Revenue</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="rep-rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" stroke="#8896b3" fontSize={11} />
                <YAxis stroke="#8896b3" fontSize={11} />
                <RechartsTooltip contentStyle={{ background: "#0a1322", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#rep-rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bx-glass p-4 border-white/5">
          <h3 className="text-sm font-semibold mb-3">User Growth</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" stroke="#8896b3" fontSize={11} />
                <YAxis stroke="#8896b3" fontSize={11} />
                <RechartsTooltip contentStyle={{ background: "#0a1322", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="users" stroke="#2196f3" strokeWidth={2} dot={{ fill: "#2196f3", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bx-glass p-4 border-white/5">
          <h3 className="text-sm font-semibold mb-3">Deposits vs Withdrawals</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={depVsWd}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" stroke="#8896b3" fontSize={11} />
                <YAxis stroke="#8896b3" fontSize={11} />
                <RechartsTooltip contentStyle={{ background: "#0a1322", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="deposits" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="withdrawals" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bx-glass p-4 border-white/5">
          <h3 className="text-sm font-semibold mb-3">Trade Volume</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tradeVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" stroke="#8896b3" fontSize={11} />
                <YAxis stroke="#8896b3" fontSize={11} />
                <RechartsTooltip contentStyle={{ background: "#0a1322", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="volume" fill="#2196f3" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Settings section ─────────────────────────────────────────
function SettingsSection() {
  const [minTrade, setMinTrade] = useState("10");
  const [maxTrade, setMaxTrade] = useState("10000");
  const [payout30, setPayout30] = useState("20");
  const [payout60, setPayout60] = useState("30");
  const [payout120, setPayout120] = useState("50");

  return (
    <div className="max-w-2xl space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Settings saved (demo)");
        }}
        className="bx-glass rounded-xl p-5 sm:p-6 space-y-4"
      >
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Settings className="h-4 w-4 text-[#42a5f5]" /> Platform Settings
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Min Trade Amount ($)</Label>
            <Input value={minTrade} onChange={(e) => setMinTrade(e.target.value)} className="bg-white/5 border-white/10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Max Trade Amount ($)</Label>
            <Input value={maxTrade} onChange={(e) => setMaxTrade(e.target.value)} className="bg-white/5 border-white/10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Payout 30s (%)</Label>
            <Input value={payout30} onChange={(e) => setPayout30(e.target.value)} className="bg-white/5 border-white/10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Payout 60s (%)</Label>
            <Input value={payout60} onChange={(e) => setPayout60(e.target.value)} className="bg-white/5 border-white/10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Payout 120s (%)</Label>
            <Input value={payout120} onChange={(e) => setPayout120(e.target.value)} className="bg-white/5 border-white/10" />
          </div>
        </div>
        <Button type="submit" className="bx-blue-gradient text-white border-0">
          <Save className="h-4 w-4 mr-1" /> Save Settings
        </Button>
      </form>
    </div>
  );
}

function PlaceholderSection({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="bx-glass rounded-2xl p-10 text-center max-w-md">
        <div className="h-16 w-16 rounded-2xl bx-blue-gradient bx-glow flex items-center justify-center mx-auto mb-4">
          <Icon className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground mt-2">
          This section is coming soon. Stay tuned — we&apos;re rolling out new admin tools regularly.
        </p>
        <Badge variant="outline" className="mt-4 border-[#f59e0b]/40 text-[#f59e0b]">
          Coming Soon
        </Badge>
      </div>
    </div>
  );
}

export default AdminView;
