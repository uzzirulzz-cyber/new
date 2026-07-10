import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, logAction } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { MEMBERSHIP_TIERS, getTierByLevel } from "@/lib/membership";

// POST /api/membership/upgrade — upgrade user's membership to a higher tier
// Body: { targetLevel: number }
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "CUSTOMER") return NextResponse.json({ error: "Only customers can upgrade" }, { status: 403 });

    const { targetLevel } = await req.json();
    if (!targetLevel) return NextResponse.json({ error: "targetLevel required" }, { status: 400 });

    const targetTier = MEMBERSHIP_TIERS.find(t => t.level === targetLevel);
    if (!targetTier) return NextResponse.json({ error: "Invalid tier" }, { status: 400 });

    if (targetLevel <= user.vipLevel) {
      return NextResponse.json({ error: "Can only upgrade to a higher tier" }, { status: 400 });
    }

    // Check if user meets the balance requirement
    const dbUser = await db.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (dbUser.balance < targetTier.minBalance) {
      return NextResponse.json({
        error: `Insufficient balance for ${targetTier.name} tier. Required: $${targetTier.minBalance.toLocaleString()}`,
      }, { status: 400 });
    }

    // Check if trying to skip tiers (must upgrade one level at a time)
    if (targetLevel > user.vipLevel + 1) {
      return NextResponse.json({
        error: `Please upgrade to ${getTierByLevel(user.vipLevel + 1).name} first`,
      }, { status: 400 });
    }

    // Upgrade
    await db.user.update({
      where: { id: user.id },
      data: { vipLevel: targetLevel },
    });

    // Notification
    await db.notification.create({
      data: {
        userId: user.id,
        title: `Membership Upgraded to ${targetTier.name}! ${targetTier.icon}`,
        body: `Congratulations! You are now a ${targetTier.name} member. Enjoy ${targetTier.payoutBonus * 100}% bonus payouts, ${(targetTier.tradeFeeDiscount * 100)}% fee discount, and more benefits.`,
        type: "success",
      },
    });

    // Audit log
    await logAction(user.id, "MEMBERSHIP_UPGRADE", req, { type: "user", id: user.id }, JSON.stringify({ from: user.vipLevel, to: targetLevel }));

    const updatedUser = await db.user.findUnique({ where: { id: user.id } });

    return NextResponse.json({
      success: true,
      message: `Upgraded to ${targetTier.name}!`,
      tier: targetTier,
      user: {
        ...updatedUser,
        passwordHash: undefined,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
