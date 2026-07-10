import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, generateTxId } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { COINS, TRADE_OPTIONS, getCoin } from "@/lib/market-data";
import { getTierByLevel } from "@/lib/membership";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "CUSTOMER") return NextResponse.json({ error: "Only customers can trade" }, { status: 403 });

    const { symbol, direction, duration, amount } = await req.json();
    if (!symbol || !direction || !duration || !amount) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    if (direction !== "UP" && direction !== "DOWN") {
      return NextResponse.json({ error: "Direction must be UP or DOWN" }, { status: 400 });
    }

    const opt = TRADE_OPTIONS.find((o) => o.duration === duration);
    if (!opt) return NextResponse.json({ error: "Invalid duration" }, { status: 400 });

    const coin = getCoin(symbol);
    if (!coin) return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });

    const investAmount = Number(amount);
    if (!Number.isFinite(investAmount) || investAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const dbUser = await db.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (dbUser.balance < investAmount) {
      return NextResponse.json({ error: `Insufficient balance. Available: ${dbUser.balance}` }, { status: 400 });
    }

    // Apply membership tier benefits
    const tier = getTierByLevel(dbUser.vipLevel);
    if (investAmount > tier.maxTradeAmount) {
      return NextResponse.json({ error: `${tier.name} tier max trade: $${tier.maxTradeAmount.toLocaleString()}. Upgrade your membership for higher limits.` }, { status: 400 });
    }

    // Apply payout bonus from membership tier
    const effectivePayoutRate = opt.payoutRate + tier.payoutBonus;

    // Check for active trades (one at a time)
    const activeTrade = await db.trade.findFirst({ where: { userId: user.id, status: "ACTIVE" } });
    if (activeTrade) {
      return NextResponse.json({ error: "You have an active trade. Wait for it to settle." }, { status: 409 });
    }

    const entryPrice = coin.basePrice * (1 + (Math.random() - 0.5) * 0.004);
    const tradeId = generateTxId("TRD");

    // Deduct balance + create trade
    const [trade] = await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: { balance: { decrement: investAmount } },
      }),
      db.trade.create({
        data: {
          tradeId,
          userId: user.id,
          symbol,
          direction,
          amount: investAmount,
          duration,
          entryPrice,
          payoutRate: effectivePayoutRate,
          status: "ACTIVE",
          result: "PENDING",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Trade placed successfully",
      trade: {
        id: trade.id,
        tradeId: trade.tradeId,
        symbol: trade.symbol,
        direction: trade.direction,
        amount: trade.amount,
        duration: trade.duration,
        entryPrice: trade.entryPrice,
        payoutRate: trade.payoutRate,
        status: trade.status,
        createdAt: trade.createdAt,
        expiresAt: new Date(trade.createdAt.getTime() + duration * 1000),
      },
    });
  } catch (e: any) {
    console.error("Trade execute error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
