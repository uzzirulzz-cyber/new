import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, generateTxId } from "@/lib/auth";
import { db } from "@/lib/db";
import { marketPairs } from "@/lib/dashboard-data";

// Profit percentages by duration
const PROFIT_MAP: Record<number, number> = {
  30: 20,
  60: 30,
  120: 50,
};

// ─── GET /api/trades — list user's trades ──────────────────────
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // "ACTIVE" | "SETTLED"
    const limit = Math.min(Number(searchParams.get("limit") || 50), 200);

    const where: any = { userId: user.id };
    if (status) where.status = status;

    const trades = await db.trade.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ trades });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ─── POST /api/trades — place a new trade ──────────────────────
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (user.status === "FROZEN") {
      return NextResponse.json({ error: "Account frozen. Contact support." }, { status: 403 });
    }

    const { coin, direction, amount, duration } = await req.json();

    // ─── Validate inputs ───────────────────────────────────────
    if (!coin || !direction || !amount || !duration) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (direction !== "UP" && direction !== "DOWN") {
      return NextResponse.json({ error: "Direction must be UP or DOWN" }, { status: 400 });
    }

    if (!PROFIT_MAP[duration]) {
      return NextResponse.json(
        { error: "Invalid duration. Must be 30, 60, or 120 seconds" },
        { status: 400 }
      );
    }

    const pair = marketPairs.find((p) => p.base === coin);
    if (!pair) {
      return NextResponse.json({ error: "Unsupported coin" }, { status: 400 });
    }

    const investAmount = Number(amount);
    if (!Number.isFinite(investAmount) || investAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (investAmount < 10) {
      return NextResponse.json({ error: "Minimum trade amount is $10" }, { status: 400 });
    }

    // ─── Check wallet balance ──────────────────────────────────
    const wallet = await db.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

    if (wallet.available < investAmount) {
      return NextResponse.json(
        { error: `Insufficient balance. Available: $${wallet.available.toFixed(2)}` },
        { status: 400 }
      );
    }

    // ─── Prevent duplicate active trades (one at a time) ───────
    const activeTrade = await db.trade.findFirst({
      where: { userId: user.id, status: "ACTIVE" },
    });
    if (activeTrade) {
      return NextResponse.json(
        {
          error: "You have an active trade. Wait for it to settle.",
          activeTradeId: activeTrade.tradeId,
        },
        { status: 409 }
      );
    }

    // ─── Lock funds: move from available to frozen ─────────────
    const profitPercent = PROFIT_MAP[duration];
    const entryPrice = pair.lastPrice;
    const tradeId = generateTxId("TRD");

    const [updatedWallet, trade] = await db.$transaction([
      db.wallet.update({
        where: { userId: user.id },
        data: {
          available: { decrement: investAmount },
          frozen: { increment: investAmount },
        },
      }),
      db.trade.create({
        data: {
          tradeId,
          userId: user.id,
          coin,
          direction,
          amount: investAmount,
          duration,
          profitPercent,
          entryPrice,
          status: "ACTIVE",
        },
      }),
    ]);

    // Record the investment transaction
    await db.transaction.create({
      data: {
        txId: generateTxId("TXN"),
        userId: user.id,
        type: "TRADE_INVEST",
        amount: investAmount,
        status: "SUCCESSFUL",
        note: `Trade ${tradeId}: ${direction === "UP" ? "Buy Up" : "Buy Down"} ${coin} for ${duration}s`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Trade Successfully Placed",
      trade: {
        id: trade.id,
        tradeId: trade.tradeId,
        coin: trade.coin,
        direction: trade.direction,
        amount: trade.amount,
        duration: trade.duration,
        profitPercent: trade.profitPercent,
        entryPrice: trade.entryPrice,
        status: trade.status,
        createdAt: trade.createdAt,
        expiresAt: new Date(trade.createdAt.getTime() + duration * 1000),
      },
      wallet: {
        available: updatedWallet.available,
        frozen: updatedWallet.frozen,
      },
    });
  } catch (e: any) {
    console.error("Place trade error:", e);
    return NextResponse.json({ error: e.message || "Failed to place trade" }, { status: 500 });
  }
}
