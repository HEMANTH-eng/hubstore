import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SELLER")) {
      return NextResponse.json({ error: "Access denied. Admin role required." }, { status: 403 });
    }

    const [
      ordersCount,
      customersCount,
      productsCount,
      allOrders,
      lowStockProducts,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.product.count(),
      prisma.order.findMany({
        select: { totalAmount: true, status: true, createdAt: true },
      }),
      prisma.inventory.findMany({
        where: { quantity: { lte: 10 } },
        include: {
          product: { select: { id: true, name: true, sku: true, price: true } },
        },
        take: 8,
      }),
      prisma.order.findMany({
        include: {
          user: { select: { name: true, email: true } },
          payment: { select: { status: true, provider: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.product.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { reviewCount: "desc" },
        take: 5,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          inventory: true,
        },
      }),
    ]);

    const totalRevenue = allOrders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const ordersByStatus = {
      PLACED: allOrders.filter((o) => o.status === "PLACED").length,
      CONFIRMED: allOrders.filter((o) => o.status === "CONFIRMED").length,
      PACKED: allOrders.filter((o) => o.status === "PACKED").length,
      SHIPPED: allOrders.filter((o) => o.status === "SHIPPED").length,
      DELIVERED: allOrders.filter((o) => o.status === "DELIVERED").length,
      CANCELLED: allOrders.filter((o) => o.status === "CANCELLED").length,
    };

    return NextResponse.json({
      stats: {
        totalRevenue: Math.round(totalRevenue),
        ordersCount,
        customersCount,
        productsCount,
        lowStockCount: lowStockProducts.length,
        averageOrderValue: ordersCount > 0 ? Math.round(totalRevenue / ordersCount) : 0,
      },
      ordersByStatus,
      recentOrders,
      lowStockProducts,
      topProducts,
    });
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 });
  }
}
