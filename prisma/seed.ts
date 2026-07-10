import { db } from "@/lib/db";
import { hashPassword, randomUid } from "@/lib/api-auth";

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

async function main() {
  console.log("Seeding Brock Exchange...");

  // Super Admin
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
    console.log(`Created super admin: ${SUPER_ADMIN.email}`);
  } else {
    console.log(`Super admin exists: ${SUPER_ADMIN.email}`);
  }

  // Sub-Agents
  for (const sa of SUB_AGENTS) {
    const exists = await db.user.findUnique({ where: { email: sa.email } });
    if (!exists) {
      const hash = await hashPassword("default");
      const user = await db.user.create({
        data: {
          uid: randomUid("BX-SA"),
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
      console.log(`Created sub-agent: ${sa.email} (${sa.code})`);
    } else {
      console.log(`Sub-agent exists: ${sa.email}`);
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
