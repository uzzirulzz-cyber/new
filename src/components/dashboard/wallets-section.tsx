"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Snowflake,
  Flame,
  Vault,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";
import { wallets, volumeHistory } from "@/lib/dashboard-data";
import { fmtUsd, fmtCompact } from "@/lib/format";

const TYPE_META = {
  cold: { icon: Snowflake, label: "Cold Storage", color: "text-sky-400", bg: "bg-sky-500/10" },
  hot: { icon: Flame, label: "Hot Wallet", color: "text-amber-400", bg: "bg-amber-500/10" },
  reserve: { icon: Vault, label: "Reserve", color: "text-emerald-400", bg: "bg-emerald-500/10" },
};

export function WalletsSection() {
  const totals = useMemo(() => {
    const totalUsd = wallets.reduce((s, w) => s + w.usdValue, 0);
    const coldUsd = wallets.reduce((s, w) => s + (w.cold / w.balance) * w.usdValue, 0);
    const hotUsd = wallets.reduce((s, w) => s + (w.hot / w.balance) * w.usdValue, 0);
    return {
      totalUsd,
      coldUsd,
      hotUsd,
      coldPct: (coldUsd / totalUsd) * 100,
      hotPct: (hotUsd / totalUsd) * 100,
    };
  }, []);

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-gradient p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Custody AUM</p>
              <p className="mt-1 text-2xl font-semibold">{fmtUsd(totals.totalUsd, { compact: true })}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Across {wallets.length} asset wallets
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="h-12 mt-3 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeHistory}>
                <defs>
                  <linearGradient id="walletGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis hide domain={["dataMin - 50", "dataMax + 50"]} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.21 0.018 165)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "0.5rem",
                    fontSize: 11,
                  }}
                  formatter={(v: number) => [`$${v}M`, "Volume"]}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#10b981"
                  strokeWidth={1.5}
                  fill="url(#walletGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="card-gradient p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Cold Storage</p>
              <p className="mt-1 text-2xl font-semibold">{fmtUsd(totals.coldUsd, { compact: true })}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {totals.coldPct.toFixed(1)}% of total assets
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400">
              <Snowflake className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Distribution</span>
              <span className="font-medium">Cold vs Hot</span>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${totals.coldPct}%` }}
                transition={{ duration: 0.6 }}
                className="bg-sky-400"
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${totals.hotPct}%` }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-amber-400"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm bg-sky-400" />
                Cold {totals.coldPct.toFixed(1)}%
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm bg-amber-400" />
                Hot {totals.hotPct.toFixed(1)}%
              </span>
            </div>
          </div>
        </Card>

        <Card className="card-gradient p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Hot Wallets</p>
              <p className="mt-1 text-2xl font-semibold">{fmtUsd(totals.hotUsd, { compact: true })}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {totals.hotPct.toFixed(1)}% · operational float
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
              <Flame className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-muted/40 p-2.5">
              <p className="text-[10px] text-muted-foreground">Avg. daily outflow</p>
              <p className="text-sm font-medium">$8.4M</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-2.5">
              <p className="text-[10px] text-muted-foreground">Rebalance threshold</p>
              <p className="text-sm font-medium">$2M min</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Wallet table */}
      <Card className="card-gradient p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="text-base font-semibold">Asset Wallets</h3>
            <p className="text-xs text-muted-foreground">Per-asset balances and rebalancing status</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8">
              <ArrowDownLeft className="h-3.5 w-3.5 mr-1.5" />
              Deposit
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              <ArrowUpRight className="h-3.5 w-3.5 mr-1.5" />
              Withdraw
            </Button>
            <Button size="sm" className="h-8 bg-emerald-500 hover:bg-emerald-600 text-emerald-950">
              <Shield className="h-3.5 w-3.5 mr-1.5" />
              Rebalance
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="text-left font-medium pl-4 py-3">Asset</th>
                <th className="text-right font-medium py-3">Balance</th>
                <th className="text-right font-medium py-3">USD Value</th>
                <th className="text-right font-medium py-3 hidden md:table-cell">Cold</th>
                <th className="text-right font-medium py-3 hidden md:table-cell">Hot</th>
                <th className="text-right font-medium py-3 hidden sm:table-cell">24h</th>
                <th className="text-center font-medium py-3">Type</th>
                <th className="text-right font-medium pr-4 py-3 hidden lg:table-cell">Allocation</th>
              </tr>
            </thead>
            <tbody>
              {wallets.map((w) => {
                const typeMeta = TYPE_META[w.type];
                const TypeIcon = typeMeta.icon;
                const up = w.change24h >= 0;
                const coldPct = (w.cold / w.balance) * 100;
                return (
                  <tr key={w.asset} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                    <td className="pl-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-full text-base font-bold shrink-0"
                          style={{ background: `${w.iconColor}20`, color: w.iconColor }}
                        >
                          {w.icon}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{w.asset}</div>
                          <div className="text-[10px] text-muted-foreground">{typeMeta.label}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-right py-3 font-mono text-sm">
                      {fmtCompact(w.balance)} <span className="text-muted-foreground text-xs">{w.asset}</span>
                    </td>
                    <td className="text-right py-3 font-mono text-sm font-medium">
                      {fmtUsd(w.usdValue, { compact: true })}
                    </td>
                    <td className="text-right py-3 hidden md:table-cell font-mono text-sm text-muted-foreground">
                      {fmtCompact(w.cold)}
                    </td>
                    <td className="text-right py-3 hidden md:table-cell font-mono text-sm text-muted-foreground">
                      {fmtCompact(w.hot)}
                    </td>
                    <td className="text-right py-3 hidden sm:table-cell">
                      <span
                        className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                          up ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {up ? "+" : ""}
                        {w.change24h.toFixed(2)}%
                      </span>
                    </td>
                    <td className="text-center py-3">
                      <Badge
                        variant="secondary"
                        className={`gap-1 ${typeMeta.bg} ${typeMeta.color} hover:opacity-80`}
                      >
                        <TypeIcon className="h-3 w-3" />
                        <span className="capitalize">{w.type}</span>
                      </Badge>
                    </td>
                    <td className="pr-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-2 justify-end min-w-[120px]">
                        <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-sky-400"
                            style={{ width: `${coldPct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono w-8">
                          {coldPct.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Security note */}
      <Card className="card-gradient p-5 border-emerald-500/20">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold">Custody Security</h4>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Cold storage is secured with multi-signature (3-of-5) hardware wallets stored across
              three geographically separated vaults. Hot wallets are rate-limited to $2M per hour in
              outbound transfers and require dual approval for any single transaction above $250K.
              All withdrawals pass through Chainalysis AML screening before settlement.
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400">
                Multi-sig: 3-of-5
              </Badge>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400">
                HSM-backed
              </Badge>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400">
                SOC 2 Type II
              </Badge>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400">
                Proof-of-Reserves: Daily
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
