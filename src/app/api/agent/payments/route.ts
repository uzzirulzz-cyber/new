import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/agent/payments — deposit/withdrawal requests from this agent's customers (RBAC)
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "AGENT") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const customers = await db.user.findMany({
      where: { referredById: user.id, role: "USER" },
      select: { id: true },
    });
    const customerIds = customers.map((c) => c.id);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "PENDING";
    const type = searchParams.get("type");

    const where: any = { userId: { in: customerIds } };
    if (status && status !== "ALL") where.status = status;
    if (type) where.type = type;
    else where.OR = [{ type: "DEPOSIT" }, { type: "WITHDRAWAL" }];

    const transactions = await db.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        user: {
          select: { id: true, uid: true, name: true, email: true, mobile: true },
        },
      },
    });

    return NextResponse.json({ transactions });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
