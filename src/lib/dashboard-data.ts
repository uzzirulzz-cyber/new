// Mock data for the Brock Exchange admin dashboard.
// All values are illustrative; in production these would come from the
// matching API routes / MongoDB collections.

export type Trend = "up" | "down";

export interface Kpi {
  label: string;
  value: string;
  delta: string;
  trend: Trend;
  spark: number[];
}

export const kpis: Kpi[] = [
  {
    label: "24h Volume",
    value: "$284.6M",
    delta: "+12.4%",
    trend: "up",
    spark: [42, 48, 45, 52, 58, 55, 62, 68, 72, 78, 84, 92],
  },
  {
    label: "Active Users",
    value: "48,219",
    delta: "+3.1%",
    trend: "up",
    spark: [120, 132, 128, 140, 138, 152, 160, 158, 172, 180, 178, 192],
  },
  {
    label: "Total Revenue",
    value: "$1.84M",
    delta: "+8.7%",
    trend: "up",
    spark: [8, 12, 10, 14, 18, 16, 22, 26, 24, 30, 34, 38],
  },
  {
    label: "Open Orders",
    value: "126,402",
    delta: "-2.3%",
    trend: "down",
    spark: [180, 172, 178, 168, 160, 158, 152, 148, 142, 138, 132, 128],
  },
];

export interface MarketPair {
  pair: string;
  base: string;
  quote: string;
  lastPrice: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number; // in base currency
  status: "active" | "paused" | "delisted";
  icon: string;
  iconColor: string;
}

export const marketPairs: MarketPair[] = [
  { pair: "BTC/USDT", base: "BTC", quote: "USDT", lastPrice: 67234.5, change24h: 2.34, high24h: 68120.0, low24h: 65890.2, volume24h: 8421.5, status: "active", icon: "₿", iconColor: "#f7931a" },
  { pair: "ETH/USDT", base: "ETH", quote: "USDT", lastPrice: 3521.8, change24h: 4.12, high24h: 3580.0, low24h: 3380.5, volume24h: 64230.2, status: "active", icon: "Ξ", iconColor: "#627eea" },
  { pair: "SOL/USDT", base: "SOL", quote: "USDT", lastPrice: 178.42, change24h: -1.85, high24h: 184.2, low24h: 175.1, volume24h: 421300.5, status: "active", icon: "◎", iconColor: "#14f195" },
  { pair: "BNB/USDT", base: "BNB", quote: "USDT", lastPrice: 612.3, change24h: 0.87, high24h: 618.0, low24h: 605.4, volume24h: 18230.0, status: "active", icon: "⬡", iconColor: "#f3ba2f" },
  { pair: "XRP/USDT", base: "XRP", quote: "USDT", lastPrice: 0.6234, change24h: -3.21, high24h: 0.6512, low24h: 0.6180, volume24h: 8210400.0, status: "active", icon: "✕", iconColor: "#23292f" },
  { pair: "ADA/USDT", base: "ADA", quote: "USDT", lastPrice: 0.4521, change24h: 5.67, high24h: 0.4680, low24h: 0.4280, volume24h: 4210300.0, status: "active", icon: "₳", iconColor: "#0033ad" },
  { pair: "DOGE/USDT", base: "DOGE", quote: "USDT", lastPrice: 0.1423, change24h: 8.92, high24h: 0.1480, low24h: 0.1305, volume24h: 18243000.0, status: "active", icon: "Ð", iconColor: "#c2a633" },
  { pair: "AVAX/USDT", base: "AVAX", quote: "USDT", lastPrice: 38.21, change24h: -2.14, high24h: 39.5, low24h: 37.8, volume24h: 312400.0, status: "active", icon: "▲", iconColor: "#e84142" },
  { pair: "MATIC/USDT", base: "MATIC", quote: "USDT", lastPrice: 0.7821, change24h: 1.45, high24h: 0.7940, low24h: 0.7680, volume24h: 2140300.0, status: "paused", icon: "⬢", iconColor: "#8247e5" },
  { pair: "DOT/USDT", base: "DOT", quote: "USDT", lastPrice: 6.84, change24h: -0.62, high24h: 7.02, low24h: 6.78, volume24h: 521300.0, status: "active", icon: "●", iconColor: "#e6007a" },
  { pair: "LINK/USDT", base: "LINK", quote: "USDT", lastPrice: 14.32, change24h: 3.78, high24h: 14.6, low24h: 13.85, volume24h: 821400.0, status: "active", icon: "⬡", iconColor: "#2a5ada" },
  { pair: "SHIB/USDT", base: "SHIB", quote: "USDT", lastPrice: 0.0000234, change24h: 12.45, high24h: 0.0000248, low24h: 0.0000208, volume24h: 84210000.0, status: "active", icon: "🐕", iconColor: "#f00500" },
];

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  joinedAt: string;
  kyc: "verified" | "pending" | "rejected" | "unverified";
  tier: "Tier 1" | "Tier 2" | "Tier 3";
  balanceUsd: number;
  status: "active" | "suspended" | "frozen";
  country: string;
}

