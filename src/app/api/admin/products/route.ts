import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SELLER")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const categoryId = searchParams.get("categoryId");

    const where: any = {};
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { sku: { contains: q } },
      ];
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { order: "asc" } },
        category: true,
        brand: true,
        inventory: true,
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SELLER")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      slug,
      sku,
      description,
      shortDescription,
      price,
      compareAtPrice,
      taxRate,
      categoryId,
      brandId,
      stock,
      lowStockThreshold,
      images, // array of url strings
      variants, // array of { title, sku, price, compareAtPrice, stock }
      deliveryTime,
      dispatchDays,
    } = body;

    if (!name || !sku || !price || !categoryId) {
      return NextResponse.json(
        { error: "Product name, SKU, price, and category are required" },
        { status: 400 }
      );
    }

    // Auto-generate slug if not provided
    const productSlug =
      slug?.trim() ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    // Check SKU or Slug uniqueness
    const existing = await prisma.product.findFirst({
      where: { OR: [{ sku }, { slug: productSlug }] },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A product with this SKU or slug already exists" },
        { status: 409 }
      );
    }

    const productImages =
      images && images.length > 0
        ? images.map((url: string, index: number) => ({
            url,
            isPrimary: index === 0,
            order: index,
          }))
        : [
            {
              url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop",
              isPrimary: true,
              order: 0,
            },
          ];

    const newProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name,
          slug: productSlug,
          sku,
          description: description || name,
          shortDescription: shortDescription || null,
          price: parseFloat(price),
          compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
          taxRate: taxRate ? parseFloat(taxRate) : 18,
          status: "PUBLISHED",
          featured: false,
          deliveryTime: deliveryTime || "5-8 business days",
          dispatchDays: dispatchDays ? parseInt(dispatchDays, 10) : 2,
          categoryId,
          brandId: brandId || null,
          images: {
            create: productImages,
          },
          inventory: {
            create: {
              quantity: parseInt(stock, 10) || 15,
              reservedQuantity: 0,
              lowStockThreshold: parseInt(lowStockThreshold, 10) || 5,
            },
          },
        },
      });

      // Initialize Rating distribution
      await tx.rating.create({
        data: {
          productId: product.id,
          average: 5.0,
          totalCount: 1,
          fiveStar: 1,
          fourStar: 0,
          threeStar: 0,
          twoStar: 0,
          oneStar: 0,
        },
      });

      // Create variants if provided
      if (variants && Array.isArray(variants) && variants.length > 0) {
        for (const v of variants) {
          if (v.title && v.sku) {
            await tx.productVariant.create({
              data: {
                productId: product.id,
                sku: v.sku,
                title: v.title,
                price: v.price ? parseFloat(v.price) : product.price,
                compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice) : null,
                stock: v.stock ? parseInt(v.stock, 10) : 10,
              },
            });
          }
        }
      }

      // If user has a seller profile, connect sellerProduct
      if (user.sellerId) {
        await tx.sellerProduct.create({
          data: {
            sellerId: user.sellerId,
            productId: product.id,
          },
        });
      }

      return product;
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error: any) {
    console.error("Product creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete product" }, { status: 500 });
  }
}
