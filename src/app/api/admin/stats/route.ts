import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireRole(req, "SUPER_ADMIN");
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(todayStart);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [
      totalUsers, activeUsers, totalTrades, activeTrades,
      totalDeposits, totalWithdrawals, todayDeposits, todayWithdrawals,
      allTrades, allDeposits, allWithdrawals,
    ] = await Promise.all([
      db.user.count({ where: { role: "CUSTOMER" } }),
      db.user.count({ where: { role: "CUSTOMER", status: "ACTIVE" } }),
      db.trade.count(),
      db.trade.count({ where: { status: "ACTIVE" } }),
      db.transaction.aggregate({ where: { type: "DEPOSIT", status: "APPROVED" }, _sum: { amount: true } }),
      db.transaction.aggregate({ where: { type: "WITHDRAWAL", status: "APPROVED" }, _sum: { amount: true } }),
      db.transaction.aggregate({ where: { type: "DEPOSIT", status: "APPROVED", createdAt: { gte: todayStart } }, _sum: { amount: true } }),
      db.transaction.aggregate({ where: { type: "WITHDRAWAL", status: "APPROVED", createdAt: { gte: todayStart } }, _sum: { amount: true } }),
      db.trade.findMany({ where: { status: "SETTLED" }, select: { profit: true, createdAt: true } }),
      db.transaction.findMany({ where: { type: "DEPOSIT", createdAt: { gte: weekAgo } }, select: { amount: true, createdAt: true } }),
      db.transaction.findMany({ where: { type: "WITHDRAWAL", createdAt: { gte: weekAgo } }, select: { amount: true, createdAt: true } }),
    ]);

    const revenue = allTrades.reduce((s, t) => s + (t.profit < 0 ? -t.profit : 0), 0);
    const winningTrades = allTrades.filter(t => t.profit > 0).length;
    const losingTrades = allTrades.filter(t => t.profit <= 0).length;

    // Revenue series (last 7 days)
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const revenueSeries = days.map((day, i) => {
      const dayStart = new Date(weekAgo);
      dayStart.setDate(dayStart.getDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const dayRevenue = allTrades
        .filter(t => t.createdAt >= dayStart && t.createdAt < dayEnd && t.profit < 0)
        .reduce((s, t) => s + -t.profit, 0);
      return { date: day, revenue: Math.round(dayRevenue * 100) / 100 };
    });

    // Coin volume (top 5 by trade count)
    const coinCounts: Record<string, number> = {};
    allTrades.forEach(() => {}); // Would need symbol from trade query
    const coinVolume = await db.trade.groupBy({
      by: ["symbol"],
      _count: true,
      orderBy: { _count: { symbol: "desc" } },
      take: 5,
    });

    return NextResponse.json({
      stats: {
        totalUsers, activeUsers, totalTrades, activeTrades,
        totalDeposits: totalDeposits._sum.amount || 0,
        totalWithdrawals: totalWithdrawals._sum.amount || 0,
        todayDeposits: todayDeposits._sum.amount || 0,
        todayWithdrawals: todayWithdrawals._sum.amount || 0,
        revenue: Math.round(revenue * 100) / 100,
        winningTrades, losingTrades,
        totalAgents: await db.user.count({ where: { role: "SUB_AGENT" } }),
      },
      revenueSeries,
      coinVolume: coinVolume.map(c => ({ symbol: c.symbol, count: c._count })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
