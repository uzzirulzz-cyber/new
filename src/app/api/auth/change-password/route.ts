import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";

// POST /api/auth/change-password
// Used for first-login forced password change + voluntary password changes.
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { currentPassword, newPassword, confirmPassword } = await req.json();

    if (!newPassword || !confirmPassword) {
      return NextResponse.json({ error: "New password and confirmation required" }, { status: 400 });
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    if (newPassword === "default") {
      return NextResponse.json({ error: "Cannot use 'default' as your new password" }, { status: 400 });
    }

    // Fetch full user (with password hash)
    const fullUser = await db.user.findUnique({ where: { id: user.id } });
    if (!fullUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // If user is NOT doing a forced change, verify current password
    if (!fullUser.mustChangePassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password required" }, { status: 400 });
      }
      const valid = await verifyPassword(currentPassword, fullUser.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
      }
    }

    // Update password + clear mustChangePassword flag
    const newHash = await hashPassword(newPassword);
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
        mustChangePassword: false,
      },
    });

    // Notify user
    await db.notification.create({
      data: {
        userId: user.id,
        title: "Password Changed",
        message: "Your account password was changed successfully. If this wasn't you, contact support immediately.",
        type: "security",
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        adminId: user.id,
        action: "PASSWORD_CHANGE",
        targetType: "user",
        targetId: user.id,
        details: JSON.stringify({ forced: fullUser.mustChangePassword }),
        ip: req.headers.get("x-forwarded-for") || "unknown",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (e: any) {
    console.error("Change password error:", e);
    return NextResponse.json({ error: e.message || "Failed to change password" }, { status: 500 });
  }
}
