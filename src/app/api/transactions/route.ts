import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateTxId } from "@/lib/auth";

// GET /api/transactions — list user's transactions
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const limit = Math.min(Number(searchParams.get("limit") || 50), 200);

    const where: any = { userId: user.id };
    if (type) where.type = type;
    if (status) where.status = status;

    const transactions = await db.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ transactions });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/transactions — create a deposit / withdrawal / transfer request
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { type, amount, method, destination, reference, note } = await req.json();

    if (!type || !amount) {
      return NextResponse.json({ error: "type and amount required" }, { status: 400 });
    }

    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // ─── Withdrawals & transfers: check balance ────────────────
    if (type === "WITHDRAWAL" || type === "TRANSFER") {
      const wallet = await db.wallet.findUnique({ where: { userId: user.id } });
      if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

      const fee = type === "WITHDRAWAL" ? amt * 0.01 : 0; // 1% withdrawal fee
      if (wallet.available < amt + fee) {
        return NextResponse.json(
          { error: `Insufficient balance. Available: $${wallet.available.toFixed(2)}` },
          { status: 400 }
        );
      }

      // Lock the funds immediately
      await db.wallet.update({
        where: { userId: user.id },
        data: {
          available: { decrement: amt + fee },
          frozen: { increment: amt + fee },
        },
      });

      const tx = await db.transaction.create({
        data: {
          txId: generateTxId("TXN"),
          userId: user.id,
          type,
          amount: amt,
          fee,
          status: "PENDING",
          method: method || null,
          destination: destination || null,
          reference: reference || null,
          note: note || null,
        },
      });

      return NextResponse.json({ success: true, transaction: tx });
    }

    // ─── Deposits: create pending request for admin approval ───
    if (type === "DEPOSIT") {
      const tx = await db.transaction.create({
        data: {
          txId: generateTxId("TXN"),
          userId: user.id,
          type,
          amount: amt,
          status: "PENDING",
          method: method || "bank",
          reference: reference || null,
          note: note || null,
        },
      });

      // Notify user
      await db.notification.create({
        data: {
          userId: user.id,
          title: "Deposit Request Submitted",
          message: `Your deposit of $${amt.toFixed(2)} via ${method || "bank"} is pending review. You'll be notified once processed.`,
          type: "info",
        },
      });

      return NextResponse.json({ success: true, transaction: tx });
    }

    return NextResponse.json({ error: "Invalid transaction type" }, { status: 400 });
  } catch (e: any) {
    console.error("Transaction error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
