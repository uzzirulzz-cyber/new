import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, generateTxId } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { getCoin } from "@/lib/market-data";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { tradeId } = await req.json();
    if (!tradeId) return NextResponse.json({ error: "tradeId required" }, { status: 400 });

    const trade = await db.trade.findFirst({ where: { tradeId, userId: user.id } });
    if (!trade) return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    if (trade.status === "SETTLED") return NextResponse.json({ error: "Already settled", trade }, { status: 409 });

    // Check if enough time has passed
    const elapsed = (Date.now() - trade.createdAt.getTime()) / 1000;
    if (elapsed < trade.duration) {
      return NextResponse.json({ error: `Not expired yet. ${Math.ceil(trade.duration - elapsed)}s remaining.` }, { status: 400 });
    }

    const coin = getCoin(trade.symbol);
    if (!coin) return NextResponse.json({ error: "Coin no longer available" }, { status: 400 });

    // Determine win/lose
    const exitPrice = coin.basePrice * (1 + (Math.random() - 0.5) * 0.012);
    const priceUp = exitPrice > trade.entryPrice;
    const won = trade.direction === "UP" ? priceUp : !priceUp;
    const profit = won ? trade.amount * trade.payoutRate : -trade.amount;

    // Settle
    await db.$transaction([
      db.trade.update({
        where: { id: trade.id },
        data: {
          status: "SETTLED",
          result: won ? "WIN" : "LOSE",
          exitPrice,
          profit,
          settledAt: new Date(),
        },
      }),
      db.user.update({
        where: { id: user.id },
        data: won ? { balance: { increment: trade.amount + profit } } : {},
      }),
      db.transaction.create({
        data: {
          txId: generateTxId("TXN"),
          userId: user.id,
          type: won ? "TRADE_PROFIT" : "TRADE_LOSE",
          amount: won ? trade.amount + profit : trade.amount,
          status: "APPROVED",
          reference: trade.tradeId,
        },
      }),
    ]);

    const settled = await db.trade.findUnique({ where: { id: trade.id } });
    const updatedUser = await db.user.findUnique({ where: { id: user.id } });

    return NextResponse.json({
      success: true,
      trade: settled,
      balance: updatedUser?.balance,
    });
  } catch (e: any) {
    console.error("Settle error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
