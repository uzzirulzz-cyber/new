"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle, XCircle, Eye, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { fmtUsd } from "@/lib/format";
import { toast } from "sonner";

export function AdminPayments() {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewTx, setViewTx] = useState<any | null>(null);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (typeFilter !== "all") params.set("type", typeFilter);
    fetch(`/api/admin/payments?${params}`)
      .then(r => r.json())
      .then(d => {
        setTxs(d.transactions || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (typeFilter !== "all") params.set("type", typeFilter);
    fetch(`/api/admin/payments?${params}`)
      .then(r => r.json())
      .then(d => {
        if (!cancelled) {
          setTxs(d.transactions || []);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [statusFilter, typeFilter]);

  const handleAction = async (tx: any, action: string) => {
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, transactionId: tx.id }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Transaction ${action.toLowerCase().replace("_", " ")}`);
        load();
      } else {
        toast.error(data.error || "Failed");
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Filters */}
      <Card className="card-gradient p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex items-center gap-1.5 rounded-lg bg-sidebar-accent/40 p-1">
            {["PENDING", "SUCCESSFUL", "FAILED", "ALL"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${statusFilter === s ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-sidebar-accent/40 p-1">
            {["all", "DEPOSIT", "WITHDRAWAL"].map((t) => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${typeFilter === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {t === "all" ? "All Types" : t}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="card-gradient p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : txs.length === 0 ? (
          <p className="text-center py-12 text-sm text-muted-foreground">No transactions found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sidebar-border text-[10px] text-muted-foreground uppercase">
                  <th className="text-left font-medium pl-4 py-3">Transaction</th>
                  <th className="text-left font-medium py-3 hidden md:table-cell">User</th>
                  <th className="text-left font-medium py-3">Type</th>
                  <th className="text-right font-medium py-3">Amount</th>
                  <th className="text-center font-medium py-3 hidden sm:table-cell">Method</th>
                  <th className="text-center font-medium py-3">Status</th>
                  <th className="text-right font-medium pr-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((tx) => (
                  <tr key={tx.id} className="border-b border-sidebar-border/40 hover:bg-sidebar-accent/20">
                    <td className="pl-4 py-3">
                      <p className="text-xs font-mono font-medium">{tx.txId}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(tx.createdAt).toLocaleString()}</p>
                    </td>
                    <td className="py-3 hidden md:table-cell">
                      <p className="text-xs font-medium">{tx.user?.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{tx.user?.uid}</p>
                    </td>
                    <td className="py-3">
                      <Badge variant="secondary" className={`text-[9px] ${tx.type === "DEPOSIT" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                        {tx.type}
                      </Badge>
                    </td>
                    <td className="text-right py-3 font-mono font-bold">{fmtUsd(tx.amount)}</td>
                    <td className="text-center py-3 hidden sm:table-cell text-xs text-muted-foreground capitalize">{tx.method || "—"}</td>
                    <td className="text-center py-3">
                      <Badge variant="secondary" className={`text-[9px] ${tx.status === "SUCCESSFUL" ? "bg-emerald-500/15 text-emerald-400" : tx.status === "PENDING" ? "bg-amber-500/15 text-amber-400" : tx.status === "FAILED" ? "bg-red-500/15 text-red-400" : "bg-muted text-muted-foreground"}`}>
                        {tx.status}
                      </Badge>
                    </td>
                    <td className="text-right pr-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setViewTx(tx)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {tx.status === "PENDING" && (
                          <>
                            <Button
                              variant="ghost" size="sm" className="h-7 px-2 text-emerald-400 hover:text-emerald-300"
                              onClick={() => handleAction(tx, tx.type === "DEPOSIT" ? "APPROVE_DEPOSIT" : "APPROVE_WITHDRAWAL")}
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost" size="sm" className="h-7 px-2 text-red-400 hover:text-red-300"
                              onClick={() => handleAction(tx, tx.type === "DEPOSIT" ? "REJECT_DEPOSIT" : "REJECT_WITHDRAWAL")}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* View transaction dialog */}
      <Dialog open={!!viewTx} onOpenChange={(open) => !open && setViewTx(null)}>
        <DialogContent className="bg-card border-sidebar-border">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {viewTx && (
            <div className="space-y-2 text-sm py-2">
              <Row label="Transaction ID" value={viewTx.txId} />
              <Row label="User" value={`${viewTx.user?.name} (${viewTx.user?.uid})`} />
              <Row label="Type" value={viewTx.type} />
              <Row label="Amount" value={fmtUsd(viewTx.amount)} />
              <Row label="Fee" value={fmtUsd(viewTx.fee || 0)} />
              <Row label="Method" value={viewTx.method || "—"} />
              <Row label="Destination" value={viewTx.destination || "—"} />
              <Row label="Reference" value={viewTx.reference || "—"} />
              <Row label="Status" value={viewTx.status} />
              <Row label="Note" value={viewTx.note || "—"} />
              <Row label="Created" value={new Date(viewTx.createdAt).toLocaleString()} />
              {viewTx.processedAt && <Row label="Processed" value={new Date(viewTx.processedAt).toLocaleString()} />}
            </div>
          )}
          <DialogFooter>
            {viewTx?.status === "PENDING" && (
              <>
                <Button
                  variant="outline" className="text-red-400"
                  onClick={() => { handleAction(viewTx, viewTx.type === "DEPOSIT" ? "REJECT_DEPOSIT" : "REJECT_WITHDRAWAL"); setViewTx(null); }}
                >
                  Reject
                </Button>
                <Button
                  className="btn-gold-gradient"
                  onClick={() => { handleAction(viewTx, viewTx.type === "DEPOSIT" ? "APPROVE_DEPOSIT" : "APPROVE_WITHDRAWAL"); setViewTx(null); }}
                >
                  Approve
                </Button>
              </>
            )}
            {viewTx?.status !== "PENDING" && (
              <Button variant="outline" onClick={() => setViewTx(null)}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-mono text-right">{value}</span>
    </div>
  );
}
