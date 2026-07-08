import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  verifyPassword,
  createToken,
  setSessionCookie,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (user.status === "BANNED") {
      return NextResponse.json({ error: "Account banned. Contact support." }, { status: 403 });
    }
    if (user.status === "SUSPENDED") {
      return NextResponse.json({ error: "Account suspended. Contact support." }, { status: 403 });
    }

    // ─── Update last login ─────────────────────────────────────
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";
    await db.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date(), lastLoginIp: ip, lastLoginDevice: userAgent.slice(0, 200) },
    });

    // ─── Record login session ──────────────────────────────────
    await db.loginSession.create({
      data: {
        userId: user.id,
        ip,
        userAgent: userAgent.slice(0, 500),
        device: userAgent.slice(0, 100),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // ─── Create JWT + set cookie ───────────────────────────────
    const token = await createToken({
      userId: user.id,
      uid: user.uid,
      email: user.email,
      role: user.role,
    });
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
    });
  } catch (e: any) {
    console.error("Login error:", e);
    return NextResponse.json({ error: e.message || "Login failed" }, { status: 500 });
  }
}
