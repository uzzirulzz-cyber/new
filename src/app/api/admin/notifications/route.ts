import { NextRequest, NextResponse } from "next/server";
import { requireRole, logAction } from "@/lib/api-auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireRole(req, "SUPER_ADMIN");
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const notifications = await db.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { user: { select: { name: true, email: true } } },
    });
    return NextResponse.json({ notifications });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireRole(req, "SUPER_ADMIN");
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { userId, title, body, type } = await req.json();
    if (!userId || !title || !body) return NextResponse.json({ error: "userId, title, body required" }, { status: 400 });

    await db.notification.create({
      data: { userId, title, body, type: type || "info" },
    });

    await logAction(admin.id, "SEND_NOTIFICATION", req, { type: "user", id: userId });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
