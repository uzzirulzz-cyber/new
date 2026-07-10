import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, generateTxId } from "@/lib/api-auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { amount, method, reference } = await req.json();
    if (!amount || amount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

    const tx = await db.transaction.create({
      data: {
        txId: generateTxId("TXN"),
        userId: user.id,
        type: "DEPOSIT",
        amount: Number(amount),
        status: "PENDING",
        method: method || "bank",
        reference: reference || null,
      },
    });

    await db.notification.create({
      data: {
        userId: user.id,
        title: "Deposit Request Submitted",
        body: `Your deposit of $${amount} via ${method || "bank"} is pending review.`,
        type: "info",
      },
    });

    return NextResponse.json({ success: true, transaction: tx });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
