// Brock Exchange — Seed script
// Embeds default accounts directly (no env dependency).
// Run with: bun run src/lib/seed.ts

import { db } from "./db";
import bcrypt from "bcryptjs";

const SUPER_ADMIN = {
  name: "Super Admin",
  email: "crdbixx@gmail.com",
  password: "123playbeat",
  uid: "BX-SUPERADMIN",
  referralCode: "SUPERADMIN",
};

const SUB_AGENTS = [
  { name: "SubAgent 1", email: "subagent1@trade.com", password: "default", code: "PB-AG001" },
  { name: "SubAgent 2", email: "subagent2@trade2.com", password: "default", code: "PB-AG002" },
  { name: "SubAgent 3", email: "subagent3@trade3.com", password: "default", code: "PB-AG003" },
  { name: "SubAgent 4", email: "subagent4@trade4.com", password: "default", code: "PB-AG004" },
  { name: "SubAgent 5", email: "subagent5@trade5.com", password: "default", code: "PB-AG005" },
];

function generateUid(): string {
  return "BX-" + Math.random().toString(36).slice(2, 10).toUpperCase();
}

async function seed() {
  console.log("🌱 Seeding Brock Exchange...\n");

  // Super Admin
  const existingSuper = await db.user.findUnique({ where: { email: SUPER_ADMIN.email } });
  if (!existingSuper) {
    const hash = await bcrypt.hash(SUPER_ADMIN.password, 10);
    await db.user.create({
      data: {
        uid: SUPER_ADMIN.uid,
        email: SUPER_ADMIN.email,
        passwordHash: hash,
        name: SUPER_ADMIN.name,
        role: "SUPER_ADMIN",
        status: "ACTIVE",
        kycStatus: "VERIFIED",
        referralCode: SUPER_ADMIN.referralCode,
        balance: 999999,
        vipLevel: 99,
        mustChangePassword: false,
      },
    });
    console.log(`✅ Super Admin: ${SUPER_ADMIN.email}`);
  } else {
    console.log(`ℹ️  Super Admin exists`);
  }

  // Sub-Agents
  for (const sa of SUB_AGENTS) {
    const existing = await db.user.findUnique({ where: { email: sa.email } });
    if (existing) {
      console.log(`ℹ️  ${sa.name} exists`);
      continue;
    }
    const hash = await bcrypt.hash(sa.password, 10);
    let uid = generateUid();
    while (await db.user.findUnique({ where: { uid } })) uid = generateUid();

    const agent = await db.user.create({
      data: {
        uid,
        email: sa.email,
        passwordHash: hash,
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
    console.log(`✅ ${sa.name}: ${sa.email} · Code: ${sa.code}`);
  }

  console.log("\n🎉 Seed complete!");
  console.log("═══════════════════════════════════════════");
  console.log("  Super Admin: crdbixx@gmail.com / 123playbeat");
  console.log("  Sub-Agents: subagentN@tradeN.com / default");
  console.log("  Codes: PB-AG001 through PB-AG005");
  console.log("═══════════════════════════════════════════");
}

seed().catch(e => { console.error("❌", e); process.exit(1); }).finally(() => db.$disconnect());
