import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user.role === "ADMIN";

  const reviews = await prisma.review.findMany({
    where: isAdmin ? {} : { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reviews);
}

export async function POST(req: NextRequest) {
  const { clientName, email, rating, content, imageUrl } = await req.json();

  if (!clientName || !rating || !content) {
    return NextResponse.json({ error: "Name, rating, and review are required." }, { status: 400 });
  }

  const r = parseInt(rating);
  if (r < 1 || r > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
  }

  await prisma.review.create({
    data: {
      clientName,
      email: email || null,
      rating: r,
      content,
      imageUrl: imageUrl || null,
      status: "PENDING",
    },
  });

  return NextResponse.json({ message: "Review submitted for approval. Thank you!" }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status } = await req.json();
  await prisma.review.update({ where: { id }, data: { status } });

  return NextResponse.json({ message: "Review updated." });
}
