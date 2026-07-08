import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/agent/customers — list customers referred by this agent (RBAC enforced)
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "AGENT") return NextResponse.json({ error: "Forbidden: agent access required" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const status = searchParams.get("status");

    // ─── RBAC: agent can ONLY see customers whose referredById == their id ──
    const where: any = {
      role: "USER",
      referredById: user.id, // strict data isolation
    };
    if (status) where.status = status;
    if (q) {
      where.OR = [
        { uid: { contains: q } },
        { email: { contains: q } },
        { name: { contains: q } },
        { mobile: { contains: q } },
      ];
    }

    const customers = await db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        uid: true,
        email: true,
        name: true,
        mobile: true,
        country: true,
        status: true,
        kycStatus: true,
        invitationCode: true,
        createdAt: true,
        lastLogin: true,
        wallet: true,
      },
    });

    return NextResponse.json({ customers });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
