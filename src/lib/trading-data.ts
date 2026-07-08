// Storefront / trading-floor data for the public-facing Brock Exchange UI.

import { marketPairs } from "./dashboard-data";

export interface Candle {
  t: number; // timestamp index
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

// Generate ~60 deterministic candles for the currently selected pair.
export function genCandles(base: number, count = 60): Candle[] {
  const out: Candle[] = [];
  let prev = base;
  let seed = base * 1000;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = count; i > 0; i--) {
    const drift = (rand() - 0.48) * base * 0.018;
    const o = prev;
    const c = Math.max(0.0001, prev + drift);
    const h = Math.max(o, c) + rand() * base * 0.006;
    const l = Math.min(o, c) - rand() * base * 0.006;
    const v = Math.round(rand() * 800 + 120);
    out.push({ t: i, o, h, l, c, v });
    prev = c;
  }
  return out;
}

export interface OrderBookLevel {
  price: number;
  size: number;
  total: number;
}

export function genOrderBook(mid: number): { bids: OrderBookLevel[]; asks: OrderBookLevel[] } {
  const bids: OrderBookLevel[] = [];
  const asks: OrderBookLevel[] = [];
  let bidTotal = 0;
  let askTotal = 0;
  for (let i = 1; i <= 12; i++) {
    const bp = mid * (1 - i * 0.0008);
    const ap = mid * (1 + i * 0.0008);
    const bsz = Math.round(Math.abs(Math.sin(i * 1.7)) * 1200 + 80) / 100;
    const asz = Math.round(Math.abs(Math.cos(i * 1.3)) * 1200 + 80) / 100;
    bidTotal += bsz;
    askTotal += asz;
    bids.push({ price: bp, size: bsz, total: bidTotal });
    asks.push({ price: ap, size: asz, total: askTotal });
  }
  return { bids, asks };
}

export interface RecentTrade {
  id: string;
  price: number;
  size: number;
  side: "buy" | "sell";
  time: string;
}

export function genRecentTrades(mid: number, count = 14): RecentTrade[] {
  const out: RecentTrade[] = [];
  let seed = mid * 7919;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 0; i < count; i++) {
    const side: "buy" | "sell" = rand() > 0.5 ? "buy" : "sell";
    const price = mid * (1 + (rand() - 0.5) * 0.004) * (side === "buy" ? 1.0001 : 0.9999);
    const size = Math.round(rand() * 480 + 4) / 100;
    const mins = i;
    const secs = Math.floor(rand() * 60);
    out.push({
      id: `RT-${Date.now()}-${i}`,
      price,
      size,
      side,
      time: `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}:${String(secs).padStart(2, "0")}`,
    });
  }
  return out;
}

// User portfolio (logged-in trader view)
export interface PortfolioAsset {
  asset: string;
  icon: string;
  iconColor: string;
  balance: number;
  usd: number;
  change24h: number;
}

export const portfolio: PortfolioAsset[] = [
  { asset: "USDT", icon: "₮", iconColor: "#26a17b", balance: 48230.5, usd: 48230.5, change24h: 0.01 },
  { asset: "BTC", icon: "₿", iconColor: "#f7931a", balance: 0.842, usd: 56612.5, change24h: 2.34 },
  { asset: "ETH", icon: "Ξ", iconColor: "#627eea", balance: 12.4, usd: 43670.3, change24h: 4.12 },
  { asset: "SOL", icon: "◎", iconColor: "#14f195", balance: 142.5, usd: 25425.9, change24h: -1.85 },
  { asset: "BNB", icon: "⬡", iconColor: "#f3ba2f", balance: 24.2, usd: 14818.7, change24h: 0.87 },
];

export interface OpenOrder {
  id: string;
  pair: string;
  side: "buy" | "sell";
  type: "limit" | "market" | "stop";
  price: number;
  size: number;
  filled: number; // percent
  status: "open" | "partial";
  placedAt: string;
}

export const openOrders: OpenOrder[] = [
  { id: "O-38211", pair: "BTC/USDT", side: "buy", type: "limit", price: 66400, size: 0.5, filled: 42, status: "partial", placedAt: "10:41:22" },
  { id: "O-38208", pair: "ETH/USDT", side: "sell", type: "limit", price: 3640, size: 4.2, filled: 0, status: "open", placedAt: "10:32:09" },
  { id: "O-38199", pair: "SOL/USDT", side: "buy", type: "stop", price: 168, size: 120, filled: 0, status: "open", placedAt: "09:58:41" },
  { id: "O-38191", pair: "BNB/USDT", side: "buy", type: "limit", price: 590, size: 12, filled: 18, status: "partial", placedAt: "09:24:18" },
  { id: "O-38184", pair: "BTC/USDT", side: "sell", type: "limit", price: 68900, size: 0.3, filled: 0, status: "open", placedAt: "08:52:03" },
];

export interface OrderHistory {
  id: string;
  pair: string;
  side: "buy" | "sell";
  type: "limit" | "market";
  price: number;
  size: number;
  total: number;
  status: "filled" | "canceled";
  executedAt: string;
}

export const orderHistory: OrderHistory[] = [
  { id: "O-38102", pair: "BTC/USDT", side: "buy", type: "limit", price: 65890, size: 0.2, total: 13178, status: "filled", executedAt: "2026-07-07 22:14" },
  { id: "O-38088", pair: "ETH/USDT", side: "sell", type: "market", price: 3480, size: 6.0, total: 20880, status: "filled", executedAt: "2026-07-07 18:42" },
  { id: "O-38064", pair: "SOL/USDT", side: "buy", type: "limit", price: 172.4, size: 80, total: 13792, status: "filled", executedAt: "2026-07-07 14:09" },
  { id: "O-38042", pair: "BNB/USDT", side: "buy", type: "limit", price: 605, size: 10, total: 6050, status: "filled", executedAt: "2026-07-07 09:51" },
  { id: "O-38021", pair: "BTC/USDT", side: "sell", type: "limit", price: 67100, size: 0.15, total: 10065, status: "canceled", executedAt: "2026-07-06 23:18" },
];

// Re-export the market pairs from the admin dashboard so we have one source of truth
export const tradeablePairs = marketPairs;

export interface TimeframeOption {
  label: string;
  seconds: number;
}

export const TIMEFRAMES: TimeframeOption[] = [
  { label: "1m", seconds: 60 },
  { label: "5m", seconds: 300 },
  { label: "15m", seconds: 900 },
  { label: "1H", seconds: 3600 },
  { label: "4H", seconds: 14400 },
  { label: "1D", seconds: 86400 },
];
