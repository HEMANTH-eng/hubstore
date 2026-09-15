import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: Request) {
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
    const { rows } = body;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "No rows provided for import. Please upload a valid CSV file." },
        { status: 400 }
      );
    }

    // Pre-fetch all products with their SKUs
    const allProducts = await prisma.product.findMany({
      select: {
        id: true,
        sku: true,
        name: true,
      },
    });

    const skuToProductMap = new Map<string, { id: string; name: string }>();
    allProducts.forEach((p) => {
      skuToProductMap.set(p.sku.toLowerCase().trim(), { id: p.id, name: p.name });
    });

    const results: {
      sku: string;
      status: "UPDATED" | "SKIPPED" | "ERROR";
      message: string;
    }[] = [];

    const updatesToApply: Array<{
      productId: string;
      productData: any;
      inventoryData: any;
    }> = [];

    // Validate and prepare row updates
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rawSku = (row.sku || "").toString().trim();

      if (!rawSku) {
        results.push({
          sku: `Row ${i + 1}`,
          status: "ERROR",
          message: "Missing SKU identifier in row.",
        });
        continue;
      }

      const matched = skuToProductMap.get(rawSku.toLowerCase());
      if (!matched) {
        results.push({
          sku: rawSku,
          status: "SKIPPED",
          message: `SKU "${rawSku}" not found in current catalog.`,
        });
        continue;
      }

      const productData: any = {};
      const inventoryData: any = {};

      if (row.price !== undefined && row.price !== null && row.price !== "") {
        const p = parseFloat(row.price);
        if (!isNaN(p) && p >= 0) productData.price = p;
      }

      if (row.compareAtPrice !== undefined && row.compareAtPrice !== null && row.compareAtPrice !== "") {
        const cap = parseFloat(row.compareAtPrice);
        if (!isNaN(cap) && cap >= 0) productData.compareAtPrice = cap;
      }

      if (row.dispatchDays !== undefined && row.dispatchDays !== null && row.dispatchDays !== "") {
        const dd = parseInt(row.dispatchDays, 10);
        if (!isNaN(dd) && dd >= 1 && dd <= 14) productData.dispatchDays = dd;
      }

      if (row.status && ["PUBLISHED", "DRAFT", "ARCHIVED"].includes(row.status.toUpperCase())) {
        productData.status = row.status.toUpperCase();
      }

      if (row.quantity !== undefined && row.quantity !== null && row.quantity !== "") {
        const q = parseInt(row.quantity, 10);
        if (!isNaN(q) && q >= 0) inventoryData.quantity = q;
      }

      if (row.lowStockThreshold !== undefined && row.lowStockThreshold !== null && row.lowStockThreshold !== "") {
        const t = parseInt(row.lowStockThreshold, 10);
        if (!isNaN(t) && t >= 0) inventoryData.lowStockThreshold = t;
      }

      if (Object.keys(productData).length === 0 && Object.keys(inventoryData).length === 0) {
        results.push({
          sku: rawSku,
          status: "SKIPPED",
          message: "No valid update fields detected for this row.",
        });
        continue;
      }

      updatesToApply.push({
        productId: matched.id,
        productData,
        inventoryData,
      });

      results.push({
        sku: rawSku,
        status: "UPDATED",
        message: `Validated for ${matched.name}`,
      });
    }

    // Apply valid updates atomically in transaction
    if (updatesToApply.length > 0) {
      await prisma.$transaction(async (tx) => {
        for (const u of updatesToApply) {
          if (Object.keys(u.productData).length > 0) {
            await tx.product.update({
              where: { id: u.productId },
              data: u.productData,
            });
          }

          if (Object.keys(u.inventoryData).length > 0) {
            await tx.inventory.upsert({
              where: { productId: u.productId },
              create: {
                productId: u.productId,
                quantity: u.inventoryData.quantity ?? 0,
                lowStockThreshold: u.inventoryData.lowStockThreshold ?? 5,
              },
              update: u.inventoryData,
            });
          }
        }
      });
    }

    const updatedCount = results.filter((r) => r.status === "UPDATED").length;
    const skippedCount = results.filter((r) => r.status === "SKIPPED").length;
    const errorCount = results.filter((r) => r.status === "ERROR").length;

    return NextResponse.json({
      success: true,
      summary: {
        totalRows: rows.length,
        updatedCount,
        skippedCount,
        errorCount,
      },
      results,
    });
  } catch (error: any) {
    console.error("Failed to import CSV inventory:", error);
    return NextResponse.json(
      { error: error.message || "Failed to import CSV inventory" },
      { status: 500 }
    );
  }
}
