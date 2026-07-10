// Brock Exchange — Market data + pattern math (Bollinger Bands, MA, Support/Resistance)

export interface Coin {
  symbol: string;
  name: string;
  basePrice: number;
  icon: string;
  color: string;
}

export const COINS: Coin[] = [
  { symbol: "BTC", name: "Bitcoin", basePrice: 67234.5, icon: "₿", color: "#f7931a" },
  { symbol: "ETH", name: "Ethereum", basePrice: 3521.8, icon: "Ξ", color: "#627eea" },
  { symbol: "BNB", name: "BNB", basePrice: 612.3, icon: "⬡", color: "#f3ba2f" },
  { symbol: "SOL", name: "Solana", basePrice: 178.42, icon: "◎", color: "#14f195" },
  { symbol: "XRP", name: "XRP", basePrice: 0.6234, icon: "✕", color: "#23292f" },
  { symbol: "ADA", name: "Cardano", basePrice: 0.4521, icon: "₳", color: "#0033ad" },
  { symbol: "DOGE", name: "Dogecoin", basePrice: 0.1423, icon: "Ð", color: "#c2a633" },
  { symbol: "AVAX", name: "Avalanche", basePrice: 38.21, icon: "▲", color: "#e84142" },
  { symbol: "DOT", name: "Polkadot", basePrice: 6.84, icon: "●", color: "#e6007a" },
  { symbol: "LINK", name: "Chainlink", basePrice: 14.32, icon: "⬡", color: "#2a5ada" },
  { symbol: "LTC", name: "Litecoin", basePrice: 84.32, icon: "Ł", color: "#345d9d" },
  { symbol: "TRX", name: "TRON", basePrice: 0.1284, icon: "Τ", color: "#ff060a" },
];

export const TRADE_OPTIONS = [
  { duration: 30, payoutRate: 0.20, label: "30 Seconds" },
  { duration: 60, payoutRate: 0.30, label: "60 Seconds" },
  { duration: 120, payoutRate: 0.50, label: "120 Seconds" },
];

export function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
}

export function getCoin(symbol: string): Coin | undefined {
  return COINS.find((c) => c.symbol === symbol);
}

// ─── Candle generation ────────────────────────────────────────
export interface Candle {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export function getInitialCandles(basePrice: number, count = 60): Candle[] {
  const candles: Candle[] = [];
  let prev = basePrice;
  let seed = basePrice * 1000;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = count; i > 0; i--) {
    const drift = (rand() - 0.48) * basePrice * 0.015;
    const o = prev;
    const c = Math.max(0.0001, prev + drift);
    const h = Math.max(o, c) + rand() * basePrice * 0.005;
    const l = Math.min(o, c) - rand() * basePrice * 0.005;
    const v = Math.round(rand() * 800 + 120);
    candles.push({ t: i, o, h, l, c, v });
    prev = c;
  }
  return candles;
}

export function nextCandle(prevClose: number): Candle {
  const drift = (Math.random() - 0.48) * prevClose * 0.015;
  const o = prevClose;
  const c = Math.max(0.0001, prevClose + drift);
  const h = Math.max(o, c) + Math.random() * prevClose * 0.005;
  const l = Math.min(o, c) - Math.random() * prevClose * 0.005;
  const v = Math.round(Math.random() * 800 + 120);
  return { t: Date.now(), o, h, l, c, v };
}

// ─── Pattern math: Bollinger Bands + MA + Support/Resistance ──
export interface Pattern {
  bollinger: { upper: number; middle: number; lower: number }[];
  ma: number[];
  support: number;
  resistance: number;
}

export function computePattern(candles: Candle[], period = 20): Pattern {
  const closes = candles.map((c) => c.c);
  const bollinger: { upper: number; middle: number; lower: number }[] = [];
  const ma: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      bollinger.push({ upper: 0, middle: 0, lower: 0 });
      ma.push(0);
      continue;
    }
    const slice = closes.slice(i - period + 1, i + 1);
    const mean = slice.reduce((s, v) => s + v, 0) / period;
    const variance = slice.reduce((s, v) => s + (v - mean) ** 2, 0) / period;
    const std = Math.sqrt(variance);
    bollinger.push({
      upper: mean + 2 * std,
      middle: mean,
      lower: mean - 2 * std,
    });
    ma.push(mean);
  }

  // Support = lowest low in last 20 candles, Resistance = highest high
  const recentCandles = candles.slice(-20);
  const support = Math.min(...recentCandles.map((c) => c.l));
  const resistance = Math.max(...recentCandles.map((c) => c.h));

  return { bollinger, ma, support, resistance };
}

// ─── Sparkline data for market cards ──────────────────────────
export function genSparkline(basePrice: number, points = 20): number[] {
  let val = basePrice;
  return Array.from({ length: points }, () => {
    val *= 1 + (Math.random() - 0.48) * 0.02;
    return val;
  });
}
