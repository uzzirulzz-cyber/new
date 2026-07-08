// Formatting helpers used across the dashboard.

export function fmtUsd(n: number, opts: { compact?: boolean; decimals?: number } = {}): string {
  const { compact = false, decimals } = opts;
  if (compact && Math.abs(n) >= 1_000_000) {
    return `$${(n / 1_000_000).toFixed(2)}M`;
  }
  if (compact && Math.abs(n) >= 1_000) {
    return `$${(n / 1_000).toFixed(1)}K`;
  }
  let d = decimals;
  if (d === undefined) {
    const abs = Math.abs(n);
    if (abs > 0 && abs < 0.0001) d = 8;
    else if (abs < 0.01) d = 6;
    else if (abs < 1) d = 4;
    else d = 2;
  }
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })}`;
}

export function fmtNum(n: number, decimals = 2): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function fmtCompact(n: number): string {
  if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
}

export function fmtAssetAmount(n: number, asset: string): string {
  if (asset === "USDT" || asset === "USDC") return fmtUsd(n);
  if (n < 1) return `${n.toFixed(6)} ${asset}`;
  if (n < 100) return `${n.toFixed(4)} ${asset}`;
  return `${n.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${asset}`;
}
