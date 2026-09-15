import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: true,
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(
      { categories },
      {
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error: any) {
    console.error("Categories fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
