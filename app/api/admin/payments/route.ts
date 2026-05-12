import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requests = await prisma.paymentRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  const codes = requests.map((r) => r.referralCode).filter(Boolean) as string[];
  const affiliates = codes.length
    ? await prisma.user.findMany({
        where: { referralCode: { in: codes } },
        select: { referralCode: true, fullName: true, username: true },
      })
    : [];

  const affiliateMap = Object.fromEntries(
    affiliates.map((a) => [a.referralCode!, { fullName: a.fullName, username: a.username }])
  );

  return NextResponse.json(
    requests.map((r) => ({
      ...r,
      affiliate: r.referralCode ? (affiliateMap[r.referralCode] ?? null) : null,
    }))
  );
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, action, rejectedNote } = body;

  if (!id || !["confirm", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const payment = await prisma.paymentRequest.findUnique({ where: { id } });
  if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (payment.status !== "PENDING") {
    return NextResponse.json({ error: "Already actioned" }, { status: 409 });
  }

  if (action === "reject") {
    const updated = await prisma.paymentRequest.update({
      where: { id },
      data: { status: "REJECTED", rejectedNote: rejectedNote?.trim() || null },
    });
    return NextResponse.json(updated);
  }

  // Confirm: find affiliate and create Sale + Commission
  let affiliateId: string | null = null;
  if (payment.referralCode) {
    const affiliate = await prisma.user.findUnique({
      where: { referralCode: payment.referralCode },
    });
    if (affiliate && affiliate.status === "APPROVED") {
      affiliateId = affiliate.id;
    }
  }

  if (!affiliateId) {
    return NextResponse.json(
      { error: "No valid approved affiliate found for this referral code. Cannot confirm without an affiliate." },
      { status: 400 }
    );
  }

  const [sale, updated] = await prisma.$transaction(async (tx) => {
    const s = await tx.sale.create({
      data: {
        affiliateId,
        clientName: payment.clientName,
        clientEmail: payment.clientEmail,
        amount: payment.amount,
        description: payment.service,
      },
    });
    await tx.commission.create({
      data: {
        saleId: s.id,
        affiliateId,
        amount: payment.amount * 0.5,
      },
    });
    const p = await tx.paymentRequest.update({
      where: { id },
      data: { status: "CONFIRMED" },
    });
    return [s, p];
  });

  return NextResponse.json({ sale, payment: updated });
}
