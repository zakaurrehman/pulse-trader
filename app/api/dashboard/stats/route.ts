import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "AFFILIATE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const affiliateId = session.user.id;

  const [sales, commissions, withdrawals, user] = await Promise.all([
    prisma.sale.findMany({
      where: { affiliateId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.commission.findMany({ where: { affiliateId } }),
    prisma.withdrawalRequest.findMany({
      where: { affiliateId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findUnique({
      where: { id: affiliateId },
      select: { referralCode: true, fullName: true },
    }),
  ]);

  const totalSales = sales.reduce((sum: number, s) => sum + s.amount, 0);
  const earnedCommissions = commissions.reduce((sum: number, c) => sum + c.amount, 0);
  const withdrawnAmount = withdrawals
    .filter((w) => w.status === "PAID")
    .reduce((sum: number, w) => sum + w.amount, 0);
  const availableBalance = commissions
    .filter((c) => !c.withdrawn)
    .reduce((sum: number, c) => sum + c.amount, 0);

  return NextResponse.json({
    totalSales,
    salesCount: sales.length,
    earnedCommissions,
    availableBalance,
    withdrawnAmount,
    referralCode: user?.referralCode,
    recentSales: sales.slice(0, 5),
    withdrawals,
  });
}
