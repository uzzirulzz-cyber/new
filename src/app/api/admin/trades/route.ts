import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/admin/trades — all trades across the platform
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const result = searchParams.get("result");
    const limit = Math.min(Number(searchParams.get("limit") || 100), 500);

    const where: any = {};
    if (status) where.status = status;
    if (result) where.result = result;

    const trades = await db.trade.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            uid: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ trades });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
