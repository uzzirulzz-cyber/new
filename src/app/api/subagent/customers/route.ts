import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const agent = await requireRole(req, "SUB_AGENT");
    if (!agent) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const customers = await db.user.findMany({
      where: { linkedSubAgentId: agent.id, role: "CUSTOMER" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, uid: true, email: true, name: true, phone: true, country: true,
        status: true, balance: true, vipLevel: true, invitationCode: true, createdAt: true, lastLoginAt: true,
        _count: { select: { trades: true } },
      },
    });

    return NextResponse.json({ customers });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const agent = await requireRole(req, "SUB_AGENT");
    if (!agent) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { customerUserId, action } = await req.json();
    if (!customerUserId || !action) return NextResponse.json({ error: "customerUserId + action required" }, { status: 400 });

    // Verify this customer belongs to this agent
    const customer = await db.user.findFirst({
      where: { id: customerUserId, linkedSubAgentId: agent.id, role: "CUSTOMER" },
    });
    if (!customer) return NextResponse.json({ error: "Customer not found or not your customer" }, { status: 404 });

    if (action === "FREEZE") {
      await db.user.update({ where: { id: customerUserId }, data: { status: "FROZEN" } });
    } else if (action === "UNFREEZE") {
      await db.user.update({ where: { id: customerUserId }, data: { status: "ACTIVE" } });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
