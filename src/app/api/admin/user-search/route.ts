import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireRole(req, "SUPER_ADMIN");
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    if (!q) return NextResponse.json({ users: [] });

    const users = await db.user.findMany({
      where: {
        OR: [
          { uid: { contains: q } },
          { email: { contains: q } },
          { name: { contains: q } },
        ],
      },
      take: 20,
      select: { id: true, uid: true, email: true, name: true, role: true, status: true, balance: true },
    });

    return NextResponse.json({ users });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