export const users: UserRecord[] = [
  { id: "U-104823", email: "alex.morgan@gmail.com", name: "Alex Morgan", joinedAt: "2026-06-12", kyc: "verified", tier: "Tier 3", balanceUsd: 142800.5, status: "active", country: "US" },
  { id: "U-104822", email: "sarah.chen@outlook.com", name: "Sarah Chen", joinedAt: "2026-06-11", kyc: "verified", tier: "Tier 2", balanceUsd: 28430.0, status: "active", country: "SG" },
  { id: "U-104821", email: "marcus.brown@yahoo.com", name: "Marcus Brown", joinedAt: "2026-06-11", kyc: "pending", tier: "Tier 1", balanceUsd: 1240.8, status: "active", country: "GB" },
  { id: "U-104820", email: "yuki.tanaka@gmail.com", name: "Yuki Tanaka", joinedAt: "2026-06-10", kyc: "verified", tier: "Tier 3", balanceUsd: 312450.2, status: "active", country: "JP" },
  { id: "U-104819", email: "lena.kowalski@wp.pl", name: "Lena Kowalski", joinedAt: "2026-06-09", kyc: "rejected", tier: "Tier 1", balanceUsd: 0, status: "frozen", country: "PL" },
  { id: "U-104818", email: "diego.fernandez@gmail.com", name: "Diego Fernandez", joinedAt: "2026-06-09", kyc: "verified", tier: "Tier 2", balanceUsd: 18420.5, status: "active", country: "ES" },
  { id: "U-104817", email: "priya.patel@gmail.com", name: "Priya Patel", joinedAt: "2026-06-08", kyc: "verified", tier: "Tier 2", balanceUsd: 42180.0, status: "active", country: "IN" },
  { id: "U-104816", email: "omar.hassan@gmail.com", name: "Omar Hassan", joinedAt: "2026-06-08", kyc: "pending", tier: "Tier 1", balanceUsd: 820.0, status: "suspended", country: "AE" },
  { id: "U-104815", email: "emma.wilson@gmail.com", name: "Emma Wilson", joinedAt: "2026-06-07", kyc: "verified", tier: "Tier 3", balanceUsd: 528900.0, status: "active", country: "AU" },
  { id: "U-104814", email: "carlos.silva@gmail.com", name: "Carlos Silva", joinedAt: "2026-06-07", kyc: "verified", tier: "Tier 1", balanceUsd: 3240.5, status: "active", country: "BR" },
  { id: "U-104813", email: "natalia.ivanova@yandex.ru", name: "Natalia Ivanova", joinedAt: "2026-06-06", kyc: "verified", tier: "Tier 2", balanceUsd: 21430.0, status: "active", country: "RU" },
  { id: "U-104812", email: "klaus.weber@gmail.com", name: "Klaus Weber", joinedAt: "2026-06-06", kyc: "verified", tier: "Tier 2", balanceUsd: 38210.0, status: "active", country: "DE" },
];

export interface Transaction {
  id: string;
  type: "trade" | "deposit" | "withdrawal" | "transfer";
  user: string;
  pair?: string;
  side?: "buy" | "sell";
  amount: number;
  asset: string;
  amountUsd: number;
  status: "completed" | "pending" | "failed" | "review";
  timestamp: string;
  txHash?: string;
}

