"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, UserCheck, UserPlus, DollarSign, TrendingUp,
  BarChart3, Activity, Snowflake, Loader2, AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { fmtUsd, fmtNum } from "@/lib/format";

export function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(r => r.json())
      .then(d => {
        setStats(d.stats);
        setRecentUsers(d.recentUsers || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!stats) return <div className="text-center py-12 text-muted-foreground">Failed to load stats</div>;

  const statCards = [
    { label: "Total Users", value: fmtNum(stats.totalUsers, 0), icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Active Users", value: fmtNum(stats.activeUsers, 0), icon: UserCheck, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Pending Users", value: fmtNum(stats.pendingUsers, 0), icon: UserPlus, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Total Agents", value: fmtNum(stats.totalAgents, 0), icon: UserCheck, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Total Deposits", value: fmtUsd(stats.totalDeposits, { compact: true }), icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Total Withdrawals", value: fmtUsd(stats.totalWithdrawals, { compact: true }), icon: TrendingUp, color: "text-red-400", bg: "bg-red-500/10" },
    { label: "Trading Volume", value: fmtUsd(stats.totalVolume, { compact: true }), icon: BarChart3, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Platform Revenue", value: fmtUsd(stats.platformRevenue, { compact: true }), icon: DollarSign, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Total Trades", value: fmtNum(stats.totalTrades, 0), icon: Activity, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Active Trades", value: fmtNum(stats.activeTrades, 0), icon: Activity, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Frozen Funds", value: fmtUsd(stats.frozenFunds, { compact: true }), icon: Snowflake, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Pending Approvals", value: fmtNum(stats.pendingApprovals, 0), icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10" },
  ];

  // Mock daily activity chart (would come from real data in production)
  const dailyActivity = Array.from({ length: 7 }, (_, i) => ({
    day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
    trades: Math.floor(Math.random() * 200 + 50),
    deposits: Math.floor(Math.random() * 30 + 5),
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className="card-gradient p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{s.label}</p>
                  <p className={`mt-1 text-lg lg:text-xl font-bold ${s.color}`}>{s.value}</p>
                </div>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${s.bg}`}>
                  <s.icon className="h-4 w-4" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="card-gradient p-5">
          <h3 className="font-bold mb-1">Daily Trading Activity</h3>
          <p className="text-xs text-muted-foreground mb-3">Trades per day · last 7 days</p>
          <div className="h-56 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.45)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.45)" }} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "0.5rem", fontSize: 12 }} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="trades" fill="#2563eb" radius={[3, 3, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="card-gradient p-5">
          <h3 className="font-bold mb-1">Deposit Flow</h3>
          <p className="text-xs text-muted-foreground mb-3">Daily deposits · last 7 days</p>
          <div className="h-56 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyActivity}>
                <defs>
                  <linearGradient id="depGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.45)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.45)" }} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "0.5rem", fontSize: 12 }} />
                <Area type="monotone" dataKey="deposits" stroke="#10b981" strokeWidth={2} fill="url(#depGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent registrations */}
      <Card className="card-gradient p-5">
        <h3 className="font-bold mb-3">Recent Registrations</h3>
        {recentUsers.length === 0 ? (
          <p className="text-center py-6 text-sm text-muted-foreground">No users registered yet</p>
        ) : (
          <div className="space-y-2">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent/30">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/30 to-blue-500/30 text-xs font-bold">
                  {u.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                </div>
                <Badge variant="secondary" className="text-[9px] font-mono bg-amber-500/15 text-amber-400">{u.uid}</Badge>
                <Badge variant="secondary" className={`text-[9px] capitalize ${u.status === "ACTIVE" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                  {u.status.toLowerCase()}
                </Badge>
                <span className="text-[10px] text-muted-foreground hidden md:block">{new Date(u.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
