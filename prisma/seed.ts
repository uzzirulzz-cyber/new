// Seed script for BlockExchange.buzz
// Run with: bun run db:seed

import { db } from "../src/lib/db";
import { hashPassword, generateUid } from "../src/lib/auth";

async function seed() {
  console.log("🌱 Seeding BlockExchange.buzz database...\n");

  // ─── Super Admin ───────────────────────────────────────────
  const superAdminEmail = "crdbixx@gmail.com";
  const existingSuper = await db.user.findUnique({ where: { email: superAdminEmail } });

  if (!existingSuper) {
    const passwordHash = await hashPassword("123playbeat");
    const admin = await db.user.create({
      data: {
        uid: "BX-SUPERADMIN",
        email: superAdminEmail,
        passwordHash,
        name: "Super Admin",
        mobile: "+10000000000",
        country: "Global",
        role: "SUPER_ADMIN",
        status: "ACTIVE",
        kycStatus: "VERIFIED",
        referralCode: "SUPERADMIN",
        mustChangePassword: false,
      },
    });

    await db.wallet.create({
      data: {
        userId: admin.id,
        available: 1000000,
      },
    });

    console.log(`✅ Super Admin created:`);
    console.log(`   Email: ${superAdminEmail}`);
    console.log(`   Password: 123playbeat`);
    console.log(`   UID: BX-SUPERADMIN\n`);
  } else {
    console.log("ℹ️  Super Admin already exists\n");
  }

  // ─── Sub-Agent Accounts (5 agents with invitation codes) ──
  const subAgents = [
    { name: "SubAgent 1", email: "subagent1@trade.com", code: "PB-AG001" },
    { name: "SubAgent 2", email: "subagent2@trade2.com", code: "PB-AG002" },
    { name: "SubAgent 3", email: "subagent3@trade3.com", code: "PB-AG003" },
    { name: "SubAgent 4", email: "subagent4@trade4.com", code: "PB-AG004" },
    { name: "SubAgent 5", email: "subagent5@trade5.com", code: "PB-AG005" },
  ];

  const defaultPasswordHash = await hashPassword("default");

  for (const sa of subAgents) {
    const existing = await db.user.findUnique({ where: { email: sa.email } });
    if (existing) {
      console.log(`ℹ️  ${sa.name} already exists (${sa.email})`);
      continue;
    }

    // Ensure invitation code is unique
    const codeOwner = await db.user.findUnique({ where: { referralCode: sa.code } });
    if (codeOwner) {
      console.log(`⚠️  Invitation code ${sa.code} already in use — skipping ${sa.name}`);
      continue;
    }

    let uid = generateUid();
    while (await db.user.findUnique({ where: { uid } })) uid = generateUid();

    const agent = await db.user.create({
      data: {
        uid,
        email: sa.email,
        passwordHash: defaultPasswordHash,
        name: sa.name,
        role: "AGENT",
        status: "ACTIVE",
        kycStatus: "VERIFIED",
        referralCode: sa.code,
        mustChangePassword: true, // must change default password on first login
      },
    });

    // Create agent profile + wallet
    await db.agent.create({
      data: {
        userId: agent.id,
        commissionRate: 10,
      },
    });
    await db.wallet.create({
      data: { userId: agent.id, available: 0 },
    });

    console.log(`✅ ${sa.name}: ${sa.email} / default · Code: ${sa.code}`);
  }

  console.log("");

  // ─── System notifications ──────────────────────────────────
  const existingNotifs = await db.systemNotification.count();
  if (existingNotifs === 0) {
    await db.systemNotification.createMany({
      data: [
        {
          title: "Welcome to BlockExchange.buzz",
          message: "Trade Smarter. Grow Faster. Your premium crypto trading platform is now live.",
          type: "info",
          audience: "all",
        },
        {
          title: "Trading Hours: 24/7",
          message: "BlockExchange.buzz operates 24 hours a day, 7 days a week. Trade anytime, anywhere.",
          type: "info",
          audience: "users",
        },
        {
          title: "Security Reminder",
          message: "Enable Two-Factor Authentication to secure your account and protect your funds.",
          type: "security",
          audience: "all",
        },
      ],
    });
    console.log("✅ System notifications created\n");
  }

  console.log("🎉 Seed complete!\n");
  console.log("═══════════════════════════════════════════════════════");
  console.log("  BlockExchange.buzz — Default Accounts");
  console.log("═══════════════════════════════════════════════════════");
  console.log("");
  console.log("  Super Admin:");
  console.log("    Email:    crdbixx@gmail.com");
  console.log("    Password: 123playbeat");
  console.log("    UID:      BX-SUPERADMIN");
  console.log("");
  console.log("  Sub-Agents (must change password on first login):");
  console.log("    subagent1@trade.com  / default  · Code: PB-AG001");
  console.log("    subagent2@trade2.com / default  · Code: PB-AG002");
  console.log("    subagent3@trade3.com / default  · Code: PB-AG003");
  console.log("    subagent4@trade4.com / default  · Code: PB-AG004");
  console.log("    subagent5@trade5.com / default  · Code: PB-AG005");
  console.log("");
  console.log("  Customers register using one of the PB-AG00X codes above.");
  console.log("═══════════════════════════════════════════════════════\n");
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
