import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/admin/payments — list pending/all deposit & withdrawal requests
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "PENDING";
    const type = searchParams.get("type"); // DEPOSIT | WITHDRAWAL

    const where: any = {};
    if (status && status !== "ALL") where.status = status;
    if (type) where.type = type;
    else where.OR = [{ type: "DEPOSIT" }, { type: "WITHDRAWAL" }];

    const transactions = await db.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        user: {
          select: {
            id: true,
            uid: true,
            name: true,
            email: true,
            mobile: true,
          },
        },
      },
    });

    return NextResponse.json({ transactions });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
