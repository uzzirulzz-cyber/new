"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fmtUsd } from "@/lib/format";

export function AdminTrades() {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (resultFilter !== "all") params.set("result", resultFilter);
    fetch(`/api/admin/trades?${params}`)
      .then(r => r.json())
      .then(d => {
        setTrades(d.trades || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (resultFilter !== "all") params.set("result", resultFilter);
    fetch(`/api/admin/trades?${params}`)
      .then(r => r.json())
      .then(d => {
        if (!cancelled) {
          setTrades(d.trades || []);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [statusFilter, resultFilter]);

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <Card className="card-gradient p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex items-center gap-1.5 rounded-lg bg-sidebar-accent/40 p-1">
            {["all", "ACTIVE", "SETTLED"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${statusFilter === s ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {s === "all" ? "All Status" : s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-sidebar-accent/40 p-1">
            {["all", "WIN", "LOSS"].map((r) => (
              <button key={r} onClick={() => setResultFilter(r)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${resultFilter === r ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {r === "all" ? "All Results" : r}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="card-gradient p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : trades.length === 0 ? (
          <p className="text-center py-12 text-sm text-muted-foreground">No trades found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sidebar-border text-[10px] text-muted-foreground uppercase">
                  <th className="text-left font-medium pl-4 py-3">Trade ID</th>
                  <th className="text-left font-medium py-3 hidden md:table-cell">User</th>
                  <th className="text-left font-medium py-3">Coin</th>
                  <th className="text-left font-medium py-3">Dir</th>
                  <th className="text-right font-medium py-3">Amount</th>
                  <th className="text-right font-medium py-3 hidden lg:table-cell">Entry</th>
                  <th className="text-right font-medium py-3 hidden lg:table-cell">Exit</th>
                  <th className="text-right font-medium py-3">P&L</th>
                  <th className="text-center font-medium py-3">Result</th>
                  <th className="text-right font-medium pr-4 py-3 hidden md:table-cell">Time</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => (
                  <tr key={t.id} className="border-b border-sidebar-border/40 hover:bg-sidebar-accent/20">
                    <td className="pl-4 py-3 font-mono text-[10px]">{t.tradeId}</td>
                    <td className="py-3 hidden md:table-cell">
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
                    <td className="text-right py-3 hidden lg:table-cell font-mono text-xs">{fmtUsd(t.entryPrice)}</td>
                    <td className="text-right py-3 hidden lg:table-cell font-mono text-xs">{t.exitPrice ? fmtUsd(t.exitPrice) : "—"}</td>
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
                    <td className="text-right pr-4 py-3 hidden md:table-cell text-[10px] text-muted-foreground">
                      {new Date(t.createdAt).toLocaleString()}
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
