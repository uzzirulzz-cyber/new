import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { db } from "@/lib/db";

// GET /api/messages/agent — returns the customer's assigned sub-agent (name + online status)
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "CUSTOMER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    if (!user.linkedSubAgentId) {
      return NextResponse.json({ agent: null });
    }

    const subAgent = await db.user.findUnique({
      where: { id: user.linkedSubAgentId },
      select: {
        id: true,
        uid: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        lastLoginAt: true,
      },
    });

    if (!subAgent) {
      return NextResponse.json({ agent: null });
    }

    // Online = logged in within the last 5 minutes
    const FIVE_MIN = 5 * 60 * 1000;
    const online = subAgent.lastLoginAt
      ? Date.now() - new Date(subAgent.lastLoginAt).getTime() < FIVE_MIN
      : false;

    return NextResponse.json({
      agent: {
        ...subAgent,
        online,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
