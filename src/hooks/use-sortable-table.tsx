"use client";

import { useMemo, useState, useCallback } from "react";

export type SortDir = "asc" | "desc" | null;

export interface SortState<K extends string> {
  key: K | null;
  dir: SortDir;
}

export interface IndexedSortConfig<K extends string> {
  /** Default sort applied on first render */
  initial?: SortState<K>;
  /** When switching to a new column, default direction (defaults to "asc") */
  defaultDir?: Exclude<SortDir, null>;
  /** Indexes the comparator should use for ranked sorting (e.g. custom order maps) */
  indexes?: Partial<Record<K, Record<string, number>>>;
}

export interface SortableColumn<K extends string> {
  key: K;
  label: string;
  /** Optional accessor for sorting derived/computed values */
  accessor?: (row: any) => string | number;
  /** Mark a column as non-sortable */
  sortable?: boolean;
}

/**
 * Indexed, multi-cycle sortable table hook.
 *
 * Click cycles: null → asc → desc → null. Clicking a new column resets to defaultDir.
 * When a column has an `indexes` map, the comparator sorts by that map's rank
 * instead of the raw value (useful for statuses like "active/paused/delisted").
 */
export function useSortableTable<T, K extends string>(
  rows: T[],
  config: IndexedSortConfig<K> = {}
) {
  const [sort, setSort] = useState<SortState<K>>(config.initial ?? { key: null, dir: null });

  const toggle = useCallback(
    (key: K) => {
      setSort((prev) => {
        if (prev.key !== key) {
          return { key, dir: config.defaultDir ?? "asc" };
        }
        // same column — cycle asc → desc → null
        if (prev.dir === "asc") return { key, dir: "desc" };
        if (prev.dir === "desc") return { key: null, dir: null };
        return { key, dir: "asc" };
      });
    },
    [config.defaultDir]
  );

  const sorted = useMemo(() => {
    if (!sort.key || !sort.dir) return rows;
    const key = sort.key;
    const indexMap = config.indexes?.[key];
    const dirMul = sort.dir === "asc" ? 1 : -1;

    return [...rows].sort((a: any, b: any) => {
      const av = a[key];
      const bv = b[key];

      // ranked index lookup wins over raw value
      if (indexMap) {
        const ai = indexMap[av] ?? Number.MAX_SAFE_INTEGER;
        const bi = indexMap[bv] ?? Number.MAX_SAFE_INTEGER;
        return (ai - bi) * dirMul;
      }

      // string compare
      if (typeof av === "string" || typeof bv === "string") {
        return String(av).localeCompare(String(bv)) * dirMul;
      }
      // numeric / null-safe
      const na = av == null ? -Infinity : av;
      const nb = bv == null ? -Infinity : bv;
      return (na - nb) * dirMul;
    });
  }, [rows, sort, config.indexes]);

  const reset = useCallback(() => setSort({ key: null, dir: null }), []);

  return { sort, sorted, toggle, reset };
}

/** Renders the directional indicator next to a sortable header. */
export function SortIndicator({ dir }: { dir: SortDir }) {
  if (dir === "asc") return <span className="text-emerald-400 text-[10px] ml-0.5">↑</span>;
  if (dir === "desc") return <span className="text-emerald-400 text-[10px] ml-0.5">↓</span>;
  return null;
}
