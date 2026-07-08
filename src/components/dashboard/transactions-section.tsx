"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Download,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  CandlestickChart,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { transactions, type Transaction } from "@/lib/dashboard-data";
import { fmtUsd, fmtAssetAmount, fmtNum } from "@/lib/format";
import {
  useSortableTable,
  SortIndicator,
  type SortableColumn,
} from "@/hooks/use-sortable-table";

const TYPE_META: Record<
  Transaction["type"],
  { icon: typeof Download; color: string; bg: string }
> = {
  trade: { icon: CandlestickChart, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  deposit: { icon: ArrowDownLeft, color: "text-sky-400", bg: "bg-sky-500/10" },
  withdrawal: { icon: ArrowUpRight, color: "text-amber-400", bg: "bg-amber-500/10" },
  transfer: { icon: ArrowLeftRight, color: "text-purple-400", bg: "bg-purple-500/10" },
};

const STATUS_META: Record<
  Transaction["status"],
  { icon: typeof CheckCircle2; className: string }
> = {
  completed: { icon: CheckCircle2, className: "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20" },
  pending: { icon: Clock, className: "bg-amber-500/15 text-amber-400 hover:bg-amber-500/20" },
  failed: { icon: XCircle, className: "bg-red-500/15 text-red-400 hover:bg-red-500/20" },
  review: { icon: AlertCircle, className: "bg-purple-500/15 text-purple-400 hover:bg-purple-500/20" },
};

// Indexed ranks for sort
const TYPE_INDEX: Record<Transaction["type"], number> = {
  trade: 0,
  deposit: 1,
  withdrawal: 2,
  transfer: 3,
};
const STATUS_INDEX: Record<Transaction["status"], number> = {
  completed: 0,
  pending: 1,
  review: 2,
  failed: 3,
};

type SortKey = "id" | "type" | "user" | "amountUsd" | "timestamp" | "status";

const COLUMNS: SortableColumn<SortKey>[] = [
  { key: "id", label: "Transaction" },
  { key: "user", label: "User" },
  { key: "amountUsd", label: "USD Value" },
  { key: "timestamp", label: "Timestamp" },
  { key: "status", label: "Status" },
];

export function TransactionsSection() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | Transaction["type"]>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Transaction["status"]>("all");

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          t.id.toLowerCase().includes(q) ||
          t.user.toLowerCase().includes(q) ||
          (t.txHash || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [query, typeFilter, statusFilter]);

  const { sort, sorted, toggle } = useSortableTable<Transaction, SortKey>(filtered, {
    initial: { key: "timestamp", dir: "desc" },
    indexes: { type: TYPE_INDEX, status: STATUS_INDEX },
  });

  const totalVolume = transactions.reduce((s, t) => s + t.amountUsd, 0);
  const pendingCount = transactions.filter((t) => t.status === "pending").length;
  const failedCount = transactions.filter((t) => t.status === "failed").length;
  const completedCount = transactions.filter((t) => t.status === "completed").length;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile label="24h transaction volume" value={fmtUsd(totalVolume, { compact: true })} sub={`${transactions.length} sample txs`} />
        <StatTile label="Completed" value={String(completedCount)} sub="auto-settled" accent="up" />
        <StatTile label="Pending" value={String(pendingCount)} sub="awaiting confirmation" accent="warn" />
        <StatTile label="Failed" value={String(failedCount)} sub="requires attention" accent="down" />
      </div>

      <Card className="card-gradient p-0 overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 p-4 border-b border-border">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by tx ID, user, or hash…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-9 bg-muted/40"
            />
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-muted/40 p-1 overflow-x-auto">
            {(["all", "trade", "deposit", "withdrawal", "transfer"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={`px-3 py-1 text-xs rounded-md transition-colors capitalize whitespace-nowrap ${
                  typeFilter === f
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-muted/40 p-1 overflow-x-auto">
            {(["all", "completed", "pending", "failed", "review"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1 text-xs rounded-md transition-colors capitalize whitespace-nowrap ${
                  statusFilter === f
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="h-9 shrink-0">
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
        </div>

        {sort.key && (
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border text-xs text-muted-foreground bg-muted/10">
            <span>Sorted by</span>
            <Badge variant="secondary" className="bg-sky-500/15 text-sky-400 capitalize">
              {sort.key} {sort.dir === "asc" ? "↑" : "↓"}
            </Badge>
            <span className="text-[10px]">· indexed rank sort on type and status — click any header to re-sort</span>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="pl-4">
                  <HeaderButton col={COLUMNS[0]} sort={sort} onToggle={toggle} />
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <HeaderButton col={COLUMNS[1]} sort={sort} onToggle={toggle} />
                </TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">
                  <HeaderButton col={COLUMNS[2]} sort={sort} onToggle={toggle} align="right" />
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  <HeaderButton col={COLUMNS[3]} sort={sort} onToggle={toggle} />
                </TableHead>
                <TableHead className="text-center">
                  <HeaderButton col={COLUMNS[4]} sort={sort} onToggle={toggle} align="center" />
                </TableHead>
                <TableHead className="text-right pr-4"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((t) => {
                const TypeIcon = TYPE_META[t.type].icon;
                const StatusMeta = STATUS_META[t.status];
                const StatusIcon = StatusMeta.icon;
                return (
                  <TableRow key={t.id} className="border-border/50">
                    <TableCell className="pl-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full shrink-0 ${TYPE_META[t.type].bg}`}
                        >
                          <TypeIcon className={`h-4 w-4 ${TYPE_META[t.type].color}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium capitalize">{t.type}</span>
                            {t.side && (
                              <Badge
                                variant="secondary"
                                className={`h-4 px-1.5 text-[10px] capitalize ${
                                  t.side === "buy"
                                    ? "bg-emerald-500/15 text-emerald-400"
                                    : "bg-red-500/15 text-red-400"
                                }`}
                              >
                                {t.side}
                              </Badge>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono truncate">
                            {t.id}
                            {t.pair && ` · ${t.pair}`}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell py-3">
                      <div className="text-sm truncate max-w-[180px]">{t.user}</div>
                    </TableCell>
                    <TableCell className="text-right py-3">
                      <div className="text-sm font-mono">{fmtAssetAmount(t.amount, t.asset)}</div>
                      <div className="text-[10px] text-muted-foreground">{t.asset}</div>
                    </TableCell>
                    <TableCell className="text-right py-3 font-mono text-sm">
                      {fmtUsd(t.amountUsd)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell py-3 text-xs text-muted-foreground font-mono">
                      {t.timestamp}
                    </TableCell>
                    <TableCell className="text-center py-3">
                      <Badge variant="secondary" className={`gap-1 ${StatusMeta.className}`}>
                        <StatusIcon className="h-3 w-3" />
                        <span className="capitalize">{t.status}</span>
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
                          <DropdownMenuItem>View details</DropdownMenuItem>
                          {t.txHash && <DropdownMenuItem>Copy tx hash</DropdownMenuItem>}
                          {t.status === "pending" && <DropdownMenuItem>Force settle</DropdownMenuItem>}
                          {t.status === "review" && <DropdownMenuItem>Approve transfer</DropdownMenuItem>}
                          <DropdownMenuItem className="text-red-400 focus:text-red-400">
                            Flag for compliance
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {sorted.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                    No transactions match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs text-muted-foreground">
          <span>
            Showing <span className="text-foreground font-medium">{sorted.length}</span> of{" "}
            <span className="text-foreground font-medium">{transactions.length}</span> transactions
          </span>
          <span className="font-mono">{fmtNum(totalVolume, 0)} USD total volume</span>
        </div>
      </Card>
    </div>
  );
}

function HeaderButton({
  col,
  sort,
  onToggle,
  align = "left",
}: {
  col: SortableColumn<any>;
  sort: { key: string | null; dir: "asc" | "desc" | null };
  onToggle: (key: any) => void;
  align?: "left" | "right" | "center";
}) {
  const active = sort.key === col.key;
  const justify = align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start";
  return (
    <button
      onClick={() => onToggle(col.key)}
      className={`inline-flex items-center gap-1 hover:text-foreground transition-colors ${align === "right" ? "w-full" : ""} ${justify} ${
        active ? "text-foreground" : "text-muted-foreground"
      }`}
    >
      {col.label}
      <SortIndicator dir={active ? sort.dir : null} />
    </button>
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
  accent?: "up" | "warn" | "down";
}) {
  return (
    <Card className="card-gradient p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`mt-1 text-xl font-semibold ${
          accent === "up"
            ? "text-emerald-400"
            : accent === "warn"
            ? "text-amber-400"
            : accent === "down"
            ? "text-red-400"
            : ""
        }`}
      >
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
    </Card>
  );
}
