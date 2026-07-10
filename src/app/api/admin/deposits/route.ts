import { NextRequest, NextResponse } from "next/server";
import { requireRole, logAction } from "@/lib/api-auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireRole(req, "SUPER_ADMIN");
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "PENDING";

    const where: any = { type: "DEPOSIT" };
    if (status !== "ALL") where.status = status;

    const deposits = await db.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { id: true, uid: true, name: true, email: true } } },
    });

    return NextResponse.json({ deposits });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireRole(req, "SUPER_ADMIN");
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { transactionId, action } = await req.json();
    if (!transactionId || !action) return NextResponse.json({ error: "transactionId + action required" }, { status: 400 });

    const tx = await db.transaction.findUnique({ where: { id: transactionId } });
    if (!tx || tx.type !== "DEPOSIT") return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    if (tx.status !== "PENDING") return NextResponse.json({ error: "Already processed" }, { status: 400 });

    if (action === "APPROVE") {
      await db.$transaction([
        db.transaction.update({ where: { id: transactionId }, data: { status: "APPROVED", processedAt: new Date() } }),
        db.user.update({ where: { id: tx.userId }, data: { balance: { increment: tx.amount } } }),
      ]);
      await db.notification.create({ data: { userId: tx.userId, title: "Deposit Approved", body: `Your deposit of $${tx.amount} has been approved.`, type: "success" } });
    } else if (action === "REJECT") {
      await db.transaction.update({ where: { id: transactionId }, data: { status: "REJECTED", processedAt: new Date() } });
      await db.notification.create({ data: { userId: tx.userId, title: "Deposit Rejected", body: `Your deposit of $${tx.amount} was rejected.`, type: "warning" } });
    }

    await logAction(admin.id, `DEPOSIT_${action}`, req, { type: "transaction", id: transactionId });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
