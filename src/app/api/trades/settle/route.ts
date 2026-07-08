import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { marketPairs } from "@/lib/dashboard-data";

// POST /api/trades/settle — settle a trade after countdown expires
// Determines win/loss by comparing entry price to current market price.
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { tradeId } = await req.json();
    if (!tradeId) return NextResponse.json({ error: "tradeId required" }, { status: 400 });

    const trade = await db.trade.findFirst({
      where: { tradeId, userId: user.id },
    });
    if (!trade) return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    if (trade.status === "SETTLED") {
      return NextResponse.json({ error: "Trade already settled", trade }, { status: 409 });
    }
    if (trade.status === "CANCELLED") {
      return NextResponse.json({ error: "Trade cancelled" }, { status: 400 });
    }

    // ─── Check if enough time has passed ───────────────────────
    const elapsed = (Date.now() - trade.createdAt.getTime()) / 1000;
    if (elapsed < trade.duration) {
      return NextResponse.json(
        { error: `Trade not expired yet. ${Math.ceil(trade.duration - elapsed)}s remaining.` },
        { status: 400 }
      );
    }

    // ─── Get current market price ──────────────────────────────
    const pair = marketPairs.find((p) => p.base === trade.coin);
    if (!pair) return NextResponse.json({ error: "Coin no longer available" }, { status: 400 });

    // Simulate a small price movement from entry
    // In production this would be the real live price at expiry
    const drift = (Math.random() - 0.5) * pair.lastPrice * 0.004;
    const exitPrice = pair.lastPrice + drift;

    // ─── Determine result ──────────────────────────────────────
    // Win = price moved in the user's predicted direction
    const priceUp = exitPrice > trade.entryPrice;
    const priceDown = exitPrice < trade.entryPrice;
    let result: "WIN" | "LOSS";
    if (trade.direction === "UP") {
      result = priceUp ? "WIN" : "LOSS";
    } else {
      result = priceDown ? "WIN" : "LOSS";
    }

    const profit = result === "WIN" ? trade.amount * (trade.profitPercent / 100) : -trade.amount;
    const now = new Date();

    // ─── Settle: update trade + wallet + transaction ───────────
    const wallet = await db.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

    const [updatedTrade, updatedWallet] = await db.$transaction([
      db.trade.update({
        where: { id: trade.id },
        data: {
          status: "SETTLED",
          result,
          exitPrice,
          profit,
          settledAt: now,
        },
      }),
      db.wallet.update({
        where: { userId: user.id },
        data: {
          // refund the frozen investment
          frozen: { decrement: trade.amount },
          // if win: add investment back + profit; if loss: investment is gone
          available: result === "WIN" ? { increment: trade.amount + profit } : { increment: 0 },
          totalProfit: { increment: profit },
          todayProfit: { increment: profit },
        },
      }),
      db.transaction.create({
        data: {
          txId: `TXN-${Date.now().toString(36).toUpperCase()}`,
          userId: user.id,
          type: result === "WIN" ? "TRADE_PROFIT" : "TRADE_LOSS",
          amount: result === "WIN" ? trade.amount + profit : trade.amount,
          status: "SUCCESSFUL",
          note: `Trade ${trade.tradeId} ${result === "WIN" ? "WON" : "LOST"} — ${trade.direction === "UP" ? "Up" : "Down"} ${trade.coin}`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      trade: {
        tradeId: updatedTrade.tradeId,
        coin: updatedTrade.coin,
        direction: updatedTrade.direction,
        amount: updatedTrade.amount,
        duration: updatedTrade.duration,
        profitPercent: updatedTrade.profitPercent,
        entryPrice: updatedTrade.entryPrice,
        exitPrice: updatedTrade.exitPrice,
        result: updatedTrade.result,
        profit: updatedTrade.profit,
        status: updatedTrade.status,
        settledAt: updatedTrade.settledAt,
      },
      wallet: {
        available: updatedWallet.available,
        frozen: updatedWallet.frozen,
        totalProfit: updatedWallet.totalProfit,
        todayProfit: updatedWallet.todayProfit,
      },
    });
  } catch (e: any) {
    console.error("Settle trade error:", e);
    return NextResponse.json({ error: e.message || "Settlement failed" }, { status: 500 });
  }
}
