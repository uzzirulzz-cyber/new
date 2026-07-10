import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, verifyPassword, hashPassword } from "@/lib/api-auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { currentPassword, newPassword } = await req.json();
    if (!newPassword) return NextResponse.json({ error: "New password required" }, { status: 400 });
    if (newPassword.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });

    const fullUser = await db.user.findUnique({ where: { id: user.id } });
    if (!fullUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // If not forced change, verify current password
    if (!fullUser.mustChangePassword) {
      if (!currentPassword) return NextResponse.json({ error: "Current password required" }, { status: 400 });
      const valid = await verifyPassword(currentPassword, fullUser.passwordHash);
      if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
      if (currentPassword === newPassword) return NextResponse.json({ error: "New password must be different" }, { status: 400 });
    }

    const hash = await hashPassword(newPassword);
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: hash, mustChangePassword: false },
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
