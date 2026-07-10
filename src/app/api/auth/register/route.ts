import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, toSafeUser, logLogin, generateTxId } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, country, invitationCode } = await req.json();
    if (!name || !email || !password || !invitationCode) {
      return NextResponse.json({ error: "Name, email, password, and invitation code are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Validate invitation code against sub-agent referralCode
    const subAgent = await db.user.findUnique({ where: { referralCode: invitationCode.toUpperCase() } });
    if (!subAgent || subAgent.role !== "SUB_AGENT") {
      return NextResponse.json({ error: "Invalid invitation code" }, { status: 400 });
    }

    // Check email uniqueness
    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hash = await hashPassword(password);
    const uid = "BX-" + Math.random().toString(36).slice(2, 10).toUpperCase();

    const user = await db.user.create({
      data: {
        uid,
        email: email.toLowerCase(),
        passwordHash: hash,
        name,
        country: country || null,
        role: "CUSTOMER",
        status: "ACTIVE",
        balance: 0,
        vipLevel: 1,
        invitationCode: invitationCode.toUpperCase(),
        referralCode: uid,
        linkedSubAgentId: subAgent.id,
        mustChangePassword: false,
      },
    });

    // Increment sub-agent referral count
    await db.agent.update({
      where: { userId: subAgent.id },
      data: { totalReferrals: { increment: 1 } },
    });

    // Welcome notification
    await db.notification.create({
      data: {
        userId: user.id,
        title: "Welcome to NexTradePro!",
        body: `Your account has been created. UID: ${uid}. Deposit funds to start trading.`,
        type: "success",
      },
    });

    return NextResponse.json({ user: toSafeUser(user) });
  } catch (e: any) {
    console.error("Register error:", e);
    return NextResponse.json({ error: e.message || "Registration failed" }, { status: 500 });
  }
}