export const transactions: Transaction[] = [
  { id: "TX-9281041", type: "trade", user: "alex.morgan@gmail.com", pair: "BTC/USDT", side: "buy", amount: 0.842, asset: "BTC", amountUsd: 56571.5, status: "completed", timestamp: "2026-07-08 10:42:18" },
  { id: "TX-9281040", type: "withdrawal", user: "sarah.chen@outlook.com", amount: 12400, asset: "USDT", amountUsd: 12400, status: "pending", timestamp: "2026-07-08 10:38:02", txHash: "0x8f3a...e21c" },
  { id: "TX-9281039", type: "deposit", user: "yuki.tanaka@gmail.com", amount: 5.2, asset: "ETH", amountUsd: 18313.4, status: "completed", timestamp: "2026-07-08 10:31:55", txHash: "0x2b7c...9d4f" },
  { id: "TX-9281038", type: "trade", user: "emma.wilson@gmail.com", pair: "SOL/USDT", side: "sell", amount: 4200, asset: "SOL", amountUsd: 749364, status: "completed", timestamp: "2026-07-08 10:28:41" },
  { id: "TX-9281037", type: "trade", user: "diego.fernandez@gmail.com", pair: "ETH/USDT", side: "buy", amount: 2.4, asset: "ETH", amountUsd: 8452.3, status: "completed", timestamp: "2026-07-08 10:24:09" },
  { id: "TX-9281036", type: "transfer", user: "priya.patel@gmail.com", amount: 5000, asset: "USDT", amountUsd: 5000, status: "review", timestamp: "2026-07-08 10:19:33" },
  { id: "TX-9281035", type: "withdrawal", user: "marcus.brown@yahoo.com", amount: 820, asset: "USDT", amountUsd: 820, status: "failed", timestamp: "2026-07-08 10:14:22", txHash: "0x4c1e...77ab" },
  { id: "TX-9281034", type: "trade", user: "carlos.silva@gmail.com", pair: "DOGE/USDT", side: "buy", amount: 124000, asset: "DOGE", amountUsd: 17645.2, status: "completed", timestamp: "2026-07-08 10:08:51" },
  { id: "TX-9281033", type: "deposit", user: "klaus.weber@gmail.com", amount: 12000, asset: "USDT", amountUsd: 12000, status: "completed", timestamp: "2026-07-08 10:02:14", txHash: "0xa3f8...2bcd" },
  { id: "TX-9281032", type: "trade", user: "natalia.ivanova@yandex.ru", pair: "BNB/USDT", side: "sell", amount: 12, asset: "BNB", amountUsd: 7347.6, status: "completed", timestamp: "2026-07-08 09:58:43" },
  { id: "TX-9281031", type: "withdrawal", user: "alex.morgan@gmail.com", amount: 0.5, asset: "BTC", amountUsd: 33617.3, status: "pending", timestamp: "2026-07-08 09:52:18", txHash: "0x6d9c...1f4a" },
  { id: "TX-9281030", type: "trade", user: "yuki.tanaka@gmail.com", pair: "AVAX/USDT", side: "buy", amount: 320, asset: "AVAX", amountUsd: 12227.2, status: "completed", timestamp: "2026-07-08 09:48:09" },
];

export interface Wallet {
  asset: string;
  icon: string;
  iconColor: string;
  balance: number;
  usdValue: number;
  cold: number;
  hot: number;
  change24h: number;
  type: "hot" | "cold" | "reserve";
}

export const wallets: Wallet[] = [
  { asset: "BTC", icon: "₿", iconColor: "#f7931a", balance: 8420.5, usdValue: 566219830, cold: 8120.0, hot: 300.5, change24h: 2.34, type: "cold" },
  { asset: "ETH", icon: "Ξ", iconColor: "#627eea", balance: 142800, usdValue: 503011440, cold: 138000, hot: 4800, change24h: 4.12, type: "cold" },
  { asset: "USDT", icon: "₮", iconColor: "#26a17b", balance: 184200000, usdValue: 184200000, cold: 178000000, hot: 6200000, change24h: 0.01, type: "reserve" },
  { asset: "SOL", icon: "◎", iconColor: "#14f195", balance: 4210000, usdValue: 751421820, cold: 4100000, hot: 110000, change24h: -1.85, type: "cold" },
  { asset: "BNB", icon: "⬡", iconColor: "#f3ba2f", balance: 82400, usdValue: 50452920, cold: 80000, hot: 2400, change24h: 0.87, type: "cold" },
  { asset: "XRP", icon: "✕", iconColor: "#23292f", balance: 82100000, usdValue: 51194940, cold: 80000000, hot: 2100000, change24h: -3.21, type: "cold" },
  { asset: "ADA", icon: "₳", iconColor: "#0033ad", balance: 42100000, usdValue: 19035390, cold: 41000000, hot: 1100000, change24h: 5.67, type: "cold" },
  { asset: "DOGE", icon: "Ð", iconColor: "#c2a633", balance: 184200000, usdValue: 26211660, cold: 180000000, hot: 4200000, change24h: 8.92, type: "cold" },
];

