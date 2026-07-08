import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/wallet — current user's wallet + recent transactions
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const wallet = await db.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

    const transactions = await db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      wallet: {
        available: wallet.available,
        frozen: wallet.frozen,
        totalProfit: wallet.totalProfit,
        todayProfit: wallet.todayProfit,
        totalAssets: wallet.available + wallet.frozen,
      },
      transactions: transactions.map((t) => ({
        id: t.id,
        txId: t.txId,
        type: t.type,
        amount: t.amount,
        fee: t.fee,
        status: t.status,
        method: t.method,
        reference: t.reference,
        destination: t.destination,
        note: t.note,
        createdAt: t.createdAt,
        processedAt: t.processedAt,
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
