import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireRole(req, "SUPER_ADMIN");
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");

    const where: any = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const trades = await db.trade.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: { select: { id: true, name: true, email: true, uid: true } },
      },
    });

    return NextResponse.json({ trades });
  } catch (e: any) {
    console.error("admin trades error:", e);
    return NextResponse.json({ error: e.message || "Failed to load trades" }, { status: 500 });
  }
}
