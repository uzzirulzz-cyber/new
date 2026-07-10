import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const agent = await requireRole(req, "SUB_AGENT");
    if (!agent) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Get own customer IDs
    const customers = await db.user.findMany({
      where: { linkedSubAgentId: agent.id, role: "CUSTOMER" },
      select: { id: true },
    });
    const customerIds = customers.map((c) => c.id);

    const trades = await db.trade.findMany({
      where: { userId: { in: customerIds } },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { name: true, uid: true } } },
    });

    return NextResponse.json({ trades });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
