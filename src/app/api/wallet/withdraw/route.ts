import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, generateTxId } from "@/lib/api-auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { amount, method, destination } = await req.json();
    if (!amount || amount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

    const dbUser = await db.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (dbUser.balance < amount) return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });

    // Lock the funds immediately
    await db.user.update({
      where: { id: user.id },
      data: { balance: { decrement: Number(amount) } },
    });

    const tx = await db.transaction.create({
      data: {
        txId: generateTxId("TXN"),
        userId: user.id,
        type: "WITHDRAWAL",
        amount: Number(amount),
        status: "PENDING",
        method: method || "bank",
        reference: destination || null,
      },
    });

    await db.notification.create({
      data: {
        userId: user.id,
        title: "Withdrawal Request Submitted",
        body: `Your withdrawal of $${amount} is pending review.`,
        type: "info",
      },
    });

    return NextResponse.json({ success: true, transaction: tx });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
