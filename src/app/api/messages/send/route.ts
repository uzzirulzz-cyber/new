import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { conversationId, body } = await req.json();
    if (!conversationId || !body) return NextResponse.json({ error: "conversationId + body required" }, { status: 400 });

    // RBAC: verify user has access to this conversation
    const conv = await db.conversation.findUnique({ where: { id: conversationId } });
    if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

    if (user.role === "CUSTOMER" && conv.customerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (user.role === "SUB_AGENT") {
      const customer = await db.user.findUnique({ where: { id: conv.customerId } });
      if (customer?.linkedSubAgentId !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const msg = await db.message.create({
      data: { conversationId, senderId: user.id, body },
    });

    return NextResponse.json({ message: msg });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
