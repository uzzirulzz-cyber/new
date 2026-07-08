"use client";

import { useState, useEffect } from "react";
import { Loader2, ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fmtUsd } from "@/lib/format";

export function CustomerTransactions() {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/transactions?limit=100")
      .then(r => r.json())
      .then(d => {
        setTxs(d.transactions || []);
        setLoading(false);
      });
  }, []);

  const filtered = filter === "all" ? txs : txs.filter(t => t.type === filter);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Card className="card-gradient p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">Transaction History</h3>
          <Badge variant="secondary" className="bg-sidebar-accent">{txs.length} total</Badge>
        </div>

        <div className="flex items-center gap-1 mb-4 overflow-x-auto">
          {["all", "DEPOSIT", "WITHDRAWAL", "TRANSFER", "TRADE_PROFIT", "TRADE_LOSS", "ADMIN_CREDIT"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${
                filter === f ? "bg-sidebar-accent text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "All" : f.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-center py-8 text-sm text-muted-foreground">No transactions found</p>
        ) : (
          <div className="space-y-1">
            {filtered.map((tx) => {
              const positive = ["DEPOSIT", "TRADE_PROFIT", "ADMIN_CREDIT", "REFERRAL_BONUS", "TRADE_REFUND"].includes(tx.type);
              return (
                <div key={tx.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-sidebar-accent/30">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full shrink-0 ${
                    positive ? "bg-emerald-500/15" : "bg-red-500/15"
                  }`}>
                    {tx.type === "DEPOSIT" && <ArrowDownLeft className="h-4 w-4 text-emerald-400" />}
                    {tx.type === "WITHDRAWAL" && <ArrowUpRight className="h-4 w-4 text-red-400" />}
                    {tx.type === "TRANSFER" && <ArrowLeftRight className="h-4 w-4 text-blue-400" />}
                    {tx.type.startsWith("TRADE") && <span className="text-xs">📊</span>}
                    {tx.type === "ADMIN_CREDIT" && <span className="text-xs">💰</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium capitalize">{tx.type.replace(/_/g, " ").toLowerCase()}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{tx.txId}</p>
                    {tx.note && <p className="text-[10px] text-muted-foreground truncate">{tx.note}</p>}
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-mono font-bold ${positive ? "text-emerald-400" : "text-red-400"}`}>
                      {positive ? "+" : "-"}{fmtUsd(tx.amount)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    <Badge variant="secondary" className={`text-[9px] mt-0.5 ${
                      tx.status === "SUCCESSFUL" ? "bg-emerald-500/15 text-emerald-400" :
                      tx.status === "PENDING" ? "bg-amber-500/15 text-amber-400" :
                      tx.status === "FAILED" ? "bg-red-500/15 text-red-400" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
