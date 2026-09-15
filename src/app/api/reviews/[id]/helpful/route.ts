import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.review.findUnique({
      where: { id },
      select: { id: true, helpfulVotes: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const updated = await prisma.review.update({
      where: { id },
      data: {
        helpfulVotes: { increment: 1 },
      },
      select: { id: true, helpfulVotes: true },
    });

    return NextResponse.json({ success: true, helpfulVotes: updated.helpfulVotes });
  } catch (error: any) {
    console.error("Helpful vote error:", error);
    return NextResponse.json(
      { error: "Failed to record helpful vote" },
      { status: 500 }
    );
  }
}
