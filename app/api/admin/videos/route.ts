import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "ADMIN") return null;
  return session;
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const courseId = req.nextUrl.searchParams.get("courseId");
  if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });

  const videos = await prisma.video.findMany({
    where: { courseId },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(videos);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId, title, description, blobUrl, fileName, fileSize, sortOrder } = await req.json();
  if (!courseId || !title || !blobUrl) {
    return NextResponse.json({ error: "courseId, title and blobUrl are required" }, { status: 400 });
  }

  const video = await prisma.video.create({
    data: {
      courseId,
      title: title.trim(),
      description: description?.trim() || null,
      blobUrl,
      fileName: fileName || "video",
      fileSize: fileSize || 0,
      sortOrder: parseInt(sortOrder) || 0,
    },
  });
  return NextResponse.json(video, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, title, description, sortOrder } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const video = await prisma.video.update({
    where: { id },
    data: {
      ...(title != null && { title: title.trim() }),
      ...(description != null && { description: description.trim() || null }),
      ...(sortOrder != null && { sortOrder: parseInt(sortOrder) }),
    },
  });
  return NextResponse.json(video);
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const video = await prisma.video.findUnique({ where: { id } });
  if (video) {
    try { await del(video.blobUrl); } catch {}
    await prisma.video.delete({ where: { id } });
  }
  return NextResponse.json({ success: true });
}
