"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownToLine, Bitcoin, CreditCard, Landmark, Loader2, ShieldCheck } from "lucide-react";
import { useAuth, apiFetch } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

export function DepositView() {
  const { user, setUser } = useAuth();
  const [amount, setAmount] = useState<number>(100);
  const [method, setMethod] = useState("BANK");
  const [loading, setLoading] = useState(false);
  const [usdtAddress] = useState("TJZqYp7n3KsRbQ9XwL2vF8mH4cA6dE1g");

  if (!user) return null;

  const submit = async () => {
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/api/wallet/deposit", {
        method: "POST",
        body: JSON.stringify({ amount, method, reference: method === "USDT" ? usdtAddress : null }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Deposit request for ${amount} USDT submitted. Awaiting confirmation.`);
        setAmount(100);
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
          <h1 className="text-2xl md:text-3xl font-bold text-white">Deposit Funds</h1>
          <p className="text-sm text-muted-foreground mt-1">Add USDT to your trading balance.</p>
        </motion.div>

        <div className="bx-glass rounded-2xl p-6">
          <div className="bx-glass-soft rounded-lg p-4 mb-5 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Current balance</div>
              <div className="text-2xl font-bold text-white">{user.balance.toFixed(2)} USDT</div>
            </div>
            <ArrowDownToLine className="h-8 w-8 text-[#00c853]" />
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

            <TabsContent value="BANK" className="mt-5">
              <div className="bx-glass-soft rounded-lg p-4 text-sm space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Bank</span><span className="text-white">Brock Bank International</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Account name</span><span className="text-white">Brock Exchange Ltd</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Account #</span><span className="text-white font-mono">0023-8841-2299</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">SWIFT</span><span className="text-white font-mono">BRCKUS33</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Reference</span><span className="text-white font-mono">{user.uid}</span></div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">Use your UID as the transfer reference. Deposits typically credit within 1-2 hours.</p>
            </TabsContent>

            <TabsContent value="CARD" className="mt-5">
              <div className="space-y-3">
                <div><Label className="text-xs">Card number</Label><Input placeholder="4242 4242 4242 4242" className="bg-white/5 border-white/10" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Expiry</Label><Input placeholder="MM/YY" className="bg-white/5 border-white/10" /></div>
                  <div><Label className="text-xs">CVC</Label><Input placeholder="123" className="bg-white/5 border-white/10" /></div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="USDT" className="mt-5">
              <div className="bx-glass-soft rounded-lg p-4">
                <Label className="text-xs">Send USDT (TRC20) to:</Label>
                <div className="mt-2 flex items-center gap-2">
                  <Input readOnly value={usdtAddress} className="bg-white/5 border-white/10 font-mono text-xs" />
                  <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(usdtAddress); toast.success("Address copied"); }} className="border-white/10">Copy</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Only send USDT on the TRC20 network. Sending other tokens will result in permanent loss.</p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-5 space-y-2">
            <Label className="text-xs">Amount (USDT)</Label>
            <Input type="number" min={1} value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} className="bg-white/5 border-white/10 h-11" />
            <div className="grid grid-cols-6 gap-1.5">
              {[50, 100, 250, 500, 1000, 5000].map((a) => (
                <button key={a} onClick={() => setAmount(a)} className={`h-7 rounded text-[10px] border ${amount === a ? "border-[#2196f3] text-white bg-[#2196f3]/15" : "border-white/10 text-muted-foreground hover:text-white"}`}>{a}</button>
              ))}
            </div>
          </div>

          <Button onClick={submit} disabled={loading} className="w-full mt-5 bx-blue-gradient bx-glow text-white border-0 h-11">
            {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</span> : `Submit ${amount} USDT deposit`}
          </Button>

          <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5 justify-center">
            <ShieldCheck className="h-3 w-3 text-[#00c853]" /> Deposits reviewed within 1 hour.
          </div>
        </div>
      </div>
    </main>
  );
}

export default DepositView;
