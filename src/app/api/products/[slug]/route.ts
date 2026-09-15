import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { order: "asc" } },
        category: true,
        subcategory: true,
        brand: true,
        variants: true,
        inventory: true,
        reviews: {
          include: {
            user: { select: { name: true, image: true } },
            images: true,
          },
          orderBy: { createdAt: "desc" },
          take: 15,
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const ratingDistribution = await prisma.rating.findUnique({
      where: { productId: product.id },
    });

    return NextResponse.json({
      product,
      ratingDistribution,
    });
  } catch (error: any) {
    console.error("Product detail error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
