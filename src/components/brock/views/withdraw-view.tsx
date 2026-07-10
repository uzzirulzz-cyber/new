"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpFromLine, Landmark, Bitcoin, CreditCard, Loader2, ShieldCheck, AlertTriangle } from "lucide-react";
import { useAuth, apiFetch, type AuthUser } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

export function WithdrawView() {
  const { user, setUser } = useAuth();
  const [amount, setAmount] = useState<number>(50);
  const [method, setMethod] = useState("BANK");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const submit = async () => {
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    if (amount > user.balance) {
      toast.error("Insufficient balance.");
      return;
    }
    if (!destination) {
      toast.error("Provide a destination address/account.");
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/api/wallet/withdraw", {
        method: "POST",
        body: JSON.stringify({ amount, method, reference: destination }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user as AuthUser);
        toast.success(`Withdrawal of ${amount} USDT submitted. Funds held until approved.`);
        setAmount(50);
        setDestination("");
      } else {
        toast.error(data.error || "Failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 pt-20 pb-10 bx-fade-in">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Withdraw Funds</h1>
          <p className="text-sm text-muted-foreground mt-1">Cash out your USDT balance.</p>
        </motion.div>

        <div className="bx-glass rounded-2xl p-6">
          <div className="bx-glass-soft rounded-lg p-4 mb-5 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Withdrawable balance</div>
              <div className="text-2xl font-bold text-white">{user.balance.toFixed(2)} USDT</div>
            </div>
            <ArrowUpFromLine className="h-8 w-8 text-[#ff3b30]" />
          </div>

          <Tabs value={method} onValueChange={setMethod}>
            <TabsList className="grid grid-cols-3 w-full bg-white/5">
              <TabsTrigger value="BANK" className="data-[state=active]:bx-blue-gradient data-[state=active]:text-white">
                <Landmark className="h-3.5 w-3.5 mr-1.5" /> Bank
              </TabsTrigger>
              <TabsTrigger value="CARD" className="data-[state=active]:bx-blue-gradient data-[state=active]:text-white">
                <CreditCard className="h-3.5 w-3.5 mr-1.5" /> Card
              </TabsTrigger>
              <TabsTrigger value="USDT" className="data-[state=active]:bx-blue-gradient data-[state=active]:text-white">
                <Bitcoin className="h-3.5 w-3.5 mr-1.5" /> USDT
              </TabsTrigger>
            </TabsList>

            <TabsContent value="BANK" className="mt-5 space-y-3">
              <div><Label className="text-xs">Account holder</Label><Input placeholder="John Doe" value={destination} onChange={(e) => setDestination(e.target.value)} className="bg-white/5 border-white/10" /></div>
              <div><Label className="text-xs">IBAN / Account #</Label><Input placeholder="GB29 NWBK 6016..." value={destination} onChange={(e) => setDestination(e.target.value)} className="bg-white/5 border-white/10" /></div>
            </TabsContent>
            <TabsContent value="CARD" className="mt-5 space-y-3">
              <div><Label className="text-xs">Card number</Label><Input placeholder="4242 4242 4242 4242" value={destination} onChange={(e) => setDestination(e.target.value)} className="bg-white/5 border-white/10" /></div>
            </TabsContent>
            <TabsContent value="USDT" className="mt-5 space-y-3">
              <div><Label className="text-xs">USDT TRC20 address</Label><Input placeholder="T..." value={destination} onChange={(e) => setDestination(e.target.value)} className="bg-white/5 border-white/10 font-mono text-xs" /></div>
            </TabsContent>
          </Tabs>

          <div className="mt-5 space-y-2">
            <Label className="text-xs">Amount (USDT)</Label>
            <Input type="number" min={1} max={user.balance} value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} className="bg-white/5 border-white/10 h-11" />
            <div className="flex items-center gap-2">
              <button onClick={() => setAmount(Math.floor(user.balance))} className="text-xs text-[#42a5f5] hover:underline">Max</button>
              <span className="text-xs text-muted-foreground">Available: {user.balance.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-3 bx-glass-soft rounded-lg p-3 text-xs flex gap-2">
            <AlertTriangle className="h-4 w-4 text-[#f59e0b] shrink-0 mt-0.5" />
            <div className="text-muted-foreground">
              Withdrawals are held for review and typically processed within 24 hours. Funds are deducted immediately and refunded if rejected.
            </div>
          </div>

          <Button onClick={submit} disabled={loading} className="w-full mt-5 bx-blue-gradient bx-glow text-white border-0 h-11">
            {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</span> : `Submit ${amount} USDT withdrawal`}
          </Button>

          <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5 justify-center">
            <ShieldCheck className="h-3 w-3 text-[#00c853]" /> Protected by 2FA review.
          </div>
        </div>
      </div>
    </main>
  );
}

export default WithdrawView;
