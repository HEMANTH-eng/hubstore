import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied. Admin required." }, { status: 403 });
    }

    const coupons = await prisma.coupon.findMany({
      include: {
        _count: { select: { usages: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ coupons });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied. Admin required." }, { status: 403 });
    }

    const body = await request.json();
    const {
      code,
      description,
      type, // PERCENTAGE | FIXED
      value,
      minOrderValue,
      maxDiscount,
      usageLimit,
      expiresAt,
    } = body;

    if (!code || !value) {
      return NextResponse.json({ error: "Coupon code and discount value are required" }, { status: 400 });
    }

    const couponCode = code.trim().toUpperCase();

    const existing = await prisma.coupon.findUnique({
      where: { code: couponCode },
    });

    if (existing) {
      return NextResponse.json({ error: "A coupon with this code already exists" }, { status: 409 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: couponCode,
        description: description || null,
        type: type || "PERCENTAGE",
        value: parseFloat(value),
        minOrderValue: minOrderValue ? parseFloat(minOrderValue) : 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create coupon" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    await prisma.coupon.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Coupon removed successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete coupon" }, { status: 500 });
  }
}
