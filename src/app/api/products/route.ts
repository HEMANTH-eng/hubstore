import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { detectAndCorrectTypo } from "@/lib/search";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const categorySlug = searchParams.get("category");
    const subcategorySlug = searchParams.get("subcategory");
    const brandSlugs = searchParams.get("brands")?.split(",").filter(Boolean);
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;
    const minRating = searchParams.get("minRating") ? parseFloat(searchParams.get("minRating")!) : undefined;
    const inStock = searchParams.get("inStock") === "true";
    const sort = searchParams.get("sort") || "featured";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const skip = (page - 1) * limit;

    let where: any = {
      status: "PUBLISHED",
    };

    // Keyword search
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { sku: { contains: q, mode: "insensitive" } },
        { brand: { name: { contains: q, mode: "insensitive" } } },
        { category: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    // Category filter
    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    // Subcategory filter
    if (subcategorySlug) {
      where.subcategory = { slug: subcategorySlug };
    }

    // Brands filter
    if (brandSlugs && brandSlugs.length > 0) {
      where.brand = { slug: { in: brandSlugs } };
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    // Rating filter
    if (minRating !== undefined) {
      where.rating = { gte: minRating };
    }

    // Stock availability
    if (inStock) {
      where.inventory = { quantity: { gt: 0 } };
    }

    // Sorting
    let orderBy: any = { featured: "desc" };
    if (sort === "price-asc") orderBy = { price: "asc" };
    else if (sort === "price-desc") orderBy = { price: "desc" };
    else if (sort === "rating") orderBy = { rating: "desc" };
    else if (sort === "newest") orderBy = { createdAt: "desc" };

    let [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { order: "asc" } },
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
          inventory: { select: { quantity: true, lowStockThreshold: true } },
          variants: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Typo Correction Fallback: If 0 results found, check for typo and auto-search corrected term
    let didYouMean: string | null = null;
    if (totalCount === 0 && q) {
      const typo = detectAndCorrectTypo(q);
      if (typo.isTypo && typo.corrected) {
        const fallbackWhere = {
          ...where,
          OR: [
            { name: { contains: typo.corrected } },
            { description: { contains: typo.corrected } },
            { sku: { contains: typo.corrected } },
            { brand: { name: { contains: typo.corrected } } },
            { category: { name: { contains: typo.corrected } } },
          ],
        };

        const [correctedProducts, correctedTotal] = await Promise.all([
          prisma.product.findMany({
            where: fallbackWhere,
            include: {
              images: { orderBy: { order: "asc" } },
              category: { select: { id: true, name: true, slug: true } },
              brand: { select: { id: true, name: true, slug: true } },
              inventory: { select: { quantity: true, lowStockThreshold: true } },
              variants: true,
            },
            orderBy,
            skip,
            take: limit,
          }),
          prisma.product.count({ where: fallbackWhere }),
        ]);

        if (correctedTotal > 0) {
          products = correctedProducts;
          totalCount = correctedTotal;
          didYouMean = typo.corrected;
        }
      }
    }

    return NextResponse.json(
      {
        products,
        didYouMean,
        originalQuery: q || null,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error: any) {
    console.error("Products query error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
