// Brock Exchange — Membership Levels
// 5 tiers with increasing benefits. Stored as constants (not in DB)
// so they're always available without a query.

export interface MembershipTier {
  level: number;
  name: string;
  color: string;
  icon: string;
  minBalance: number;        // minimum balance to qualify
  monthlyFee: number;         // monthly fee in USD
  payoutBonus: number;        // extra payout % on top of base (e.g. 0.05 = +5%)
  tradeFeeDiscount: number;   // discount on trade fees (e.g. 0.10 = 10% off)
  maxTradeAmount: number;     // maximum single trade amount
  prioritySupport: boolean;   // priority customer support
  exclusiveFeatures: string[]; // list of feature names
  benefits: string[];          // human-readable benefit list
}

export const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    level: 1,
    name: "Bronze",
    color: "#CD7F32",
    icon: "🥉",
    minBalance: 0,
    monthlyFee: 0,
    payoutBonus: 0,
    tradeFeeDiscount: 0,
    maxTradeAmount: 1000,
    prioritySupport: false,
    exclusiveFeatures: [],
    benefits: [
      "Standard payout rates (20% / 30% / 50%)",
      "Up to $1,000 per trade",
      "Email support",
      "Basic chart patterns",
    ],
  },
  {
    level: 2,
    name: "Silver",
    color: "#C0C0C0",
    icon: "🥈",
    minBalance: 5000,
    monthlyFee: 0,
    payoutBonus: 0.02,
    tradeFeeDiscount: 0.10,
    maxTradeAmount: 5000,
    prioritySupport: false,
    exclusiveFeatures: ["advanced_patterns"],
    benefits: [
      "+2% bonus payout on all trades",
      "10% trade fee discount",
      "Up to $5,000 per trade",
      "Advanced chart patterns (Bollinger + MA)",
      "Priority email support",
    ],
  },
  {
    level: 3,
    name: "Gold",
    color: "#FFD700",
    icon: "🥇",
    minBalance: 25000,
    monthlyFee: 0,
    payoutBonus: 0.05,
    tradeFeeDiscount: 0.25,
    maxTradeAmount: 25000,
    prioritySupport: true,
    exclusiveFeatures: ["advanced_patterns", "support_resistance", "price_alerts"],
    benefits: [
      "+5% bonus payout on all trades",
      "25% trade fee discount",
      "Up to $25,000 per trade",
      "Support & Resistance indicators",
      "Price alerts",
      "Priority chat support",
    ],
  },
  {
    level: 4,
    name: "Platinum",
    color: "#E5E4E2",
    icon: "💎",
    minBalance: 100000,
    monthlyFee: 0,
    payoutBonus: 0.08,
    tradeFeeDiscount: 0.50,
    maxTradeAmount: 100000,
    prioritySupport: true,
    exclusiveFeatures: ["advanced_patterns", "support_resistance", "price_alerts", "api_access", "dedicated_manager"],
    benefits: [
      "+8% bonus payout on all trades",
      "50% trade fee discount",
      "Up to $100,000 per trade",
      "API access for automated trading",
      "Dedicated account manager",
      "Instant withdrawal processing",
      "24/7 priority support",
    ],
  },
  {
    level: 5,
    name: "Diamond",
    color: "#B9F2FF",
    icon: "💠",
    minBalance: 500000,
    monthlyFee: 0,
    payoutBonus: 0.10,
    tradeFeeDiscount: 1.0,
    maxTradeAmount: 1000000,
    prioritySupport: true,
    exclusiveFeatures: ["advanced_patterns", "support_resistance", "price_alerts", "api_access", "dedicated_manager", "exclusive_coins", "vip_events"],
    benefits: [
      "+10% bonus payout on all trades",
      "100% trade fee discount (zero fees)",
      "Up to $1,000,000 per trade",
      "Exclusive coin listings",
      "VIP event invitations",
      "Personal trading advisor",
      "Instant everything (deposits, withdrawals, settlements)",
      "Direct line to Super Admin",
    ],
  },
];

export function getTierByLevel(level: number): MembershipTier {
  return MEMBERSHIP_TIERS.find(t => t.level === level) || MEMBERSHIP_TIERS[0];
}

export function getEligibleTiers(balance: number): MembershipTier[] {
  return MEMBERSHIP_TIERS.filter(t => balance >= t.minBalance);
}

export function getHighestEligibleTier(balance: number): MembershipTier {
  const eligible = getEligibleTiers(balance);
  return eligible[eligible.length - 1] || MEMBERSHIP_TIERS[0];
}