// 30-day volume history (in millions USD)
export const volumeHistory = Array.from({ length: 30 }, (_, i) => {
  const base = 240;
  const wave = Math.sin(i / 3) * 28;
  const trend = i * 1.4;
  const noise = (i % 5) * 3 - 6;
  return {
    day: i + 1,
    date: new Date(2026, 5, i + 1).toISOString().slice(5, 10),
    volume: Math.round((base + wave + trend + noise) * 10) / 10,
    revenue: Math.round((base + wave + trend + noise) * 0.012 * 10) / 10,
    trades: Math.round((base + wave + trend + noise) * 800 + 4200),
  };
});

// Asset allocation for pie chart
export const assetAllocation = [
  { name: "BTC", value: 32, color: "#f7931a" },
  { name: "ETH", value: 28, color: "#627eea" },
  { name: "USDT", value: 18, color: "#26a17b" },
  { name: "SOL", value: 9, color: "#14f195" },
  { name: "Others", value: 13, color: "#8b5cf6" },
];

// Hourly trade activity (24 hours)
export const hourlyActivity = Array.from({ length: 24 }, (_, h) => {
  const peak = h >= 9 && h <= 21;
  const base = peak ? 4200 : 1800;
  const noise = Math.sin(h / 2) * 800;
  return {
    hour: `${String(h).padStart(2, "0")}:00`,
    trades: Math.max(420, Math.round(base + noise + Math.random() * 600)),
    volume: Math.max(8, Math.round((base + noise) / 100 + Math.random() * 4)),
  };
});

// Geographical distribution
export const geoDistribution = [
  { region: "North America", users: 18420, share: 38.2 },
  { region: "Europe", users: 14280, share: 29.6 },
  { region: "Asia Pacific", users: 11240, share: 23.3 },
  { region: "Latin America", users: 2840, share: 5.9 },
  { region: "Middle East & Africa", users: 1439, share: 3.0 },
];

// Recent alerts / audit log
export interface Alert {
  id: string;
  level: "info" | "warning" | "critical";
  message: string;
  timestamp: string;
  source: string;
}

export const alerts: Alert[] = [
  { id: "A-3812", level: "critical", message: "Large withdrawal flagged: 12400 USDT from sarah.chen@outlook.com awaiting review", timestamp: "2 min ago", source: "Risk Engine" },
  { id: "A-3811", level: "warning", message: "Withdrawal failed for marcus.brown@yahoo.com (insufficient gas)", timestamp: "8 min ago", source: "Settlement" },
  { id: "A-3810", level: "warning", message: "BTC/USDT spread widened beyond 0.08% threshold", timestamp: "14 min ago", source: "Market Maker" },
  { id: "A-3809", level: "info", message: "KYC verified for emma.wilson@gmail.com (Tier 3)", timestamp: "23 min ago", source: "Compliance" },
  { id: "A-3808", level: "info", message: "New trading pair XRP/EUR listed", timestamp: "41 min ago", source: "Listing Ops" },
  { id: "A-3807", level: "critical", message: "Hot wallet BTC balance dropped below 300 BTC threshold", timestamp: "1 hr ago", source: "Treasury" },
];

export interface Setting {
  key: string;
  label: string;
  description: string;
  value: boolean;
  category: "trading" | "security" | "compliance" | "notifications";
}

export const settings: Setting[] = [
  { key: "auto_listing", label: "Auto-list new pairs", description: "Allow market makers to list new trading pairs without manual review.", value: false, category: "trading" },
  { key: "circuit_breaker", label: "Circuit breaker enabled", description: "Pause trading automatically when an asset moves more than 15% in 5 minutes.", value: true, category: "trading" },
  { key: "withdrawal_whitelist", label: "Force withdrawal whitelist", description: "Require all users to whitelist withdrawal addresses before sending funds.", value: true, category: "security" },
  { key: "twofa_required", label: "Require 2FA for withdrawals", description: "Block any withdrawal above $1,000 unless 2FA is verified.", value: true, category: "security" },
  { key: "kyc_required", label: "KYC required for trading", description: "Prevent unverified users from placing orders.", value: true, category: "compliance" },
  { key: "aml_screening", label: "AML screening on deposits", description: "Run Chainalysis AML screening on every incoming deposit above $500.", value: true, category: "compliance" },
  { key: "notify_large_trades", label: "Notify on large trades", description: "Send a Slack alert when a single trade exceeds $100,000.", value: true, category: "notifications" },
  { key: "notify_kyc_review", label: "Notify on KYC review queue", description: "Ping the compliance channel when more than 20 KYC applications are pending.", value: false, category: "notifications" },
];
