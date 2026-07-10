"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Clock, History, TrendingUp } from "lucide-react";
import { useAuth, apiFetch } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/market-data";

type Trade = {
  id: string;
  tradeId: string;
  symbol: string;
  direction: "UP" | "DOWN";
  amount: number;
  duration: number;
  entryPrice: number;
  exitPrice: number | null;
  result: "PENDING" | "WIN" | "LOSE";
  profit: number;
  status: "ACTIVE" | "SETTLED";
  createdAt: string;
  settledAt: string | null;
};

export function HistoryView() {
  const { user, navigate } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "WIN" | "LOSE" | "PENDING">("ALL");

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch("/api/trade/history");
        const data = await res.json();
        if (data.trades) setTrades(data.trades);
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = trades.filter((t) => filter === "ALL" || t.result === filter);
  const wins = trades.filter((t) => t.result === "WIN").length;
  const losses = trades.filter((t) => t.result === "LOSE").length;
  const totalProfit = trades.reduce((a, t) => a + t.profit, 0);

  return (
    <main className="flex-1 pt-20 pb-10 bx-fade-in">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Trade History</h1>
          <p className="text-sm text-muted-foreground mt-1">Your last 50 trades.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bx-glass rounded-xl p-4">
            <div className="text-xs text-muted-foreground">Total trades</div>
            <div className="text-2xl font-bold text-white mt-1">{trades.length}</div>
          </div>
          <div className="bx-glass rounded-xl p-4">
            <div className="text-xs text-muted-foreground">Wins</div>
            <div className="text-2xl font-bold text-[#00c853] mt-1">{wins}</div>
          </div>
          <div className="bx-glass rounded-xl p-4">
            <div className="text-xs text-muted-foreground">Losses</div>
            <div className="text-2xl font-bold text-[#ff3b30] mt-1">{losses}</div>
          </div>
          <div className="bx-glass rounded-xl p-4">
            <div className="text-xs text-muted-foreground">Net P&L</div>
            <div className={`text-2xl font-bold mt-1 ${totalProfit >= 0 ? "text-[#00c853]" : "text-[#ff3b30]"}`}>
              {totalProfit >= 0 ? "+" : ""}{totalProfit.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="bx-glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2"><History className="h-4 w-4 text-[#2196f3]" /> Trades</h3>
            <div className="flex gap-1">
              {(["ALL", "WIN", "LOSE", "PENDING"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium ${filter === f ? "bx-blue-gradient text-white" : "border border-white/10 text-muted-foreground hover:text-white"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center text-xs text-muted-foreground py-8">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No trades yet.</p>
              <Button onClick={() => navigate("trade")} className="mt-4 bx-blue-gradient bx-glow text-white border-0">Start trading</Button>
            </div>
          ) : (
            <div className="overflow-x-auto bx-scroll">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-2 py-2 font-medium">Trade</th>
                    <th className="px-2 py-2 font-medium">Symbol</th>
                    <th className="px-2 py-2 font-medium">Dir</th>
                    <th className="px-2 py-2 font-medium">Amount</th>
                    <th className="px-2 py-2 font-medium">Duration</th>
                    <th className="px-2 py-2 font-medium">Entry</th>
                    <th className="px-2 py-2 font-medium">Exit</th>
                    <th className="px-2 py-2 font-medium">Result</th>
                    <th className="px-2 py-2 font-medium">P&L</th>
                    <th className="px-2 py-2 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id} className="border-t border-white/5 hover:bg-white/5">
                      <td className="px-2 py-2 text-xs text-muted-foreground">{t.tradeId}</td>
                      <td className="px-2 py-2 text-white">{t.symbol}</td>
                      <td className="px-2 py-2">
                        <span className={`inline-flex items-center gap-1 text-xs ${t.direction === "UP" ? "text-[#00c853]" : "text-[#ff3b30]"}`}>
                          {t.direction === "UP" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                          {t.direction}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-white">{t.amount.toFixed(2)}</td>
                      <td className="px-2 py-2 text-muted-foreground">{t.duration}s</td>
                      <td className="px-2 py-2 text-muted-foreground">{formatPrice(t.entryPrice)}</td>
                      <td className="px-2 py-2 text-muted-foreground">{t.exitPrice ? formatPrice(t.exitPrice) : "—"}</td>
                      <td className="px-2 py-2">
                        <Badge variant="outline" className={t.result === "WIN" ? "border-[#00c853]/40 text-[#00c853]" : t.result === "LOSE" ? "border-[#ff3b30]/40 text-[#ff3b30]" : "border-amber-500/40 text-amber-500"}>
                          {t.result}
                        </Badge>
                      </td>
                      <td className={`px-2 py-2 ${t.profit > 0 ? "text-[#00c853]" : t.profit < 0 ? "text-[#ff3b30]" : "text-muted-foreground"}`}>
                        {t.profit >= 0 ? "+" : ""}{t.profit.toFixed(2)}
                      </td>
                      <td className="px-2 py-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(t.createdAt).toLocaleString()}</span>
                      </td>
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

export default HistoryView;
