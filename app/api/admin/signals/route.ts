import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, winRate, totalSignals, profitPips, barValues } = body;

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const bars = String(barValues).split(",").map((v) => Number(v.trim()));
  if (bars.length !== 7 || bars.some(isNaN)) {
    return NextResponse.json({ error: "barValues must be 7 comma-separated numbers (0-100)" }, { status: 400 });
  }

  const updated = await prisma.signalStat.update({
    where: { id },
    data: {
      winRate: Number(winRate),
      totalSignals: Number(totalSignals),
      profitPips: String(profitPips),
      barValues: bars.join(","),
    },
  });

  return NextResponse.json(updated);
}
