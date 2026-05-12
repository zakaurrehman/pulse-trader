import { prisma } from "@/lib/prisma";
import { SERVICES } from "@/lib/services";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { clientName, clientEmail, phone, country, service, referralCode, paymentNote } = body;

  if (!clientName || !clientEmail || !service) {
    return NextResponse.json({ error: "Name, email and service are required" }, { status: 400 });
  }

  const found = SERVICES.find((s) => s.name === service);
  if (!found) {
    return NextResponse.json({ error: "Invalid service selected" }, { status: 400 });
  }

  if (referralCode) {
    const affiliate = await prisma.user.findUnique({ where: { referralCode } });
    if (!affiliate || affiliate.status !== "APPROVED") {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 400 });
    }
  }

  const request = await prisma.paymentRequest.create({
    data: {
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim().toLowerCase(),
      phone: phone?.trim() || null,
      country: country?.trim() || null,
      service,
      amount: found.price,
      referralCode: referralCode?.trim() || null,
      paymentNote: paymentNote?.trim() || null,
    },
  });

  return NextResponse.json({ success: true, id: request.id });
}
