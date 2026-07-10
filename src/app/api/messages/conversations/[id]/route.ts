import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const conv = await db.conversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

    // RBAC: customer sees own, sub-agent sees their customers', super_admin sees all
    if (user.role === "CUSTOMER" && conv.customerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (user.role === "SUB_AGENT") {
      const customer = await db.user.findUnique({ where: { id: conv.customerId } });
      if (customer?.linkedSubAgentId !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json({ conversation: conv });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
