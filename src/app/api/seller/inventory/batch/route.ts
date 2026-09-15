import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function PUT(request: Request) {
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

    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Payload must include an 'items' array with at least one item." },
        { status: 400 }
      );
    }

    // Execute atomic batch updates
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        if (!item.id) continue;

        // 1. Prepare Product updates if any product fields are provided
        const productUpdate: any = {};
        if (typeof item.price === "number") {
          productUpdate.price = Math.max(0, item.price);
        }
        if (item.compareAtPrice !== undefined) {
          productUpdate.compareAtPrice =
            item.compareAtPrice !== null ? Math.max(0, item.compareAtPrice) : null;
        }
        if (typeof item.dispatchDays === "number") {
          productUpdate.dispatchDays = Math.max(1, Math.min(10, item.dispatchDays));
        }
        if (item.status && ["PUBLISHED", "DRAFT", "ARCHIVED"].includes(item.status)) {
          productUpdate.status = item.status;
        }

        if (Object.keys(productUpdate).length > 0) {
          await tx.product.update({
            where: { id: item.id },
            data: productUpdate,
          });
        }

        // 2. Prepare Inventory upsert if quantity or lowStockThreshold are provided
        if (item.quantity !== undefined || item.lowStockThreshold !== undefined) {
          const qty = item.quantity !== undefined ? Math.max(0, Math.round(item.quantity)) : undefined;
          const threshold =
            item.lowStockThreshold !== undefined
              ? Math.max(0, Math.round(item.lowStockThreshold))
              : undefined;

          await tx.inventory.upsert({
            where: { productId: item.id },
            create: {
              productId: item.id,
              quantity: qty ?? 0,
              lowStockThreshold: threshold ?? 5,
            },
            update: {
              ...(qty !== undefined ? { quantity: qty } : {}),
              ...(threshold !== undefined ? { lowStockThreshold: threshold } : {}),
            },
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${items.length} inventory item(s).`,
      updatedCount: items.length,
    });
  } catch (error: any) {
    console.error("Failed to perform batch inventory update:", error);
    return NextResponse.json(
      { error: error.message || "Failed to perform batch inventory update" },
      { status: 500 }
    );
  }
}
