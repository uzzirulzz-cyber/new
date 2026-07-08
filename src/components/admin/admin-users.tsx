"use client";

import { useState, useEffect } from "react";
import {
  Search, Loader2, MoreHorizontal, DollarSign, Ban, CheckCircle,
  Snowflake, Shield, UserX, UserCheck, Send,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { fmtUsd } from "@/lib/format";
import { toast } from "sonner";

export function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionDialog, setActionDialog] = useState<{ user: any; action: string } | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (roleFilter !== "all") params.set("role", roleFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);
    fetch(`/api/admin/users?${params}`)
      .then(r => r.json())
      .then(d => {
        setUsers(d.users || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    const id = setTimeout(load, 300);
    return () => clearTimeout(id);
  }, [query, roleFilter, statusFilter]);

  const performAction = async (action: string, targetUserId: string, extra?: any) => {
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, targetUserId, ...extra }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Action "${action}" completed`);
        load();
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleAction = (user: any, action: string) => {
    if (action === "ADD_FUNDS" || action === "DEDUCT_FUNDS") {
      setActionDialog({ user, action });
      setAmount("");
      setNote("");
    } else if (action === "SEND_NOTIFICATION") {
      const title = prompt("Notification title:");
      const message = prompt("Notification message:");
      if (title && message) performAction("SEND_NOTIFICATION", user.id, { title, message });
    } else {
      performAction(action, user.id);
    }
  };

  const submitAction = () => {
    if (!actionDialog) return;
    performAction(actionDialog.action, actionDialog.user.id, { amount: Number(amount), note });
    setActionDialog(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Toolbar */}
      <Card className="card-gradient p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by UID, email, name, or mobile..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-9 bg-sidebar-accent/60"
            />
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-sidebar-accent/40 p-1">
            {["all", "USER", "AGENT", "ADMIN"].map((r) => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${roleFilter === r ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {r === "all" ? "All Roles" : r}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-sidebar-accent/40 p-1">
            {["all", "ACTIVE", "PENDING", "SUSPENDED", "BANNED", "FROZEN"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${statusFilter === s ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Users table */}
      <Card className="card-gradient p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : users.length === 0 ? (
          <p className="text-center py-12 text-sm text-muted-foreground">No users found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sidebar-border text-[10px] text-muted-foreground uppercase">
                  <th className="text-left font-medium pl-4 py-3">User</th>
                  <th className="text-left font-medium py-3 hidden md:table-cell">UID</th>
                  <th className="text-left font-medium py-3 hidden lg:table-cell">Mobile</th>
                  <th className="text-right font-medium py-3">Balance</th>
                  <th className="text-center font-medium py-3 hidden sm:table-cell">Role</th>
                  <th className="text-center font-medium py-3">Status</th>
                  <th className="text-center font-medium py-3 hidden md:table-cell">KYC</th>
                  <th className="text-right font-medium pr-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-sidebar-border/40 hover:bg-sidebar-accent/20">
                    <td className="pl-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-500/30 to-blue-500/30 text-xs font-bold shrink-0">
                          {u.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{u.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 hidden md:table-cell font-mono text-xs text-amber-500">{u.uid}</td>
                    <td className="py-3 hidden lg:table-cell text-xs text-muted-foreground">{u.mobile || "—"}</td>
                    <td className="text-right py-3 font-mono text-sm font-medium">
                      {u.wallet ? fmtUsd(u.wallet.available + u.wallet.frozen) : "—"}
                    </td>
                    <td className="text-center py-3 hidden sm:table-cell">
                      <Badge variant="secondary" className={`text-[9px] ${u.role === "SUPER_ADMIN" ? "bg-amber-500/15 text-amber-400" : u.role === "ADMIN" ? "bg-blue-500/15 text-blue-400" : u.role === "AGENT" ? "bg-purple-500/15 text-purple-400" : "bg-muted text-muted-foreground"}`}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="text-center py-3">
                      <Badge variant="secondary" className={`text-[9px] capitalize ${u.status === "ACTIVE" ? "bg-emerald-500/15 text-emerald-400" : u.status === "PENDING" ? "bg-amber-500/15 text-amber-400" : u.status === "BANNED" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"}`}>
                        {u.status.toLowerCase()}
                      </Badge>
                    </td>
                    <td className="text-center py-3 hidden md:table-cell">
                      <Badge variant="secondary" className={`text-[9px] ${u.kycStatus === "VERIFIED" ? "bg-emerald-500/15 text-emerald-400" : u.kycStatus === "PENDING" ? "bg-amber-500/15 text-amber-400" : "bg-muted text-muted-foreground"}`}>
                        {u.kycStatus}
                      </Badge>
                    </td>
                    <td className="text-right pr-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleAction(u, "ADD_FUNDS")}>
                            <DollarSign className="mr-2 h-4 w-4 text-emerald-400" /> Add Funds
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction(u, "DEDUCT_FUNDS")}>
                            <DollarSign className="mr-2 h-4 w-4 text-red-400" /> Deduct Funds
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction(u, "FREEZE_FUNDS")}>
                            <Snowflake className="mr-2 h-4 w-4 text-amber-400" /> Freeze Funds
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction(u, "UNFREEZE_FUNDS")}>
                            <Shield className="mr-2 h-4 w-4 text-blue-400" /> Unfreeze Funds
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleAction(u, "APPROVE_USER")}>
                            <UserCheck className="mr-2 h-4 w-4 text-emerald-400" /> Approve User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction(u, "SUSPEND_USER")}>
                            <UserX className="mr-2 h-4 w-4 text-amber-400" /> Suspend User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction(u, "BAN_USER")} className="text-red-400">
                            <Ban className="mr-2 h-4 w-4" /> Ban User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction(u, "UNBAN_USER")}>
                            <CheckCircle className="mr-2 h-4 w-4 text-emerald-400" /> Unban User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleAction(u, "SEND_NOTIFICATION")}>
                            <Send className="mr-2 h-4 w-4 text-blue-400" /> Send Notification
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Action dialog */}
      <Dialog open={!!actionDialog} onOpenChange={(open) => !open && setActionDialog(null)}>
        <DialogContent className="bg-card border-sidebar-border">
          <DialogHeader>
            <DialogTitle>
              {actionDialog?.action === "ADD_FUNDS" ? "Add Funds" : "Deduct Funds"} — {actionDialog?.user.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs">Amount (USD)</Label>
              <Input
                type="number"
                placeholder="100.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 bg-sidebar-accent/60"
              />
            </div>
            <div>
              <Label className="text-xs">Note (optional)</Label>
              <Input
                placeholder="Reason for adjustment"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1 bg-sidebar-accent/60"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>Cancel</Button>
            <Button
              className={actionDialog?.action === "ADD_FUNDS" ? "btn-gold-gradient" : "bg-red-500 hover:bg-red-600"}
              onClick={submitAction}
              disabled={!amount || Number(amount) <= 0}
            >
              {actionDialog?.action === "ADD_FUNDS" ? "Add Funds" : "Deduct Funds"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
