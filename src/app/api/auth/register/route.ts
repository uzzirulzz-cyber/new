import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  hashPassword,
  generateUid,
  generateReferralCode,
  createToken,
  setSessionCookie,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { invitationCode, name, email, mobile, password, confirmPassword } = body;

    // ─── Validate ─────────────────────────────────────────────
    if (!invitationCode || !name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required: invitation code, name, email, password" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // ─── Verify invitation code (matches a user's referralCode) ──
    const referrer = await db.user.findUnique({
      where: { referralCode: invitationCode.toUpperCase() },
    });

    if (!referrer) {
      return NextResponse.json({ error: "Invalid invitation code" }, { status: 400 });
    }

    // ─── Check email uniqueness ────────────────────────────────
    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // ─── Create user + wallet ──────────────────────────────────
    const passwordHash = await hashPassword(password);
    let uid = generateUid();
    // ensure UID uniqueness
    while (await db.user.findUnique({ where: { uid } })) {
      uid = generateUid();
    }

    let referralCode = generateReferralCode(name);
    while (await db.user.findUnique({ where: { referralCode } })) {
      referralCode = generateReferralCode(name);
    }

    const user = await db.user.create({
      data: {
        uid,
        email: email.toLowerCase(),
        passwordHash,
        name,
        mobile: mobile || null,
        role: "USER",
        status: "ACTIVE",
        kycStatus: "UNVERIFIED",
        invitationCode: invitationCode.toUpperCase(),
        referralCode,
        referredById: referrer.id,
      },
    });

    // Create wallet with welcome bonus
    await db.wallet.create({
      data: {
        userId: user.id,
        available: 0,
      },
    });

    // If referrer is an agent, increment their referral count
    if (referrer.role === "AGENT" || referrer.role === "ADMIN" || referrer.role === "SUPER_ADMIN") {
      const agent = await db.agent.findUnique({ where: { userId: referrer.id } });
      if (agent) {
        await db.agent.update({
          where: { userId: referrer.id },
          data: {
            totalReferrals: { increment: 1 },
            activeReferrals: { increment: 1 },
          },
        });
      }
    }

    // Welcome notification
    await db.notification.create({
      data: {
        userId: user.id,
        title: "Welcome to BlockExchange.buzz!",
        message: `Your account has been created successfully. Your UID is ${uid}. Start trading smarter and grow faster!`,
        type: "success",
      },
    });

    // ─── Create session ────────────────────────────────────────
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
      },
    });
  } catch (e: any) {
    console.error("Register error:", e);
    return NextResponse.json({ error: e.message || "Registration failed" }, { status: 500 });
  }
}
