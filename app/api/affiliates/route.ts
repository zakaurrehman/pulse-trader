import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateReferralCode } from "@/lib/utils";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const affiliates = await prisma.user.findMany({
    where: { role: "AFFILIATE" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, fullName: true, email: true, phone: true,
      city: true, country: true, username: true,
      paymentMethod: true, socialHandle: true,
      status: true, referralCode: true, createdAt: true,
      _count: { select: { sales: true, commissions: true } },
    },
  });

  return NextResponse.json(affiliates);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status } = await req.json();

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  let referralCode = user.referralCode;
  if (status === "APPROVED" && !referralCode) {
    referralCode = generateReferralCode(user.username);
    const taken = await prisma.user.findUnique({ where: { referralCode } });
    if (taken) referralCode = generateReferralCode(user.username + Date.now());
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { status, referralCode: status === "APPROVED" ? referralCode : user.referralCode },
  });

  return NextResponse.json({ message: `Affiliate ${status.toLowerCase()}.`, referralCode: updated.referralCode });
}
