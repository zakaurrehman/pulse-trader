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

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
