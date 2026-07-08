"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Trophy, Target, BarChart3,
  PieChart as PieIcon, Download, Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { fmtUsd, fmtNum } from "@/lib/format";

interface AnalyticsData {
  trades: any[];
  stats: {
    totalTrades: number;
    wins: number;
    losses: number;
    winRate: number;
    lossRate: number;
    totalProfit: number;
    avgReturn: number;
  };
}

export function CustomerAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trades?limit=200")
      .then(r => r.json())
      .then(d => {
        const trades = d.trades || [];
        const settled = trades.filter((t: any) => t.status === "SETTLED");
        const wins = settled.filter((t: any) => t.result === "WIN");
        const losses = settled.filter((t: any) => t.result === "LOSS");
        const totalProfit = settled.reduce((s: number, t: any) => s + t.profit, 0);
        setData({
          trades,
          stats: {
            totalTrades: settled.length,
            wins: wins.length,
            losses: losses.length,
            winRate: settled.length ? (wins.length / settled.length) * 100 : 0,
            lossRate: settled.length ? (losses.length / settled.length) * 100 : 0,
            totalProfit,
            avgReturn: settled.length ? totalProfit / settled.length : 0,
          },
        });
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!data || data.stats.totalTrades === 0) {
    return (
      <div className="max-w-5xl mx-auto">
        <Card className="card-gradient p-12 text-center">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-bold mb-2">No Trading Data Yet</h3>
          <p className="text-sm text-muted-foreground">Place your first trade to see analytics here.</p>
        </Card>
      </div>
    );
  }

  // Daily P&L chart data
  const dailyPnl = groupByDay(data.trades);
  // Asset allocation by coin
  const byCoin = groupByCoin(data.trades);

  const COLORS = ["#2563eb", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Trades" value={String(data.stats.totalTrades)} icon={BarChart3} color="text-blue-400" />
        <StatCard label="Win Rate" value={`${data.stats.winRate.toFixed(1)}%`} icon={Trophy} color="text-emerald-400" sub={`${data.stats.wins} wins`} />
        <StatCard label="Loss Rate" value={`${data.stats.lossRate.toFixed(1)}%`} icon={Target} color="text-red-400" sub={`${data.stats.losses} losses`} />
        <StatCard label="Total P&L" value={fmtUsd(data.stats.totalProfit)} icon={data.stats.totalProfit >= 0 ? TrendingUp : TrendingDown} color={data.stats.totalProfit >= 0 ? "text-emerald-400" : "text-red-400"} />
      </div>

      {/* Daily P&L chart */}
      <Card className="card-gradient p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold">Daily Profit & Loss</h3>
            <p className="text-xs text-muted-foreground">Your trading performance over time</p>
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => exportCsv(data.trades)}>
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export
          </Button>
        </div>
        <div className="h-64 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyPnl}>
              <defs>
                <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.45)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.45)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} width={50} />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "0.5rem", fontSize: 12 }}
                formatter={(v: number) => [fmtUsd(v), "P&L"]}
              />
              <Area type="monotone" dataKey="pnl" stroke="#2563eb" strokeWidth={2} fill="url(#pnlGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Win vs Loss bar */}
        <Card className="card-gradient p-5">
          <h3 className="font-bold mb-1">Win vs Loss Distribution</h3>
          <p className="text-xs text-muted-foreground mb-4">Trade outcomes breakdown</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: "Wins", value: data.stats.wins, fill: "#10b981" },
                { name: "Losses", value: data.stats.losses, fill: "#ef4444" },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "rgba(255,255,255,0.6)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.45)" }} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "0.5rem", fontSize: 12 }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Portfolio allocation by coin */}
        <Card className="card-gradient p-5">
          <h3 className="font-bold mb-1">Portfolio Allocation</h3>
          <p className="text-xs text-muted-foreground mb-4">Trading volume by coin</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byCoin} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={2} stroke="none">
                  {byCoin.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "0.5rem", fontSize: 12 }} formatter={(v: number) => [fmtUsd(v), "Volume"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {byCoin.map((c, i) => (
              <div key={c.name} className="flex items-center gap-1.5 text-[10px]">
                <span className="h-2 w-2 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-muted-foreground">{c.name}</span>
                <span className="ml-auto font-mono">{fmtUsd(c.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Trade history table */}
      <Card className="card-gradient p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Trade History</h3>
          <Badge variant="secondary" className="bg-sidebar-accent">{data.trades.length} trades</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-sidebar-border text-muted-foreground">
                <th className="text-left font-medium py-2">Trade ID</th>
                <th className="text-left font-medium py-2 hidden sm:table-cell">Coin</th>
                <th className="text-left font-medium py-2">Direction</th>
                <th className="text-right font-medium py-2">Amount</th>
                <th className="text-right font-medium py-2 hidden md:table-cell">Profit</th>
                <th className="text-center font-medium py-2">Result</th>
                <th className="text-right font-medium py-2 hidden lg:table-cell">Time</th>
              </tr>
            </thead>
            <tbody>
              {data.trades.slice(0, 20).map((t: any) => (
                <tr key={t.id} className="border-b border-sidebar-border/40">
                  <td className="py-2 font-mono text-[10px]">{t.tradeId}</td>
                  <td className="py-2 hidden sm:table-cell font-medium">{t.coin}</td>
                  <td className="py-2">
                    <span className={t.direction === "UP" ? "text-emerald-400" : "text-red-400"}>
                      {t.direction === "UP" ? "↑ Up" : "↓ Down"}
                    </span>
                  </td>
                  <td className="text-right py-2 font-mono">{fmtUsd(t.amount)}</td>
                  <td className="text-right py-2 hidden md:table-cell font-mono">
                    <span className={t.profit >= 0 ? "text-emerald-400" : "text-red-400"}>
                      {t.profit >= 0 ? "+" : ""}{fmtUsd(t.profit)}
                    </span>
                  </td>
                  <td className="text-center py-2">
                    {t.status === "ACTIVE" ? (
                      <Badge variant="secondary" className="bg-amber-500/15 text-amber-400 text-[9px]">Active</Badge>
                    ) : t.result === "WIN" ? (
                      <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-400 text-[9px]">Win</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-red-500/15 text-red-400 text-[9px]">Loss</Badge>
                    )}
                  </td>
                  <td className="text-right py-2 hidden lg:table-cell text-[10px] text-muted-foreground">
                    {new Date(t.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, sub }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="card-gradient p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className={`mt-1 text-xl font-bold ${color}`}>{value}</p>
            {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </Card>
    </motion.div>
  );
}

function groupByDay(trades: any[]) {
  const days: Record<string, number> = {};
  trades.filter(t => t.status === "SETTLED").forEach(t => {
    const day = new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    days[day] = (days[day] || 0) + t.profit;
  });
  return Object.entries(days).map(([date, pnl]) => ({ date, pnl }));
}

function groupByCoin(trades: any[]) {
  const coins: Record<string, number> = {};
  trades.forEach(t => {
    coins[t.coin] = (coins[t.coin] || 0) + t.amount;
  });
  return Object.entries(coins).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
}

function exportCsv(trades: any[]) {
  const headers = ["Trade ID", "Coin", "Direction", "Amount", "Duration", "Entry Price", "Exit Price", "Result", "Profit", "Status", "Created At"];
  const rows = trades.map(t => [t.tradeId, t.coin, t.direction, t.amount, t.duration, t.entryPrice, t.exitPrice || "", t.result || "", t.profit, t.status, new Date(t.createdAt).toISOString()]);
  const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `blockexchange-trades-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
