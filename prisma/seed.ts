// Seed script for BlockExchange.buzz
// Run with: bun run db:seed

import { db } from "../src/lib/db";
import { hashPassword, generateUid, generateReferralCode } from "../src/lib/auth";

async function seed() {
  console.log("🌱 Seeding BlockExchange.buzz database...\n");

  // ─── Super Admin ───────────────────────────────────────────
  const adminEmail = "admin@blockexchange.buzz";
  const existingAdmin = await db.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const passwordHash = await hashPassword("Admin@2026");
    const admin = await db.user.create({
      data: {
        uid: "BX-ADMIN001",
        email: adminEmail,
        passwordHash,
        name: "Super Admin",
        mobile: "+10000000000",
        country: "Global",
        role: "SUPER_ADMIN",
        status: "ACTIVE",
        kycStatus: "VERIFIED",
        referralCode: "ADMIN2026",
      },
    });

    await db.wallet.create({
      data: {
        userId: admin.id,
        available: 1000000, // platform treasury
      },
    });

    console.log(`✅ Super Admin created:`);
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: Admin@2026`);
    console.log(`   UID: BX-ADMIN001\n`);
  } else {
    console.log("ℹ️  Super Admin already exists\n");
  }

  // ─── Default invitation code for self-registration ─────────
  // Users need an invitation code to register. The admin's referral code
  // "ADMIN2026" serves as the default public invitation code.

  // ─── System notifications (welcome) ────────────────────────
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
  console.log("═══════════════════════════════════════════");
  console.log("  BlockExchange.buzz — Login Credentials");
  console.log("═══════════════════════════════════════════");
  console.log("  Super Admin:");
  console.log("    Email:    admin@blockexchange.buzz");
  console.log("    Password: Admin@2026");
  console.log("    UID:      BX-ADMIN001");
  console.log("");
  console.log("  Default invitation code for new users: ADMIN2026");
  console.log("═══════════════════════════════════════════\n");
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
