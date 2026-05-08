import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName, email, phone, city, country,
      username, password, paymentMethod, socialHandle,
    } = body;

    if (!fullName || !email || !phone || !city || !country || !username || !password || !paymentMethod) {
      return NextResponse.json({ error: "All required fields must be filled." }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      return NextResponse.json({ error: "Email or username already taken." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        city,
        country,
        username,
        password: hashedPassword,
        paymentMethod,
        socialHandle: socialHandle || null,
        role: "AFFILIATE",
        status: "PENDING",
      },
    });

    return NextResponse.json(
      { message: "Registration successful. Your account is pending admin approval." },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
