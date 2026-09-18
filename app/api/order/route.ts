import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { clientName, clientEmail, phone, country, service, referralCode, paymentNote } = body;

  if (!clientName || !clientEmail || !service) {
    return NextResponse.json({ error: "Name, email and service are required" }, { status: 400 });
  }

  const found = await prisma.course.findFirst({ where: { name: service, active: true } });
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
      // Bind to the course by ID, not just the name snapshot in `service` —
      // if the course is later renamed, confirmation must still resolve the
      // right course instead of silently failing a name-string match.
      courseId: found.id,
      amount: found.price,
      referralCode: referralCode?.trim() || null,
      paymentNote: paymentNote?.trim() || null,
    },
  });

  console.log("[ORDER_CREATE]", JSON.stringify({
    paymentId: request.id,
    clientEmail: request.clientEmail,
    courseId: found.id,
    service,
  }));

  return NextResponse.json({ success: true, id: request.id });
}
