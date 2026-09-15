import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "SELLER" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Seller or Admin role required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const stockStatus = searchParams.get("stockStatus") || "ALL"; // ALL | IN_STOCK | LOW_STOCK | OUT_OF_STOCK
    const categorySlug = searchParams.get("category");
    const sort = searchParams.get("sort") || "name_asc";

    const where: any = {};

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { sku: { contains: q } },
        { brand: { name: { contains: q } } },
      ];
    }

    if (categorySlug && categorySlug !== "ALL") {
      where.category = { slug: categorySlug };
    }

    // Fetch products with inventory, category, brand, and images
    const products = await prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        inventory: true,
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { url: true, alt: true },
        },
      },
      orderBy:
        sort === "price_desc"
          ? { price: "desc" }
          : sort === "price_asc"
          ? { price: "asc" }
          : sort === "updated_desc"
          ? { updatedAt: "desc" }
          : { name: "asc" },
    });

    // Also fetch all categories for filtering dropdown
    const categories = await prisma.category.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    });

    // Map and calculate aggregated inventory health metrics across all managed products
    const allProducts = await prisma.product.findMany({
      include: {
        inventory: true,
      },
    });

    let totalSkus = allProducts.length;
    let totalUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalValuation = 0;

    allProducts.forEach((p) => {
      const qty = p.inventory?.quantity ?? 0;
      const threshold = p.inventory?.lowStockThreshold ?? 5;

      totalUnits += qty;
      totalValuation += Math.round(p.price * qty);

      if (qty <= 0) {
        outOfStockCount++;
      } else if (qty <= threshold) {
        lowStockCount++;
      }
    });

    // Filter by stockStatus in-memory if needed
    let filteredProducts = products.map((p) => {
      const qty = p.inventory?.quantity ?? 0;
      const threshold = p.inventory?.lowStockThreshold ?? 5;
      let statusType: "OUT_OF_STOCK" | "LOW_STOCK" | "IN_STOCK" = "IN_STOCK";

      if (qty <= 0) {
        statusType = "OUT_OF_STOCK";
      } else if (qty <= threshold) {
        statusType = "LOW_STOCK";
      }

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        taxRate: p.taxRate ?? 18,
        status: p.status, // PUBLISHED | DRAFT | ARCHIVED
        dispatchDays: p.dispatchDays ?? 2,
        deliveryTime: p.deliveryTime ?? "5-8 business days",
        category: p.category?.name || "General",
        categorySlug: p.category?.slug || "",
        brand: p.brand?.name || "HubStore",
        imageUrl:
          p.images?.[0]?.url ||
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
        quantity: qty,
        lowStockThreshold: threshold,
        reservedQuantity: p.inventory?.reservedQuantity ?? 0,
        stockStatus: statusType,
        updatedAt: p.updatedAt,
      };
    });

    if (stockStatus !== "ALL") {
      filteredProducts = filteredProducts.filter(
        (p) => p.stockStatus === stockStatus
      );
    }

    return NextResponse.json({
      success: true,
      metrics: {
        totalSkus,
        totalUnits,
        lowStockCount,
        outOfStockCount,
        totalValuation,
      },
      categories,
      products: filteredProducts,
      count: filteredProducts.length,
    });
  } catch (error: any) {
    console.error("Failed to fetch seller inventory:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}
