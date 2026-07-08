"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  AlertTriangle,
  AlertCircle,
  Info,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  kpis,
  volumeHistory,
  assetAllocation,
  hourlyActivity,
  geoDistribution,
  alerts,
  marketPairs,
  type Alert,
} from "@/lib/dashboard-data";
import { fmtUsd, fmtCompact, fmtNum } from "@/lib/format";
import type { SectionKey } from "@/app/page";

const ALERT_STYLES: Record<Alert["level"], { icon: typeof Info; color: string; bg: string }> = {
  info: { icon: Info, color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/20" },
  warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  critical: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
};

export function OverviewSection({ onNavigate }: { onNavigate: (k: SectionKey) => void }) {
  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <KpiCard key={kpi.label} kpi={kpi} delay={i * 0.05} />
        ))}
      </div>

      {/* Main charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="card-gradient xl:col-span-2 p-5 lg:p-6">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="text-base font-semibold">Trading Volume</h3>
              <p className="text-xs text-muted-foreground">Last 30 days · USD</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15">
                24h +12.4%
              </Badge>
            </div>
          </div>
          <div className="h-72 -ml-2 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeHistory} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "rgba(255,255,255,0.45)" }}
                  axisLine={false}
                  tickLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "rgba(255,255,255,0.45)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}M`}
                  width={48}
                />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.21 0.018 165)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "0.5rem",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                  formatter={(v: number) => [`$${v}M`, "Volume"]}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#volGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="card-gradient p-5 lg:p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-base font-semibold">Asset Allocation</h3>
              <p className="text-xs text-muted-foreground">By USD value · custody</p>
            </div>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetAllocation}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={42}
                  outerRadius={68}
                  paddingAngle={2}
                  stroke="none"
                >
                  {assetAllocation.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.21 0.018 165)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "0.5rem",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`${v}%`, "Share"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {assetAllocation.map((a) => (
              <div key={a.name} className="flex items-center gap-2 text-xs">
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ background: a.color }}
                />
                <span className="text-muted-foreground">{a.name}</span>
                <span className="ml-auto font-medium">{a.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Activity + alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="card-gradient xl:col-span-2 p-5 lg:p-6">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="text-base font-semibold">Hourly Trade Activity</h3>
              <p className="text-xs text-muted-foreground">Trades executed per hour · last 24h</p>
            </div>
          </div>
          <div className="h-60 -ml-2 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyActivity} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 10, fill: "rgba(255,255,255,0.45)" }}
                  axisLine={false}
                  tickLine={false}
                  interval={3}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "rgba(255,255,255,0.45)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => fmtCompact(v)}
                  width={42}
                />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.21 0.018 165)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "0.5rem",
                    fontSize: 12,
                  }}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  formatter={(v: number) => [fmtNum(v, 0), "Trades"]}
                />
                <Bar dataKey="trades" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="card-gradient p-5 lg:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-semibold">Alerts</h3>
              <p className="text-xs text-muted-foreground">Risk & compliance feed</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onNavigate("transactions")}
            >
              View all
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {alerts.map((a) => {
              const style = ALERT_STYLES[a.level];
              const Icon = style.icon;
              return (
                <div
                  key={a.id}
                  className={`rounded-lg border p-3 ${style.bg}`}
                >
                  <div className="flex items-start gap-2.5">
                    <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${style.color}`} />
                    <div className="min-w-0">
                      <p className="text-xs leading-relaxed">{a.message}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                        <span className="font-mono">{a.id}</span>
                        <span>·</span>
                        <span>{a.source}</span>
                        <span>·</span>
                        <span>{a.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Top markets + geo */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="card-gradient xl:col-span-2 p-5 lg:p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-semibold">Top Markets</h3>
              <p className="text-xs text-muted-foreground">By 24h volume</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onNavigate("markets")}
            >
              All markets
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-1">
            {marketPairs.slice(0, 5).map((m) => (
              <div
                key={m.pair}
                className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/40 transition-colors"
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shrink-0"
                  style={{ background: `${m.iconColor}20`, color: m.iconColor }}
                >
                  {m.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{m.pair}</p>
                  <p className="text-[10px] text-muted-foreground">Vol {fmtCompact(m.volume24h)} {m.base}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono">{fmtUsd(m.lastPrice)}</p>
                  <p
                    className={`text-[10px] font-medium ${
                      m.change24h >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {m.change24h >= 0 ? "+" : ""}
                    {m.change24h.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="card-gradient p-5 lg:p-6">
          <div className="mb-3">
            <h3 className="text-base font-semibold">Users by Region</h3>
            <p className="text-xs text-muted-foreground">Geographical distribution</p>
          </div>
          <div className="space-y-3">
            {geoDistribution.map((g) => (
              <div key={g.region}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{g.region}</span>
                  <span className="font-medium">
                    {fmtNum(g.users, 0)} · {g.share}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${g.share}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full bg-emerald-400"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  kpi,
  delay,
}: {
  kpi: (typeof kpis)[number];
  delay: number;
}) {
  const up = kpi.trend === "up";
  const TrendIcon = up ? TrendingUp : TrendingDown;
  // build sparkline path
  const max = Math.max(...kpi.spark);
  const min = Math.min(...kpi.spark);
  const range = max - min || 1;
  const w = 96;
  const h = 28;
  const pts = kpi.spark
    .map((v, i) => {
      const x = (i / (kpi.spark.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Card className="card-gradient p-5 h-full relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{kpi.value}</p>
          </div>
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
              up
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-red-500/15 text-red-400"
            }`}
          >
            <TrendIcon className="h-3 w-3" />
            {kpi.delta}
          </span>
        </div>
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="mt-3 w-full h-7"
          preserveAspectRatio="none"
        >
          <polyline
            points={pts}
            fill="none"
            stroke={up ? "#10b981" : "#ef4444"}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Card>
    </motion.div>
  );
}
