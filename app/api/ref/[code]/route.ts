import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  const { code } = params;

  const affiliate = await prisma.user.findUnique({
    where: { referralCode: code, status: "APPROVED" },
    select: { id: true },
  });

  const response = NextResponse.redirect(new URL("/", req.url));

  if (affiliate) {
    response.cookies.set("ref_code", code, {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
  }

  return response;
}
