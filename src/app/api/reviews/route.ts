import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { reviewSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Please log in to submit a review" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = reviewSchema.parse(body);

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId: data.productId,
          userId: user.id,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already submitted a review for this product" },
        { status: 400 }
      );
    }

    // Check if user has purchased this product to give verified badge
    const purchasedOrder = await prisma.order.findFirst({
      where: {
        userId: user.id,
        status: { in: ["DELIVERED", "SHIPPED", "CONFIRMED"] },
        items: {
          some: { productId: data.productId },
        },
      },
      select: { id: true },
    });

    const isVerified = Boolean(purchasedOrder);

    const review = await prisma.review.create({
      data: {
        productId: data.productId,
        userId: user.id,
        orderId: purchasedOrder?.id || null,
        rating: data.rating,
        title: data.title || null,
        comment: data.comment,
        isVerified,
        images:
          data.images && data.images.length > 0
            ? {
                create: data.images.map((url) => ({ url })),
              }
            : undefined,
      },
      include: {
        user: { select: { name: true, image: true } },
        images: true,
      },
    });

    // Recompute product rating and count
    const allReviews = await prisma.review.findMany({
      where: { productId: data.productId },
      select: { rating: true },
    });

    const totalCount = allReviews.length;
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / (totalCount || 1);

    await prisma.product.update({
      where: { id: data.productId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: totalCount,
      },
    });

    // Update rating breakdown
    const distribution = {
      fiveStar: allReviews.filter((r) => r.rating === 5).length,
      fourStar: allReviews.filter((r) => r.rating === 4).length,
      threeStar: allReviews.filter((r) => r.rating === 3).length,
      twoStar: allReviews.filter((r) => r.rating === 2).length,
      oneStar: allReviews.filter((r) => r.rating === 1).length,
    };

    await prisma.rating.upsert({
      where: { productId: data.productId },
      create: {
        productId: data.productId,
        average: Math.round(avgRating * 10) / 10,
        totalCount,
        ...distribution,
      },
      update: {
        average: Math.round(avgRating * 10) / 10,
        totalCount,
        ...distribution,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.errors?.[0]?.message || error.message || "Failed to submit review" },
      { status: 400 }
    );
  }
}
