import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/agent/stats — agent-scoped statistics (only their customers)
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "AGENT") return NextResponse.json({ error: "Forbidden: agent access required" }, { status: 403 });

    // All customers referred by this agent
    const customers = await db.user.findMany({
      where: { referredById: user.id, role: "USER" },
      select: { id: true },
    });
    const customerIds = customers.map((c) => c.id);

    const [
      totalCustomers,
      activeCustomers,
      pendingDeposits,
      pendingWithdrawals,
      totalDeposits,
      totalWithdrawals,
      totalTrades,
      activeTrades,
      winningTrades,
      losingTrades,
      commissionEarned,
      customerWallets,
    ] = await Promise.all([
      db.user.count({ where: { referredById: user.id, role: "USER" } }),
      db.user.count({ where: { referredById: user.id, role: "USER", status: "ACTIVE" } }),
      db.transaction.count({
        where: { type: "DEPOSIT", status: "PENDING", userId: { in: customerIds } },
      }),
      db.transaction.count({
        where: { type: "WITHDRAWAL", status: "PENDING", userId: { in: customerIds } },
      }),
      db.transaction.aggregate({
        where: { type: "DEPOSIT", status: "SUCCESSFUL", userId: { in: customerIds } },
        _sum: { amount: true },
      }),
      db.transaction.aggregate({
        where: { type: "WITHDRAWAL", status: "SUCCESSFUL", userId: { in: customerIds } },
        _sum: { amount: true },
      }),
      db.trade.count({ where: { userId: { in: customerIds } } }),
      db.trade.count({ where: { userId: { in: customerIds }, status: "ACTIVE" } }),
      db.trade.count({ where: { userId: { in: customerIds }, result: "WIN" } }),
      db.trade.count({ where: { userId: { in: customerIds }, result: "LOSS" } }),
      db.agent.findUnique({ where: { userId: user.id } }),
      db.wallet.findMany({
        where: { userId: { in: customerIds } },
        select: { available: true, frozen: true, totalProfit: true },
      }),
    ]);

    const totalCustomerBalance = customerWallets.reduce((s, w) => s + w.available + w.frozen, 0);
    const totalCustomerProfit = customerWallets.reduce((s, w) => s + w.totalProfit, 0);

    return NextResponse.json({
      stats: {
        totalCustomers,
        activeCustomers,
        invitationCode: user.referralCode,
        pendingDeposits,
        pendingWithdrawals,
        totalDeposits: totalDeposits._sum.amount || 0,
        totalWithdrawals: totalWithdrawals._sum.amount || 0,
        totalTrades,
        activeTrades,
        winningTrades,
        losingTrades,
        commissionRate: commissionEarned?.commissionRate || 0,
        totalCommission: commissionEarned?.totalCommission || 0,
        totalReferrals: commissionEarned?.totalReferrals || 0,
        customerBalance: totalCustomerBalance,
        customerProfit: totalCustomerProfit,
      },
      agent: {
        uid: user.uid,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
