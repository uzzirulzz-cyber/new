import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/api-auth";

export const runtime = "nodejs";

const SUPER_ADMIN = {
  email: "crdbixx@gmail.com",
  password: "123playbeat",
  name: "Super Admin",
  uid: "BX-SUPERADMIN",
};

const SUB_AGENTS = [
  { email: "subagent1@trade.com", code: "PB-AG001", name: "Sub Agent One" },
  { email: "subagent2@trade2.com", code: "PB-AG002", name: "Sub Agent Two" },
  { email: "subagent3@trade3.com", code: "PB-AG003", name: "Sub Agent Three" },
  { email: "subagent4@trade4.com", code: "PB-AG004", name: "Sub Agent Four" },
  { email: "subagent5@trade5.com", code: "PB-AG005", name: "Sub Agent Five" },
];

export async function POST() {
  try {
    const created: string[] = [];

    const adminExists = await db.user.findUnique({ where: { email: SUPER_ADMIN.email } });
    if (!adminExists) {
      const hash = await hashPassword(SUPER_ADMIN.password);
      await db.user.create({
        data: {
          uid: SUPER_ADMIN.uid,
          email: SUPER_ADMIN.email,
          passwordHash: hash,
          name: SUPER_ADMIN.name,
          role: "SUPER_ADMIN",
          status: "ACTIVE",
          kycStatus: "VERIFIED",
          balance: 9999999,
          vipLevel: 99,
          referralCode: "BROCK-ADMIN",
          mustChangePassword: false,
        },
      });
      created.push(`super_admin:${SUPER_ADMIN.email}`);
    }

    for (const sa of SUB_AGENTS) {
      const exists = await db.user.findUnique({ where: { email: sa.email } });
      if (!exists) {
        const hash = await hashPassword("default");
        const user = await db.user.create({
          data: {
            uid: `BX-SA-${sa.code.slice(-3)}`,
            email: sa.email,
            passwordHash: hash,
            name: sa.name,
            role: "SUB_AGENT",
            status: "ACTIVE",
            kycStatus: "VERIFIED",
            balance: 0,
            vipLevel: 5,
            referralCode: sa.code,
            mustChangePassword: true,
          },
        });
        await db.agent.create({
          data: { userId: user.id, commissionRate: 10, totalCommission: 0, totalReferrals: 0 },
        });
        created.push(`sub_agent:${sa.email}`);
      }
    }

    return NextResponse.json({ ok: true, created, message: "Seed complete" });
  } catch (e) {
    console.error("seed error", e);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
