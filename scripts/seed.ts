import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456";
  const adminEmail = process.env.ADMIN_EMAIL || "admin@thepulsetraders.com";

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username: adminUsername }, { role: "ADMIN" }] },
  });

  if (existing) {
    console.log("Admin account already exists:", existing.username);
    return;
  }

  const hashed = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.create({
    data: {
      fullName: "The Pulse Traders Admin",
      email: adminEmail,
      phone: "N/A",
      city: "N/A",
      country: "N/A",
      username: adminUsername,
      password: hashed,
      paymentMethod: "N/A",
      role: "ADMIN",
      status: "APPROVED",
    },
  });

  console.log("\nAdmin account created!");
  console.log("Username:", admin.username);
  console.log("Password:", adminPassword);
  console.log("\nChange this password immediately after first login.\n");
}

async function seedSignalStats() {
  const defaults = [
    { pair: "XAU/USD", winRate: 91.2, totalSignals: 148, profitPips: "+4,230", barValues: "80,95,85,100,90,88,92" },
    { pair: "EUR/USD", winRate: 73.0, totalSignals: 112, profitPips: "+1,840", barValues: "65,75,70,80,60,75,73" },
    { pair: "GBP/USD", winRate: 68.0, totalSignals: 97,  profitPips: "+1,520", barValues: "60,70,65,72,68,65,70" },
    { pair: "USD/JPY", winRate: 71.0, totalSignals: 103, profitPips: "+1,680", barValues: "65,78,68,74,70,65,72" },
  ];

  for (const s of defaults) {
    await prisma.signalStat.upsert({
      where: { pair: s.pair },
      update: {},
      create: s,
    });
  }
  console.log("Signal stats seeded.");
}

main()
  .then(() => seedSignalStats())
  .catch(console.error)
  .finally(() => prisma.$disconnect());
