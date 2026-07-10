import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // RBAC: customers see their own conversations, sub-agents see conversations for their customers, super_admin sees all
    let where: any = {};
    if (user.role === "CUSTOMER") {
      where.customerId = user.id;
    } else if (user.role === "SUB_AGENT") {
      const customers = await db.user.findMany({
        where: { linkedSubAgentId: user.id, role: "CUSTOMER" },
        select: { id: true },
      });
      where.customerId = { in: customers.map((c) => c.id) };
    }

    const conversations = await db.conversation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        customer: { select: { name: true, uid: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    return NextResponse.json({ conversations });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "CUSTOMER") return NextResponse.json({ error: "Only customers can start conversations" }, { status: 403 });

    const { subject } = await req.json();

    // Find the sub-agent linked to this customer
    const customer = await db.user.findUnique({ where: { id: user.id } });
    const subAgentId = customer?.linkedSubAgentId;

    const conv = await db.conversation.create({
      data: {
        customerId: user.id,
        subAgentId,
        subject: subject || "Support Chat",
      },
    });

    return NextResponse.json({ conversation: conv });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
