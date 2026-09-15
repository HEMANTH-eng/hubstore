import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { couponValidateSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, cartSubtotal } = couponValidateSchema.parse(body);

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json(
        { error: "Invalid or expired coupon code" },
        { status: 400 }
      );
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This coupon code has expired" },
        { status: 400 }
      );
    }

    if (coupon.minOrderValue && cartSubtotal < coupon.minOrderValue) {
      return NextResponse.json(
        {
          error: `Coupon applies only on orders above ₹${coupon.minOrderValue.toLocaleString("en-IN")}`,
        },
        { status: 400 }
      );
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { error: "This coupon's usage limit has been reached" },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (coupon.type === "PERCENTAGE") {
      discountAmount = (cartSubtotal * coupon.value) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.value;
    }

    // Discount cannot exceed cart total
    discountAmount = Math.min(discountAmount, cartSubtotal);

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        description: coupon.description,
        discountAmount: Math.round(discountAmount * 100) / 100,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to validate coupon" },
      { status: 400 }
    );
  }
}
