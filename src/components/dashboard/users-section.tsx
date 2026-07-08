"use client";

import { useMemo, useState } from "react";
import {
  Search,
  MoreHorizontal,
  ShieldCheck,
  ShieldAlert,
  Ban,
  Eye,
  Download,
  UserPlus,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { users, type UserRecord } from "@/lib/dashboard-data";
import { fmtUsd, fmtNum } from "@/lib/format";

const KYC_META: Record<
  UserRecord["kyc"],
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  verified: { label: "Verified", icon: CheckCircle2, className: "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20" },
  pending: { label: "Pending", icon: Clock, className: "bg-amber-500/15 text-amber-400 hover:bg-amber-500/20" },
  rejected: { label: "Rejected", icon: XCircle, className: "bg-red-500/15 text-red-400 hover:bg-red-500/20" },
  unverified: { label: "Unverified", icon: ShieldAlert, className: "bg-muted text-muted-foreground hover:bg-muted/80" },
};

const STATUS_META: Record<
  UserRecord["status"],
  { className: string }
> = {
  active: { className: "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20" },
  suspended: { className: "bg-amber-500/15 text-amber-400 hover:bg-amber-500/20" },
  frozen: { className: "bg-red-500/15 text-red-400 hover:bg-red-500/20" },
};

export function UsersSection() {
  const [query, setQuery] = useState("");
  const [kycFilter, setKycFilter] = useState<"all" | UserRecord["kyc"]>("all");

  const rows = useMemo(() => {
    return users.filter((u) => {
      if (kycFilter !== "all" && u.kyc !== kycFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          u.email.toLowerCase().includes(q) ||
          u.name.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [query, kycFilter]);

  const totalUsers = 48219;
  const verified = Math.round(totalUsers * 0.62);
  const pending = Math.round(totalUsers * 0.18);
  const totalAum = users.reduce((s, u) => s + u.balanceUsd, 0);

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile label="Total users" value={fmtNum(totalUsers, 0)} sub="+3.1% this week" />
        <StatTile label="KYC verified" value={fmtNum(verified, 0)} sub={`${Math.round((verified / totalUsers) * 100)}% of base`} accent="up" />
        <StatTile label="Pending KYC" value={fmtNum(pending, 0)} sub="awaiting review" accent="warn" />
        <StatTile label="AUM (sample)" value={fmtUsd(totalAum, { compact: true })} sub="top 12 accounts" />
      </div>

      {/* Toolbar */}
      <Card className="card-gradient p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center gap-3 p-4 border-b border-border">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or user ID…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-9 bg-muted/40"
            />
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-muted/40 p-1 overflow-x-auto">
            {(["all", "verified", "pending", "rejected", "unverified"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setKycFilter(f)}
                className={`px-3 py-1 text-xs rounded-md transition-colors capitalize whitespace-nowrap ${
                  kycFilter === f
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9">
              <Download className="h-4 w-4 mr-1.5" />
              Export
            </Button>
            <Button size="sm" className="h-9 bg-emerald-500 hover:bg-emerald-600 text-emerald-950">
              <UserPlus className="h-4 w-4 mr-1.5" />
              Add user
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="pl-4">User</TableHead>
                <TableHead className="hidden md:table-cell">User ID</TableHead>
                <TableHead className="hidden lg:table-cell">Joined</TableHead>
                <TableHead className="text-center">KYC</TableHead>
                <TableHead className="hidden sm:table-cell text-center">Tier</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right pr-4"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((u) => {
                const Kyc = KYC_META[u.kyc];
                const KycIcon = Kyc.icon;
                return (
                  <TableRow key={u.id} className="border-border/50">
                    <TableCell className="pl-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-500/10 text-emerald-300 text-xs font-semibold shrink-0">
                          {u.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{u.name}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{u.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell py-3 font-mono text-xs text-muted-foreground">
                      {u.id}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell py-3 text-sm text-muted-foreground">
                      {u.joinedAt}
                    </TableCell>
                    <TableCell className="text-center py-3">
                      <Badge variant="secondary" className={`gap-1 ${Kyc.className}`}>
                        <KycIcon className="h-3 w-3" />
                        {Kyc.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-center py-3">
                      <span className="text-xs font-medium text-muted-foreground">{u.tier}</span>
                    </TableCell>
                    <TableCell className="text-right py-3 font-mono text-sm">
                      {fmtUsd(u.balanceUsd)}
                    </TableCell>
                    <TableCell className="text-center py-3">
                      <Badge variant="secondary" className={`capitalize ${STATUS_META[u.status].className}`}>
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Review KYC
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Ban className="mr-2 h-4 w-4" />
                            {u.status === "active" ? "Suspend user" : "Reactivate user"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-400 focus:text-red-400">
                            <XCircle className="mr-2 h-4 w-4" />
                            Freeze account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                    No users match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs text-muted-foreground">
          <span>
            Showing <span className="text-foreground font-medium">{rows.length}</span> of{" "}
            <span className="text-foreground font-medium">{users.length}</span> sample accounts
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 text-xs" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function StatTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: "up" | "warn";
}) {
  return (
    <Card className="card-gradient p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`mt-1 text-xl font-semibold ${
          accent === "up" ? "text-emerald-400" : accent === "warn" ? "text-amber-400" : ""
        }`}
      >
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
    </Card>
  );
}
