import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

    const trades = await db.trade.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: { select: { id: true, name: true, email: true, uid: true } },
      },
    });

    return NextResponse.json({ trades });
  } catch (e) {
    console.error("admin trades error", e);
    return NextResponse.json({ error: "Failed to load trades" }, { status: 500 });
  }
}
