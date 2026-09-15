import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { detectAndCorrectTypo, isLikelySku } from "@/lib/search";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get("q")?.trim() || "";

    if (!rawQuery || rawQuery.length < 1) {
      return NextResponse.json({
        query: "",
        suggestions: [],
        products: [],
        brand: null,
        category: null,
        skuMatch: null,
        didYouMean: null,
      });
    }

    const typoCheck = detectAndCorrectTypo(rawQuery);
    const effectiveQuery = typoCheck.isTypo && typoCheck.corrected ? typoCheck.corrected : rawQuery;
    const isSku = isLikelySku(rawQuery);

    // 1. Search products (by name, description, SKU, brand)
    const productConditions: any[] = [
      { name: { contains: rawQuery, mode: "insensitive" } },
      { sku: { contains: rawQuery, mode: "insensitive" } },
      { brand: { name: { contains: rawQuery, mode: "insensitive" } } },
      { category: { name: { contains: rawQuery, mode: "insensitive" } } },
    ];

    // If typo was corrected, also search with the corrected query
    if (typoCheck.isTypo && typoCheck.corrected) {
      productConditions.push(
        { name: { contains: typoCheck.corrected, mode: "insensitive" } },
        { description: { contains: typoCheck.corrected, mode: "insensitive" } }
      );
    }

    const [matchedProducts, matchedBrands, matchedCategories, skuDirectHit] = await Promise.all([
      // Top 5 products
      prisma.product.findMany({
        where: {
          status: "PUBLISHED",
          OR: productConditions,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          price: true,
          compareAtPrice: true,
          discountPercent: true,
          rating: true,
          reviewCount: true,
          images: { select: { url: true }, take: 1, orderBy: { order: "asc" } },
          category: { select: { name: true, slug: true } },
          brand: { select: { name: true, slug: true } },
          inventory: { select: { quantity: true } },
        },
        take: 5,
      }),

      // Matching Brand
      prisma.brand.findFirst({
        where: {
          OR: [
            { name: { contains: rawQuery, mode: "insensitive" } },
            { slug: { contains: rawQuery.toLowerCase() } },
          ],
        },
        select: { id: true, name: true, slug: true },
      }),

      // Matching Category
      prisma.category.findFirst({
        where: {
          OR: [
            { name: { contains: rawQuery, mode: "insensitive" } },
            { slug: { contains: rawQuery.toLowerCase() } },
          ],
        },
        select: { id: true, name: true, slug: true },
      }),

      // Direct SKU lookup
      prisma.product.findFirst({
        where: {
          status: "PUBLISHED",
          sku: { contains: rawQuery.toUpperCase() },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          price: true,
        },
      }),
    ]);

    // 2. Generate text suggestions (autocomplete phrases)
    const suggestionsSet = new Set<string>();

    // Add matched product names & derived sub-phrases
    matchedProducts.forEach((p) => {
      suggestionsSet.add(p.name);
      // If product has brand, add "Brand + Category/Type"
      if (p.brand?.name) {
        suggestionsSet.add(`${p.brand.name} ${p.category?.name || ""}`.trim());
      }
    });

    if (matchedBrands) {
      suggestionsSet.add(`${matchedBrands.name} Official Store`);
      suggestionsSet.add(`All ${matchedBrands.name} Products`);
    }

    if (matchedCategories) {
      suggestionsSet.add(`${matchedCategories.name} Deals`);
      suggestionsSet.add(`Top Rated in ${matchedCategories.name}`);
    }

    if (typoCheck.isTypo && typoCheck.corrected) {
      suggestionsSet.add(typoCheck.corrected);
    }

    // Limit suggestions to 6 high-value autocomplete items
    const suggestions = Array.from(suggestionsSet).slice(0, 6);

    return NextResponse.json(
      {
        query: rawQuery,
        effectiveQuery,
        didYouMean: typoCheck.isTypo ? typoCheck.corrected : null,
        isTypo: typoCheck.isTypo,
        isSkuQuery: isSku,
        suggestions,
        products: matchedProducts,
        brand: matchedBrands,
        category: matchedCategories,
        skuMatch: skuDirectHit,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=120, s-maxage=600, stale-while-revalidate=1800",
        },
      }
    );
  } catch (error: any) {
    console.error("Search suggestions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}
