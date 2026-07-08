"use client";

import { useMemo, useState } from "react";
import { Search, ArrowUpDown, MoreHorizontal, Pause, Play, Trash2 } from "lucide-react";
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
import { marketPairs, type MarketPair } from "@/lib/dashboard-data";
import { fmtUsd, fmtCompact } from "@/lib/format";
import {
  useSortableTable,
  SortIndicator,
  type SortableColumn,
} from "@/hooks/use-sortable-table";

// Indexed sort: status gets a custom rank order instead of alphabetical.
const STATUS_INDEX: Record<MarketPair["status"], number> = {
  active: 0,
  paused: 1,
  delisted: 2,
};

type SortKey = "pair" | "lastPrice" | "change24h" | "volume24h" | "status";

const COLUMNS: SortableColumn<SortKey>[] = [
  { key: "pair", label: "Pair" },
  { key: "lastPrice", label: "Last Price" },
  { key: "change24h", label: "24h %" },
  { key: "volume24h", label: "24h Volume" },
  { key: "status", label: "Status" },
];

export function MarketsSection() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "paused">("all");

  const filtered = useMemo(() => {
    return marketPairs.filter((m) => {
      if (filter === "active" && m.status !== "active") return false;
      if (filter === "paused" && m.status !== "paused") return false;
      if (query && !m.pair.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [query, filter]);

  const { sort, sorted, toggle } = useSortableTable<MarketPair, SortKey>(filtered, {
    initial: { key: "volume24h", dir: "desc" },
    indexes: { status: STATUS_INDEX },
  });

  const totalVolume = marketPairs.reduce((s, m) => s + m.lastPrice * m.volume24h, 0);
  const activeCount = marketPairs.filter((m) => m.status === "active").length;
  const gainers = marketPairs.filter((m) => m.change24h > 0).length;
  const losers = marketPairs.filter((m) => m.change24h < 0).length;

  return (
    <div className="space-y-5">
      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile label="Listed pairs" value={String(marketPairs.length)} sub={`${activeCount} active`} />
        <StatTile label="24h volume" value={fmtUsd(totalVolume, { compact: true })} sub="across all markets" />
        <StatTile label="Gainers" value={String(gainers)} sub="vs 24h ago" accent="up" />
        <StatTile label="Losers" value={String(losers)} sub="vs 24h ago" accent="down" />
      </div>

      <Card className="card-gradient p-0 overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 p-4 border-b border-border">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pair (e.g. BTC, ETH)…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-9 bg-muted/40"
            />
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-muted/40 p-1">
            {(["all", "active", "paused"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs rounded-md transition-colors capitalize ${
                  filter === f
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {sort.key && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Sorted by</span>
              <Badge variant="secondary" className="bg-sky-500/15 text-sky-400 capitalize">
                {sort.key} {sort.dir === "asc" ? "↑" : "↓"}
              </Badge>
              <span className="text-[10px]">click headers to cycle (asc → desc → none)</span>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="pl-4">
                  <HeaderButton col={COLUMNS[0]} sort={sort} onToggle={toggle} />
                </TableHead>
                <TableHead className="text-right">
                  <HeaderButton col={COLUMNS[1]} sort={sort} onToggle={toggle} align="right" />
                </TableHead>
                <TableHead className="text-right">
                  <HeaderButton col={COLUMNS[2]} sort={sort} onToggle={toggle} align="right" />
                </TableHead>
                <TableHead className="text-right hidden md:table-cell">24h High</TableHead>
                <TableHead className="text-right hidden md:table-cell">24h Low</TableHead>
                <TableHead className="text-right">
                  <HeaderButton col={COLUMNS[3]} sort={sort} onToggle={toggle} align="right" />
                </TableHead>
                <TableHead className="text-center hidden sm:table-cell">
                  <HeaderButton col={COLUMNS[4]} sort={sort} onToggle={toggle} align="center" />
                </TableHead>
                <TableHead className="text-right pr-4"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((m) => (
                <TableRow key={m.pair} className="border-border/50">
                  <TableCell className="pl-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-full text-base font-bold shrink-0"
                        style={{ background: `${m.iconColor}20`, color: m.iconColor }}
                      >
                        {m.icon}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{m.pair}</div>
                        <div className="text-[10px] text-muted-foreground">{m.base} / {m.quote}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-3 font-mono text-sm">
                    {fmtUsd(m.lastPrice)}
                  </TableCell>
                  <TableCell className="text-right py-3">
                    <span
                      className={`inline-flex items-center justify-end gap-0.5 text-sm font-medium ${
                        m.change24h >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {m.change24h >= 0 ? "+" : ""}
                      {m.change24h.toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-3 hidden md:table-cell font-mono text-sm text-muted-foreground">
                    {fmtUsd(m.high24h)}
                  </TableCell>
                  <TableCell className="text-right py-3 hidden md:table-cell font-mono text-sm text-muted-foreground">
                    {fmtUsd(m.low24h)}
                  </TableCell>
                  <TableCell className="text-right py-3 font-mono text-sm">
                    {fmtCompact(m.volume24h)} <span className="text-muted-foreground text-xs">{m.base}</span>
                  </TableCell>
                  <TableCell className="text-center py-3 hidden sm:table-cell">
                    <StatusBadge status={m.status} />
                  </TableCell>
                  <TableCell className="pr-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem>
                          <ArrowUpDown className="mr-2 h-4 w-4" />
                          View order book
                        </DropdownMenuItem>
                        {m.status === "active" ? (
                          <DropdownMenuItem>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause trading
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem>
                            <Play className="mr-2 h-4 w-4" />
                            Resume trading
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-400 focus:text-red-400">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delist pair
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {sorted.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                    No pairs match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
      className={`inline-flex items-center gap-1 hover:text-foreground transition-colors w-full ${justify} ${
        active ? "text-foreground" : "text-muted-foreground"
      }`}
    >
      {col.label}
      <ArrowUpDown className={`h-3 w-3 ${active ? "opacity-100" : "opacity-40"}`} />
      {active && <SortIndicator dir={sort.dir} />}
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
  accent?: "up" | "down";
}) {
  return (
    <Card className="card-gradient p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`mt-1 text-xl font-semibold ${
          accent === "up" ? "text-emerald-400" : accent === "down" ? "text-red-400" : ""
        }`}
      >
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
    </Card>
  );
}

function StatusBadge({ status }: { status: "active" | "paused" | "delisted" }) {
  const map = {
    active: "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20",
    paused: "bg-amber-500/15 text-amber-400 hover:bg-amber-500/20",
    delisted: "bg-red-500/15 text-red-400 hover:bg-red-500/20",
  };
  return (
    <Badge variant="secondary" className={`capitalize ${map[status]}`}>
      {status}
    </Badge>
  );
}
