import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole(req, "SUPER_ADMIN");
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const logs = await db.loginLog.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    return NextResponse.json({ logs });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
