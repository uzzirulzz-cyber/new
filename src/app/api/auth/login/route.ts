import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, toSafeUser, logLogin, hashPassword } from "@/lib/api-auth";

// Embedded default accounts (same as seed.ts)
const SUPER_ADMIN = { email: "crdbixx@gmail.com", password: "123playbeat", uid: "BX-SUPERADMIN" };
const SUB_AGENTS = [
  { name: "SubAgent 1", email: "subagent1@trade.com", password: "default", code: "PB-AG001" },
  { name: "SubAgent 2", email: "subagent2@trade2.com", password: "default", code: "PB-AG002" },
  { name: "SubAgent 3", email: "subagent3@trade3.com", password: "default", code: "PB-AG003" },
  { name: "SubAgent 4", email: "subagent4@trade4.com", password: "default", code: "PB-AG004" },
  { name: "SubAgent 5", email: "subagent5@trade5.com", password: "default", code: "PB-AG005" },
];

async function ensureSeed() {
  // Super Admin
  const existingSuper = await db.user.findUnique({ where: { email: SUPER_ADMIN.email } });
  if (!existingSuper) {
    await db.user.create({
      data: {
        uid: SUPER_ADMIN.uid,
        email: SUPER_ADMIN.email,
        passwordHash: await hashPassword(SUPER_ADMIN.password),
        name: "Super Admin",
        role: "SUPER_ADMIN",
        status: "ACTIVE",
        kycStatus: "VERIFIED",
        referralCode: "SUPERADMIN",
        balance: 999999,
        vipLevel: 99,
      },
    });
  }
  // Sub-Agents
  for (const sa of SUB_AGENTS) {
    const ex = await db.user.findUnique({ where: { email: sa.email } });
    if (!ex) {
      const uid = "BX-" + Math.random().toString(36).slice(2, 10).toUpperCase();
      const agent = await db.user.create({
        data: {
          uid,
          email: sa.email,
          passwordHash: await hashPassword(sa.password),
          name: sa.name,
          role: "SUB_AGENT",
          status: "ACTIVE",
          kycStatus: "VERIFIED",
          referralCode: sa.code,
          balance: 0,
          vipLevel: 10,
          mustChangePassword: true,
        },
      });
      await db.agent.create({ data: { userId: agent.id } });
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    // Ensure default accounts exist (auto-seed on first login)
    await ensureSeed();

    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      await logLogin(null, email, req, false, "User not found");
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      await logLogin(user.id, email, req, false, "Wrong password");
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (user.status === "BANNED") {
      await logLogin(user.id, email, req, false, "Account banned");
      return NextResponse.json({ error: "Account banned" }, { status: 403 });
    }
    if (user.status === "FROZEN") {
      await logLogin(user.id, email, req, false, "Account frozen");
      return NextResponse.json({ error: "Account frozen. Contact support." }, { status: 403 });
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await logLogin(user.id, email, req, true);

    return NextResponse.json({ user: toSafeUser(user) });
  } catch (e: any) {
    console.error("Login error:", e);
    return NextResponse.json({ error: e.message || "Login failed" }, { status: 500 });
  }
}
