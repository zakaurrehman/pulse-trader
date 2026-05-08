import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sales = await prisma.sale.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      affiliate: { select: { fullName: true, username: true } },
      commission: true,
    },
  });

  return NextResponse.json(sales);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { affiliateId, clientName, clientEmail, amount, description } = await req.json();

  if (!affiliateId || !clientName || !amount) {
    return NextResponse.json({ error: "Affiliate, client name, and amount are required." }, { status: 400 });
  }

  const sale = await prisma.sale.create({
    data: {
      affiliateId,
      clientName,
      clientEmail: clientEmail || null,
      amount: parseFloat(amount),
      description: description || null,
    },
  });

  await prisma.commission.create({
    data: {
      saleId: sale.id,
      affiliateId,
      amount: parseFloat(amount) * 0.5,
    },
  });

  return NextResponse.json({ message: "Sale logged and 50% commission credited.", sale }, { status: 201 });
}
