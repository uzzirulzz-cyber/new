import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getTierByLevel, getHighestEligibleTier, MEMBERSHIP_TIERS } from "@/lib/membership";

// GET /api/membership/current — returns user's current tier + eligible upgrades
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentTier = getTierByLevel(user.vipLevel);
    const highestEligible = getHighestEligibleTier(user.balance);
    const canUpgrade = highestEligible.level > user.vipLevel;
    const allTiers = MEMBERSHIP_TIERS;

    return NextResponse.json({
      current: currentTier,
      highestEligible,
      canUpgrade,
      nextTier: canUpgrade ? allTiers.find(t => t.level === user.vipLevel + 1) : null,
      allTiers,
      userBalance: user.balance,
      userVipLevel: user.vipLevel,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
