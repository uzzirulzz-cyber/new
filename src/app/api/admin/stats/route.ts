import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/admin/stats — admin dashboard statistics
export async function GET() {
  try {
    const admin = await requireAdmin();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      activeUsers,
      pendingUsers,
      bannedUsers,
      totalAgents,
      totalDeposits,
      totalWithdrawals,
      pendingDeposits,
      pendingWithdrawals,
      totalTrades,
      activeTrades,
      winningTrades,
      losingTrades,
      todayTrades,
      totalVolume,
      frozenFunds,
      pendingApprovals,
      recentUsers,
      userGrowth,
      dailyActivity,
    ] = await Promise.all([
      db.user.count({ where: { role: "USER" } }),
      db.user.count({ where: { role: "USER", status: "ACTIVE" } }),
      db.user.count({ where: { role: "USER", status: "PENDING" } }),
      db.user.count({ where: { role: "USER", status: "BANNED" } }),
      db.user.count({ where: { role: "AGENT" } }),
      db.transaction.aggregate({
        where: { type: "DEPOSIT", status: "SUCCESSFUL" },
        _sum: { amount: true },
      }),
      db.transaction.aggregate({
        where: { type: "WITHDRAWAL", status: "SUCCESSFUL" },
        _sum: { amount: true },
      }),
      db.transaction.count({ where: { type: "DEPOSIT", status: "PENDING" } }),
      db.transaction.count({ where: { type: "WITHDRAWAL", status: "PENDING" } }),
      db.trade.count(),
      db.trade.count({ where: { status: "ACTIVE" } }),
      db.trade.count({ where: { result: "WIN" } }),
      db.trade.count({ where: { result: "LOSS" } }),
      db.trade.count({ where: { createdAt: { gte: todayStart } } }),
      db.trade.aggregate({ _sum: { amount: true } }),
      db.wallet.aggregate({ _sum: { frozen: true } }),
      db.transaction.count({ where: { status: "PENDING" } }),
      db.user.findMany({
        where: { role: "USER" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, uid: true, name: true, email: true, createdAt: true, status: true },
      }),
      // User growth over last 7 days
      db.user.groupBy({
        by: ["createdAt"],
        where: { createdAt: { gte: weekStart } },
        _count: true,
      }),
      // Daily trades over last 7 days
      db.trade.groupBy({
        by: ["createdAt"],
        where: { createdAt: { gte: weekStart } },
        _count: true,
      }),
    ]);

    // Platform revenue = sum of losing trades (house keeps the investment)
    const platformRevenue = await db.trade.aggregate({
      where: { result: "LOSS" },
      _sum: { amount: true },
    });

    // Total profits paid to users
    const totalProfitsPaid = await db.trade.aggregate({
      where: { result: "WIN" },
      _sum: { profit: true },
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        activeUsers,
        pendingUsers,
        bannedUsers,
        totalAgents,
        totalDeposits: totalDeposits._sum.amount || 0,
        totalWithdrawals: totalWithdrawals._sum.amount || 0,
        pendingDeposits,
        pendingWithdrawals,
        totalTrades,
        activeTrades,
        winningTrades,
        losingTrades,
        todayTrades,
        totalVolume: totalVolume._sum.amount || 0,
        platformRevenue: platformRevenue._sum.amount || 0,
        totalProfitsPaid: totalProfitsPaid._sum.profit || 0,
        frozenFunds: frozenFunds._sum.frozen || 0,
        pendingApprovals,
      },
      recentUsers,
      admin: { uid: admin.uid, name: admin.name, role: admin.role },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
