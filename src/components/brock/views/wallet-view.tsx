"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wallet as WalletIcon, ArrowDownToLine, ArrowUpFromLine, TrendingUp, TrendingDown, History, Plus, Minus, Snowflake } from "lucide-react";
import { useAuth, apiFetch } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, COINS } from "@/lib/market-data";
import { toast } from "sonner";

type Txn = {
  id: string;
  txId: string;
  type: string;
  amount: number;
  status: string;
  method: string | null;
  reference: string | null;
  createdAt: string;
  processedAt: string | null;
};

export function WalletView() {
  const { user, navigate } = useAuth();
  const [transactions, setTransactions] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // We don't have a dedicated transactions endpoint, but trade history gives us trade context.
        // For wallet view we use trade/history as proxy; in real app there'd be /api/transactions.
        const res = await apiFetch("/api/trade/history");
        const data = await res.json();
        if (data.trades) {
          // Map trades to pseudo-transactions for display
          const mapped: Txn[] = data.trades.map((t: any) => ({
            id: t.id,
            txId: t.tradeId,
            type: t.result === "WIN" ? "TRADE_PROFIT" : t.result === "LOSE" ? "TRADE_LOSE" : "TRADE_PENDING",
            amount: t.profit || 0,
            status: t.status === "SETTLED" ? "APPROVED" : "PENDING",
            method: "TRADE",
            reference: t.symbol,
            createdAt: t.createdAt,
            processedAt: t.settledAt,
          }));
          setTransactions(mapped);
        }
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, []);

  if (!user) return null;

  const profit = transactions.filter((t) => t.type === "TRADE_PROFIT").reduce((a, t) => a + t.amount, 0);
  const loss = transactions.filter((t) => t.type === "TRADE_LOSE").reduce((a, t) => a + Math.abs(t.amount), 0);

  return (
    <main className="flex-1 pt-20 pb-10 bx-fade-in">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">My Wallet</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your balance, deposits, and withdrawals.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bx-glass rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 bx-grid-bg opacity-30" />
            <div className="relative">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Available balance</div>
              <div className="mt-2 text-4xl font-bold text-white">{user.balance.toFixed(2)} <span className="text-lg text-muted-foreground">USDT</span></div>
              <div className="mt-1 text-xs text-muted-foreground">UID: {user.uid}</div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button onClick={() => navigate("deposit")} className="bx-blue-gradient bx-glow text-white border-0 h-10">
                  <ArrowDownToLine className="h-4 w-4 mr-1.5" /> Deposit
                </Button>
                <Button onClick={() => navigate("withdraw")} variant="outline" className="border-white/10 h-10">
                  <ArrowUpFromLine className="h-4 w-4 mr-1.5" /> Withdraw
                </Button>
                <Button onClick={() => navigate("trade")} variant="outline" className="border-white/10 h-10">
                  <TrendingUp className="h-4 w-4 mr-1.5" /> Trade
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bx-glass rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">Total profit</div>
                <TrendingUp className="h-4 w-4 text-[#00c853]" />
              </div>
              <div className="mt-1 text-xl font-bold text-[#00c853]">+{profit.toFixed(2)}</div>
            </div>
            <div className="bx-glass rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">Total loss</div>
                <TrendingDown className="h-4 w-4 text-[#ff3b30]" />
              </div>
              <div className="mt-1 text-xl font-bold text-[#ff3b30]">-{loss.toFixed(2)}</div>
            </div>
            <div className="bx-glass rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">VIP level</div>
                <Badge variant="outline" className="border-[#f59e0b]/40 text-[#f59e0b]">Lv {user.vipLevel}</Badge>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Trade more to level up.</div>
            </div>
          </div>
        </div>

        <div className="bx-glass rounded-2xl p-5 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2"><History className="h-4 w-4 text-[#2196f3]" /> Recent transactions</h3>
            <Button onClick={() => navigate("history")} variant="ghost" size="sm" className="text-xs text-muted-foreground">View all</Button>
          </div>
          {loading ? (
            <div className="text-center text-xs text-muted-foreground py-8">Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center text-xs text-muted-foreground py-8">No transactions yet.</div>
          ) : (
            <div className="space-y-1.5 max-h-96 overflow-y-auto bx-scroll">
              {transactions.slice(0, 20).map((t) => {
                const isProfit = t.type === "TRADE_PROFIT";
                const isLoss = t.type === "TRADE_LOSE";
                return (
                  <div key={t.id} className="flex items-center justify-between text-sm border border-white/5 rounded-md p-3">
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isProfit ? "bg-[#00c853]/15 text-[#00c853]" : isLoss ? "bg-[#ff3b30]/15 text-[#ff3b30]" : "bg-white/5 text-muted-foreground"}`}>
                        {isProfit ? <Plus className="h-4 w-4" /> : isLoss ? <Minus className="h-4 w-4" /> : <Snowflake className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{t.type.replace(/_/g, " ")}</div>
                        <div className="text-[10px] text-muted-foreground">{new Date(t.createdAt).toLocaleString()} • {t.reference}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${isProfit ? "text-[#00c853]" : isLoss ? "text-[#ff3b30]" : "text-white"}`}>
                        {isProfit ? "+" : isLoss ? "-" : ""}{Math.abs(t.amount).toFixed(2)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{t.status}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default WalletView;
