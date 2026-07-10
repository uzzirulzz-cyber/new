import { NextRequest, NextResponse } from "next/server";
import { requireRole, logAction, generateTxId } from "@/lib/api-auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireRole(req, "SUPER_ADMIN");
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const where: any = {};
    if (userId) where.userId = userId;

    const trades = await db.trade.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { id: true, name: true, email: true, uid: true } } },
    });

    return NextResponse.json({ trades });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireRole(req, "SUPER_ADMIN");
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { action, targetUserId, amount } = await req.json();
    if (!action || !targetUserId) return NextResponse.json({ error: "action + targetUserId required" }, { status: 400 });

    const target = await db.user.findUnique({ where: { id: targetUserId } });
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

    switch (action) {
      case "CREDIT": {
        if (!amount || amount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        await db.user.update({ where: { id: targetUserId }, data: { balance: { increment: amount } } });
        await db.transaction.create({ data: { txId: generateTxId("TXN"), userId: targetUserId, type: "DEPOSIT", amount, status: "APPROVED", method: "ADMIN_CREDIT" } });
        break;
      }
      case "DEBIT": {
        if (!amount || amount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        if (target.balance < amount) return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
        await db.user.update({ where: { id: targetUserId }, data: { balance: { decrement: amount } } });
        await db.transaction.create({ data: { txId: generateTxId("TXN"), userId: targetUserId, type: "WITHDRAWAL", amount, status: "APPROVED", method: "ADMIN_DEBIT" } });
        break;
      }
      case "FREEZE_ACCOUNT": {
        await db.user.update({ where: { id: targetUserId }, data: { status: "FROZEN" } });
        break;
      }
      case "UNFREEZE_ACCOUNT": {
        await db.user.update({ where: { id: targetUserId }, data: { status: "ACTIVE" } });
        break;
      }
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    await logAction(admin.id, action, req, { type: "user", id: targetUserId });
    return NextResponse.json({ success: true, action });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
