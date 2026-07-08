import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/agent/trades — trades from this agent's customers only (RBAC)
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
    const status = searchParams.get("status");
    const limit = Math.min(Number(searchParams.get("limit") || 100), 500);

    const where: any = { userId: { in: customerIds } };
    if (status) where.status = status;

    const trades = await db.trade.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: {
          select: { id: true, uid: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ trades });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
