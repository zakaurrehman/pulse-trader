import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [affiliates, sales, commissions, withdrawals, reviews] = await Promise.all([
    prisma.user.findMany({ where: { role: "AFFILIATE" }, select: { status: true } }),
    prisma.sale.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { affiliate: { select: { fullName: true } } },
    }),
    prisma.commission.aggregate({ _sum: { amount: true } }),
    prisma.withdrawalRequest.findMany({ where: { status: "PENDING" }, select: { id: true } }),
    prisma.review.findMany({ where: { status: "PENDING" }, select: { id: true } }),
  ]);

  return NextResponse.json({
    totalAffiliates: affiliates.length,
    pendingAffiliates: affiliates.filter((a) => a.status === "PENDING").length,
    totalSales: sales.length,
    totalSalesAmount: sales.reduce((sum: number, s) => sum + s.amount, 0),
    totalCommissions: commissions._sum.amount ?? 0,
    pendingWithdrawals: withdrawals.length,
    pendingReviews: reviews.length,
    recentSales: sales,
  });
}
