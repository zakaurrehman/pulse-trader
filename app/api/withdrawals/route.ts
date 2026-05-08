import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = session.user.role === "ADMIN";

  const withdrawals = await prisma.withdrawalRequest.findMany({
    where: isAdmin ? {} : { affiliateId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      affiliate: { select: { fullName: true, username: true, paymentMethod: true } },
    },
  });

  return NextResponse.json(withdrawals);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "AFFILIATE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { amount } = await req.json();
  const parsed = parseFloat(amount);

  if (!parsed || parsed <= 0) {
    return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
  }

  const commissions = await prisma.commission.findMany({
    where: { affiliateId: session.user.id, withdrawn: false },
  });
  const available = commissions.reduce((sum: number, c) => sum + c.amount, 0);

  if (parsed > available) {
    return NextResponse.json({ error: "Insufficient available balance." }, { status: 400 });
  }

  const hasPending = await prisma.withdrawalRequest.findFirst({
    where: { affiliateId: session.user.id, status: "PENDING" },
  });
  if (hasPending) {
    return NextResponse.json({ error: "You already have a pending withdrawal request." }, { status: 409 });
  }

  const withdrawal = await prisma.withdrawalRequest.create({
    data: { affiliateId: session.user.id, amount: parsed },
  });

  return NextResponse.json({ message: "Withdrawal request submitted.", withdrawal }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status, note } = await req.json();

  const withdrawal = await prisma.withdrawalRequest.update({
    where: { id },
    data: { status, note: note || null },
  });

  if (status === "PAID") {
    await prisma.commission.updateMany({
      where: { affiliateId: withdrawal.affiliateId, withdrawn: false },
      data: { withdrawn: true },
    });
  }

  return NextResponse.json({ message: "Withdrawal updated." });
}
