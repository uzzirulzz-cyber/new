"use client";

import { motion } from "framer-motion";
import { Coins, ArrowRight } from "lucide-react";
import { COINS, formatPrice } from "@/lib/market-data";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AssetsView() {
  const { user, navigate } = useAuth();
  const portfolio = COINS.slice(0, 5).map((c) => ({
    coin: c,
    amount: (user?.balance || 0) / c.basePrice * 0.1,
    value: (user?.balance || 0) * 0.1,
  }));
  const totalValue = portfolio.reduce((a, p) => a + p.value, 0);

  return (
    <main className="flex-1 pt-20 pb-10 bx-fade-in">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">My Assets</h1>
          <p className="text-sm text-muted-foreground mt-1">Your crypto portfolio overview.</p>
        </motion.div>

        <div className="bx-glass rounded-2xl p-6 mb-6">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Total portfolio value</div>
          <div className="mt-2 text-3xl font-bold text-white">${totalValue.toFixed(2)} <span className="text-sm text-muted-foreground">USDT</span></div>
          <div className="mt-1 text-xs text-[#00c853]">+12.4% (24h)</div>
        </div>

        <div className="bx-glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Coins className="h-4 w-4 text-[#2196f3]" /> Holdings</h3>
          <div className="overflow-x-auto bx-scroll">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-2 py-2 font-medium">Asset</th>
                  <th className="px-2 py-2 font-medium">Price</th>
                  <th className="px-2 py-2 font-medium">Holdings</th>
                  <th className="px-2 py-2 font-medium">Value</th>
                  <th className="px-2 py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map((p) => (
                  <tr key={p.coin.symbol} className="border-t border-white/5">
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${p.coin.color}22`, color: p.coin.color }}>{p.coin.icon}</div>
                        <div>
                          <div className="text-white font-medium">{p.coin.symbol}</div>
                          <div className="text-[10px] text-muted-foreground">{p.coin.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-white">{formatPrice(p.coin.basePrice)}</td>
                    <td className="px-2 py-3 text-muted-foreground">{p.amount.toFixed(6)}</td>
                    <td className="px-2 py-3 text-white">{p.value.toFixed(2)} USDT</td>
                    <td className="px-2 py-3">
                      <Button size="sm" variant="outline" onClick={() => navigate("trade")} className="h-7 text-xs border-white/10">
                        Trade <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-3 bx-glass-soft rounded-lg text-xs text-muted-foreground">
            <Badge variant="outline" className="border-[#f59e0b]/40 text-[#f59e0b] mb-1">Demo portfolio</Badge>
            <div className="mt-1">Asset balances shown are simulated for the demo. Your USDT balance is the source of truth — visit the Wallet page.</div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AssetsView;
