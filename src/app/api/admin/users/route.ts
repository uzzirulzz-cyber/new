import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireRole(req, "SUPER_ADMIN");
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    const where: any = {};
    if (q) {
      where.OR = [
        { uid: { contains: q } },
        { email: { contains: q } },
        { name: { contains: q } },
      ];
    }

    const users = await db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, uid: true, email: true, name: true, phone: true, country: true,
        role: true, status: true, kycStatus: true, balance: true, vipLevel: true,
        invitationCode: true, referralCode: true, linkedSubAgentId: true,
        mustChangePassword: true, registeredAt: true, lastLoginAt: true, createdAt: true,
        _count: { select: { trades: true } },
      },
    });

    return NextResponse.json({ users });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
