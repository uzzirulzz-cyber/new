"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Check,
  Lock,
  ArrowUp,
  TrendingUp,
  Zap,
  Shield,
  Headset,
} from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MEMBERSHIP_TIERS,
  getTierByLevel,
  getHighestEligibleTier,
  type MembershipTier,
} from "@/lib/membership";
import { toast } from "sonner";

function fmtUsd(n: number): string {
  return "$" + n.toLocaleString("en-US");
}

function fmtPct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

export function MembershipView() {
  const { user, apiFetch, setUser } = useAuth();

  const [upgrading, setUpgrading] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Re-derive tier data from current user (refresh after upgrade)
  const balance = user?.balance ?? 0;
  const vipLevel = user?.vipLevel ?? 1;
  const currentTier = getTierByLevel(vipLevel);
  const highestEligible = getHighestEligibleTier(balance);
  const nextTier = MEMBERSHIP_TIERS.find((t) => t.level === vipLevel + 1) || null;

  // Optional: also fetch the membership/current endpoint to keep in sync
  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch("/api/membership/current");
        const data = await res.json();
        if (res.ok && data.userBalance !== undefined && user) {
          if (data.userBalance !== user.balance || data.userVipLevel !== user.vipLevel) {
            setUser({
              ...user,
              balance: data.userBalance,
              vipLevel: data.userVipLevel,
            });
          }
        }
      } catch {
        /* noop */
      }
    })();
  }, [refreshKey, apiFetch, user, setUser]);

  const handleUpgrade = async (targetLevel: number) => {
    setUpgrading(targetLevel);
    try {
      const res = await apiFetch("/api/membership/upgrade", {
        method: "POST",
        body: JSON.stringify({ targetLevel }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || `Upgraded to ${data.tier?.name}!`);
        if (data.user) {
          setUser({
            id: data.user.id,
            uid: data.user.uid,
            email: data.user.email,
            name: data.user.name,
            phone: data.user.phone,
            country: data.user.country,
            role: data.user.role,
            status: data.user.status,
            kycStatus: data.user.kycStatus,
            balance: data.user.balance,
            vipLevel: data.user.vipLevel,
            invitationCode: data.user.invitationCode,
            referralCode: data.user.referralCode,
            linkedSubAgentId: data.user.linkedSubAgentId,
            mustChangePassword: data.user.mustChangePassword,
            registeredAt: data.user.registeredAt,
            lastLoginAt: data.user.lastLoginAt,
          });
        }
        setRefreshKey((k) => k + 1);
      } else {
        toast.error(data.error || "Upgrade failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setUpgrading(null);
    }
  };

  const getTierState = (tier: MembershipTier):
    | { kind: "current" }
    | { kind: "achieved" }
    | { kind: "available" }
    | { kind: "locked-balance"; need: number }
    | { kind: "locked-order"; nextName: string } => {
    if (tier.level === vipLevel) return { kind: "current" };
    if (tier.level < vipLevel) return { kind: "achieved" };
    if (balance < tier.minBalance) {
      return { kind: "locked-balance", need: tier.minBalance - balance };
    }
    if (tier.level > vipLevel + 1) {
      return { kind: "locked-order", nextName: getTierByLevel(vipLevel + 1).name };
    }
    return { kind: "available" };
  };

  return (
    <main className="flex-1 pt-16 bx-fade-in bx-grid-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="h-6 w-6 text-[#FFD700]" />
            <span className="bx-text-gradient">Membership Levels</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Unlock higher payouts, lower fees, and premium features as your balance grows.
          </p>
        </motion.div>

        {/* Current tier + balance summary */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bx-glass rounded-xl p-5 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="flex items-center gap-3">
            <div
              className="h-14 w-14 rounded-xl flex items-center justify-center text-2xl"
              style={{
                background: `${currentTier.color}22`,
                border: `1px solid ${currentTier.color}55`,
              }}
            >
              {currentTier.icon}
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
                Current Tier
              </div>
              <div className="text-lg font-bold" style={{ color: currentTier.color }}>
                {currentTier.name}
              </div>
              <Badge
                variant="outline"
                className="text-[10px] mt-0.5 border-white/10 text-muted-foreground"
              >
                Level {currentTier.level}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3 md:border-l md:border-white/5 md:pl-5">
            <div className="h-14 w-14 rounded-xl bg-[#2196f3]/15 border border-[#2196f3]/30 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-[#2196f3]" />
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
                Current Balance
              </div>
              <div className="text-lg font-mono font-bold">
                {fmtUsd(balance)}
              </div>
              <div className="text-[10px] text-muted-foreground">
                Updated in real time
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 md:border-l md:border-white/5 md:pl-5">
            <div
              className="h-14 w-14 rounded-xl flex items-center justify-center text-2xl"
              style={{
                background: `${highestEligible.color}22`,
                border: `1px solid ${highestEligible.color}55`,
              }}
            >
              {highestEligible.icon}
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
                Highest Eligible
              </div>
              <div
                className="text-lg font-bold"
                style={{ color: highestEligible.color }}
              >
                {highestEligible.name}
              </div>
              {highestEligible.level > vipLevel ? (
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <ArrowUp className="h-3 w-3" />
                  Ready to upgrade
                </div>
              ) : (
                <div className="text-[10px] text-muted-foreground">
                  {nextTier
                    ? `Need ${fmtUsd(nextTier.minBalance)} for ${nextTier.name}`
                    : "Top tier reached"}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tier cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {MEMBERSHIP_TIERS.map((tier, i) => {
            const state = getTierState(tier);
            const isCurrent = state.kind === "current";
            const isAvailable = state.kind === "available";
            const isAchieved = state.kind === "achieved";
            const isLocked = state.kind === "locked-balance" || state.kind === "locked-order";

            return (
              <motion.div
                key={tier.level}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`relative rounded-xl p-5 flex flex-col ${
                  isCurrent ? "bx-glow" : ""
                }`}
                style={{
                  background: isCurrent
                    ? `linear-gradient(180deg, ${tier.color}22, rgba(13, 20, 38, 0.6))`
                    : "rgba(13, 20, 38, 0.6)",
                  backdropFilter: "blur(20px)",
                  border: `1px solid ${isCurrent ? tier.color : "rgba(255, 255, 255, 0.08)"}`,
                }}
              >
                {/* Status badge */}
                <div className="absolute -top-2 right-3">
                  {isCurrent && (
                    <Badge
                      className="bg-[#2196f3] text-white border-0 text-[10px]"
                      style={{ boxShadow: `0 0 10px ${tier.color}55` }}
                    >
                      CURRENT
                    </Badge>
                  )}
                  {isAchieved && (
                    <Badge
                      variant="outline"
                      className="border-white/15 text-muted-foreground bg-[#0a1322] text-[10px]"
                    >
                      ACHIEVED
                    </Badge>
                  )}
                  {isLocked && (
                    <Badge
                      variant="outline"
                      className="border-white/15 text-muted-foreground bg-[#0a1322] text-[10px]"
                    >
                      LOCKED
                    </Badge>
                  )}
                  {isAvailable && (
                    <Badge
                      variant="outline"
                      className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-[10px]"
                    >
                      AVAILABLE
                    </Badge>
                  )}
                </div>

                {/* Tier icon + name */}
                <div className="flex items-center gap-2 mb-3 mt-1">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ background: `${tier.color}22` }}
                  >
                    {tier.icon}
                  </div>
                  <div>
                    <div className="text-base font-bold" style={{ color: tier.color }}>
                      {tier.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Level {tier.level}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-2 mb-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Min Balance</span>
                    <span className="font-mono font-semibold">
                      {tier.minBalance === 0 ? "Free" : fmtUsd(tier.minBalance)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Zap className="h-3 w-3 text-[#FFD700]" />
                      Payout Bonus
                    </span>
                    <span className="font-mono font-semibold text-emerald-400">
                      +{fmtPct(tier.payoutBonus)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Shield className="h-3 w-3 text-[#2196f3]" />
                      Fee Discount
                    </span>
                    <span className="font-mono font-semibold text-[#42a5f5]">
                      {fmtPct(tier.tradeFeeDiscount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Max Trade</span>
                    <span className="font-mono font-semibold">
                      {fmtUsd(tier.maxTradeAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Headset className="h-3 w-3" />
                      Priority Support
                    </span>
                    {tier.prioritySupport ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Check className="h-3 w-3" /> Yes
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </div>

                {/* Benefits */}
                <div className="border-t border-white/5 pt-3 mb-4 flex-1">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">
                    Benefits
                  </div>
                  <ul className="space-y-1.5 text-[11px] max-h-44 overflow-y-auto pr-1">
                    {tier.benefits.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-foreground/90">
                        <Check
                          className="h-3 w-3 mt-0.5 shrink-0"
                          style={{ color: tier.color }}
                        />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action button */}
                <div className="mt-auto">
                  {isCurrent && (
                    <Button
                      disabled
                      className="w-full bg-white/5 text-foreground border border-white/10 cursor-default"
                    >
                      <Crown className="h-4 w-4 mr-1" style={{ color: tier.color }} />
                      Your Tier
                    </Button>
                  )}
                  {isAvailable && (
                    <Button
                      onClick={() => handleUpgrade(tier.level)}
                      disabled={upgrading !== null}
                      className="w-full bx-blue-gradient bx-glow text-white border-0"
                    >
                      {upgrading === tier.level ? (
                        "Upgrading..."
                      ) : (
                        <>
                          <ArrowUp className="h-4 w-4 mr-1" />
                          Upgrade to {tier.name}
                        </>
                      )}
                    </Button>
                  )}
                  {state.kind === "locked-balance" && (
                    <div className="w-full text-center px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-xs text-muted-foreground flex flex-col items-center gap-1">
                      <Lock className="h-3.5 w-3.5" />
                      <span>
                        Need{" "}
                        <span className="font-mono font-semibold text-foreground">
                          {fmtUsd(state.need)}
                        </span>{" "}
                        more
                      </span>
                    </div>
                  )}
                  {state.kind === "locked-order" && (
                    <div className="w-full text-center px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-xs text-muted-foreground flex flex-col items-center gap-1">
                      <Lock className="h-3.5 w-3.5" />
                      <span>
                        Upgrade to{" "}
                        <span className="font-semibold text-foreground">
                          {state.nextName}
                        </span>{" "}
                        first
                      </span>
                    </div>
                  )}
                  {isAchieved && (
                    <Button
                      disabled
                      className="w-full bg-white/5 text-muted-foreground border border-white/10 cursor-default"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Achieved
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Why upgrade section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bx-glass rounded-xl p-5 mt-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="h-9 w-9 rounded-lg bx-blue-gradient flex items-center justify-center">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Why upgrade your membership?</h2>
              <p className="text-xs text-muted-foreground">
                Higher tiers unlock exponential value as you grow your portfolio.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-lg p-4 bg-white/5 border border-white/5">
              <Zap className="h-5 w-5 text-[#FFD700] mb-2" />
              <div className="text-sm font-semibold mb-1">Bonus Payouts</div>
              <p className="text-xs text-muted-foreground">
                Earn up to <span className="text-emerald-400 font-semibold">+10%</span> extra
                on every winning trade. Higher tiers compound your gains faster.
              </p>
            </div>
            <div className="rounded-lg p-4 bg-white/5 border border-white/5">
              <Shield className="h-5 w-5 text-[#2196f3] mb-2" />
              <div className="text-sm font-semibold mb-1">Fee Discounts</div>
              <p className="text-xs text-muted-foreground">
                Cut trade fees by up to{" "}
                <span className="text-[#42a5f5] font-semibold">100%</span>. Diamond members
                trade with zero fees.
              </p>
            </div>
            <div className="rounded-lg p-4 bg-white/5 border border-white/5">
              <TrendingUp className="h-5 w-5 text-emerald-400 mb-2" />
              <div className="text-sm font-semibold mb-1">Larger Trades</div>
              <p className="text-xs text-muted-foreground">
                Raise your max trade size from{" "}
                <span className="font-mono">$1,000</span> all the way to{" "}
                <span className="font-mono">$1,000,000</span> per position.
              </p>
            </div>
            <div className="rounded-lg p-4 bg-white/5 border border-white/5">
              <Headset className="h-5 w-5 text-[#42a5f5] mb-2" />
              <div className="text-sm font-semibold mb-1">Priority Support</div>
              <p className="text-xs text-muted-foreground">
                Gold and above get priority chat, dedicated managers, and 24/7 access
                to senior support staff.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 text-xs text-muted-foreground">
            <strong className="text-foreground">How it works:</strong> Your tier is determined by
            your account balance. When your balance meets the threshold for the next tier, you
            can upgrade instantly — no applications, no waiting. Upgrades happen one tier at a
            time. Tiers are evaluated in real time and never expire.
          </div>
        </motion.div>
      </div>
    </main>
  );
}

export default MembershipView;
