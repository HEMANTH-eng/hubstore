import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SELLER")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { productId, quantity, lowStockThreshold } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const updatedInventory = await prisma.inventory.upsert({
      where: { productId },
      create: {
        productId,
        quantity: parseInt(quantity, 10) || 0,
        lowStockThreshold: parseInt(lowStockThreshold, 10) || 5,
      },
      update: {
        ...(quantity !== undefined ? { quantity: parseInt(quantity, 10) } : {}),
        ...(lowStockThreshold !== undefined
          ? { lowStockThreshold: parseInt(lowStockThreshold, 10) }
          : {}),
      },
    });

    return NextResponse.json({ success: true, inventory: updatedInventory });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update inventory" }, { status: 500 });
  }
}
