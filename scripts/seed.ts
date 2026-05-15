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

async function seedCourses() {
  const courses = [
    {
      name: "Basic Training",
      price: 30.16,
      period: "one-time",
      description: "Perfect starting point for beginners entering the forex market.",
      features: "Forex fundamentals\nChart reading basics\nRisk management guide\nCommunity access\nEmail support",
      badge: null,
      popular: false,
      sortOrder: 1,
    },
    {
      name: "Advanced Trading Strategies",
      price: 102.96,
      period: "one-time",
      description: "Master professional-level strategies used by institutional traders.",
      features: "All Basic content\nAdvanced technical analysis\nEntry & exit strategies\nWeekly live sessions\nPriority support\nStrategy playbooks",
      badge: "Most Popular",
      popular: true,
      sortOrder: 2,
    },
    {
      name: "Mastery Bundle",
      price: 123.76,
      period: "one-time",
      description: "Complete course library with lifetime access and exclusive masterclasses.",
      features: "Full course library\nExclusive masterclasses\nTrade review sessions\nLifetime updates\n1-on-1 onboarding call",
      badge: "Best Value",
      popular: false,
      sortOrder: 3,
    },
    {
      name: "Premium Signals",
      price: 50.96,
      period: "per month",
      description: "Daily high-accuracy signals for forex majors and XAU/USD.",
      features: "Daily forex signals\nXAU/USD & major pairs\nEntry, TP & SL included\nTelegram delivery\nWin rate tracking",
      badge: null,
      popular: false,
      sortOrder: 4,
    },
    {
      name: "Personal Mentorship",
      price: 206.96,
      period: "one-time",
      description: "One-on-one coaching with a professional trader. Limited spots.",
      features: "Full Mastery Bundle\n4 private mentorship calls\nPersonalized trade plan\nPsychology coaching\nDirect mentor access",
      badge: null,
      popular: false,
      sortOrder: 5,
    },
  ];

  for (const c of courses) {
    await prisma.course.upsert({
      where: { name: c.name },
      update: {},
      create: { ...c, badge: c.badge ?? undefined },
    });
  }
  console.log("Courses seeded.");
}

main()
  .then(() => seedSignalStats())
  .then(() => seedCourses())
  .catch(console.error)
  .finally(() => prisma.$disconnect());
