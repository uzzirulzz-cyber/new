"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight, ArrowLeftRight,
  TrendingUp, Snowflake, Loader2, CheckCircle2, Clock, XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { fmtUsd } from "@/lib/format";
import { toast } from "sonner";

interface WalletData {
  wallet: any;
  transactions: any[];
}

export function CustomerWallet({ mode = "wallet" }: { mode?: "wallet" | "recharge" | "withdraw" | "transfer" }) {
  const { refresh } = useAuth();
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | "TRADE_PROFIT" | "TRADE_LOSS">("all");

  // Form state for recharge/withdraw/transfer
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank");
  const [destination, setDestination] = useState("");
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/wallet").then(r => r.json()).then(d => {
      setData(d);
      setLoading(false);
    });
  }, []);

  const filteredTx = data?.transactions.filter(t => tab === "all" || t.type === tab) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const type = mode === "recharge" ? "DEPOSIT" : mode === "withdraw" ? "WITHDRAWAL" : "TRANSFER";
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, amount: Number(amount), method, destination, reference }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(mode === "recharge" ? "Deposit request submitted!" : `${mode} request submitted!`);
        setAmount(""); setDestination(""); setReference("");
        // Refresh data
        fetch("/api/wallet").then(r => r.json()).then(setData);
        refresh();
      } else {
        toast.error(result.error || "Failed");
      }
    } catch (e: any) {
      toast.error(e.message);
    }
    setSubmitting(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const w = data?.wallet;

  // ─── Recharge / Withdraw / Transfer forms ──────────────────
  if (mode !== "wallet") {
    const titles = {
      recharge: { title: "Recharge Funds", subtitle: "Add funds to your wallet", icon: ArrowDownLeft },
      withdraw: { title: "Withdraw Funds", subtitle: "Withdraw to bank or crypto wallet", icon: ArrowUpRight },
      transfer: { title: "Transfer Funds", subtitle: "Transfer to another BlockExchange user", icon: ArrowLeftRight },
    };
    const config = titles[mode as keyof typeof titles];
    const Icon = config.icon;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{config.title}</h2>
            <p className="text-sm text-muted-foreground">{config.subtitle}</p>
          </div>
        </div>

        <Card className="card-gradient p-6">
          <div className="bg-sidebar-accent/40 rounded-lg p-4 mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Available Balance</p>
              <p className="text-2xl font-bold text-amber-500">{w ? fmtUsd(w.available) : "—"}</p>
            </div>
            <WalletIcon className="h-8 w-8 text-amber-500/50" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-xs">Amount (USD)</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  placeholder="100.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8 h-11 text-lg font-mono bg-sidebar-accent/60"
                  required
                  min="10"
                />
              </div>
            </div>

            {mode === "recharge" && (
              <div>
                <Label className="text-xs">Payment Method</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {["bank", "card", "crypto"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMethod(m)}
                      className={`p-3 rounded-lg border text-xs capitalize transition-all ${
                        method === m ? "border-amber-500/50 bg-amber-500/10" : "border-sidebar-border bg-sidebar-accent/30"
                      }`}
                    >
                      {m === "bank" ? "🏦 Bank" : m === "card" ? "💳 Card" : "₿ Crypto"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(mode === "withdraw" || mode === "transfer") && (
              <>
                <div>
                  <Label className="text-xs">{mode === "withdraw" ? "Destination" : "Recipient UID"}</Label>
                  <Input
                    placeholder={mode === "withdraw" ? "Bank account or wallet address" : "BX-XXXXXXXX"}
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="h-11 bg-sidebar-accent/60 mt-1"
                    required
                  />
                </div>
                {mode === "withdraw" && (
                  <div>
                    <Label className="text-xs">Withdrawal Method</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {["bank", "crypto"].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMethod(m)}
                          className={`p-3 rounded-lg border text-xs capitalize transition-all ${
                            method === m ? "border-amber-500/50 bg-amber-500/10" : "border-sidebar-border bg-sidebar-accent/30"
                          }`}
                        >
                          {m === "bank" ? "🏦 Bank Transfer" : "₿ Crypto Wallet"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <Label className="text-xs">Reference / Note (optional)</Label>
              <Input
                placeholder="Transaction reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="h-11 bg-sidebar-accent/60 mt-1"
              />
            </div>

            {mode === "withdraw" && Number(amount) > 0 && (
              <div className="bg-sidebar-accent/40 rounded-lg p-3 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-mono">{fmtUsd(Number(amount))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fee (1%)</span>
                  <span className="font-mono">{fmtUsd(Number(amount) * 0.01)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-sidebar-border pt-1 mt-1">
                  <span>Total</span>
                  <span className="font-mono">{fmtUsd(Number(amount) * 1.01)}</span>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 btn-gold-gradient font-bold"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : `Confirm ${mode}`}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // ─── Wallet dashboard ───────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Balance cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <BalanceTile label="Total Balance" value={w?.totalAssets || 0} icon={WalletIcon} color="text-blue-400" />
        <BalanceTile label="Available" value={w?.available || 0} icon={TrendingUp} color="text-emerald-400" />
        <BalanceTile label="Frozen" value={w?.frozen || 0} icon={Snowflake} color="text-amber-400" />
        <BalanceTile label="Total Profit" value={w?.totalProfit || 0} icon={TrendingUp} color={w && w.totalProfit >= 0 ? "text-emerald-400" : "text-red-400"} />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        <Button className="h-12 btn-gold-gradient font-semibold">
          <ArrowDownLeft className="mr-2 h-4 w-4" /> Recharge
        </Button>
        <Button variant="outline" className="h-12 font-semibold">
          <ArrowUpRight className="mr-2 h-4 w-4" /> Withdraw
        </Button>
        <Button variant="outline" className="h-12 font-semibold">
          <ArrowLeftRight className="mr-2 h-4 w-4" /> Transfer
        </Button>
      </div>

      {/* Transaction history */}
      <Card className="card-gradient p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">Transaction History</h3>
          <Badge variant="secondary" className="bg-sidebar-accent">{data?.transactions.length || 0} transactions</Badge>
        </div>

        <div className="flex items-center gap-1 mb-4 overflow-x-auto">
          {["all", "DEPOSIT", "WITHDRAWAL", "TRANSFER", "TRADE_PROFIT", "TRADE_LOSS"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
              className={`px-3 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${
                tab === t ? "bg-sidebar-accent text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "all" ? "All" : t.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="space-y-1 max-h-96 overflow-y-auto">
          {filteredTx.length === 0 ? (
            <p className="text-center py-8 text-sm text-muted-foreground">No transactions found</p>
          ) : (
            filteredTx.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-sidebar-accent/30">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full shrink-0 ${getTypeBg(tx.type)}`}>
                  {getTypeIcon(tx.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium capitalize">{tx.type.replace(/_/g, " ").toLowerCase()}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{tx.txId}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-mono font-bold ${isPositive(tx.type) ? "text-emerald-400" : "text-red-400"}`}>
                    {isPositive(tx.type) ? "+" : "-"}{fmtUsd(tx.amount)}
                  </p>
                  <StatusBadge status={tx.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

function BalanceTile({ label, value, icon: Icon, color }: any) {
  return (
    <Card className="card-gradient p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-1 text-xl font-bold">{fmtUsd(value)}</p>
        </div>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; icon: any }> = {
    PENDING: { color: "text-amber-400", icon: Clock },
    SUCCESSFUL: { color: "text-emerald-400", icon: CheckCircle2 },
    FAILED: { color: "text-red-400", icon: XCircle },
    CANCELLED: { color: "text-muted-foreground", icon: XCircle },
    HELD: { color: "text-amber-400", icon: Clock },
  };
  const config = map[status] || map.PENDING;
  const Icon = config.icon;
  return (
    <span className={`flex items-center gap-0.5 text-[10px] ${config.color}`}>
      <Icon className="h-2.5 w-2.5" />
      {status}
    </span>
  );
}

function getTypeBg(type: string) {
  if (type.startsWith("TRADE_PROFIT") || type === "DEPOSIT" || type === "ADMIN_CREDIT" || type === "REFERRAL_BONUS") return "bg-emerald-500/15";
  if (type.startsWith("TRADE_LOSS") || type === "WITHDRAWAL") return "bg-red-500/15";
  return "bg-blue-500/15";
}

function getTypeIcon(type: string) {
  if (type.startsWith("TRADE")) return <span className="text-xs">📊</span>;
  if (type === "DEPOSIT") return <ArrowDownLeft className="h-4 w-4 text-emerald-400" />;
  if (type === "WITHDRAWAL") return <ArrowUpRight className="h-4 w-4 text-red-400" />;
  if (type === "TRANSFER") return <ArrowLeftRight className="h-4 w-4 text-blue-400" />;
  return <WalletIcon className="h-4 w-4 text-blue-400" />;
}

function isPositive(type: string) {
  return type === "DEPOSIT" || type === "TRADE_PROFIT" || type === "ADMIN_CREDIT" || type === "REFERRAL_BONUS" || type === "TRADE_REFUND";
}
