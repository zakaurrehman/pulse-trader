import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const courses = await prisma.course.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, price, period, description, features, badge, popular, sortOrder } = body;

  if (!name || price == null) {
    return NextResponse.json({ error: "Name and price are required" }, { status: 400 });
  }

  const existing = await prisma.course.findUnique({ where: { name } });
  if (existing) {
    return NextResponse.json({ error: "A course with that name already exists" }, { status: 400 });
  }

  const course = await prisma.course.create({
    data: {
      name: name.trim(),
      price: parseFloat(price),
      period: period || "one-time",
      description: description?.trim() || null,
      features: features?.trim() || null,
      badge: badge?.trim() || null,
      popular: !!popular,
      sortOrder: parseInt(sortOrder) || 0,
    },
  });

  return NextResponse.json(course, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, name, price, period, description, features, badge, popular, active, sortOrder } = body;

  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const course = await prisma.course.update({
    where: { id },
    data: {
      ...(name != null && { name: name.trim() }),
      ...(price != null && { price: parseFloat(price) }),
      ...(period != null && { period }),
      ...(description != null && { description: description.trim() || null }),
      ...(features != null && { features: features.trim() || null }),
      ...(badge != null && { badge: badge.trim() || null }),
      ...(popular != null && { popular: !!popular }),
      ...(active != null && { active: !!active }),
      ...(sortOrder != null && { sortOrder: parseInt(sortOrder) }),
    },
  });

  return NextResponse.json(course);
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  await prisma.course.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
