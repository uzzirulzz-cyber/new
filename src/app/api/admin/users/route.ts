import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/admin/users — list/search users
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q"); // search query
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const limit = Math.min(Number(searchParams.get("limit") || 100), 500);

    const where: any = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (q) {
      where.OR = [
        { uid: { contains: q } },
        { email: { contains: q } },
        { name: { contains: q } },
        { mobile: { contains: q } },
      ];
    }

    const users = await db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        uid: true,
        email: true,
        name: true,
        mobile: true,
        country: true,
        role: true,
        status: true,
        kycStatus: true,
        referralCode: true,
        invitationCode: true,
        createdAt: true,
        lastLogin: true,
        wallet: true,
      },
    });

    return NextResponse.json({ users });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
