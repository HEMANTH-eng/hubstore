import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { WholesaleService } from "@/lib/wholesale";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied. Admin required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get("supplierId");
    const category = searchParams.get("category");
    const search = searchParams.get("q");
    const imported = searchParams.get("imported");

    const where: any = {};
    if (supplierId) where.supplierId = supplierId;
    if (category) where.category = category;
    if (imported === "true") where.importedToStore = true;
    if (imported === "false") where.importedToStore = false;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { supplierSku: { contains: search, mode: "insensitive" } },
      ];
    }

    const products = await prisma.wholesaleProduct.findMany({
      where,
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            provider: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const categories = await prisma.wholesaleProduct.findMany({
      select: { category: true },
      distinct: ["category"],
    });

    return NextResponse.json({
      products,
      categories: categories.map((c) => c.category),
    });
  } catch (err: any) {
    console.error("Wholesale catalog GET error:", err);
    return NextResponse.json({ error: err.message || "Failed to load catalog" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied. Admin required." }, { status: 403 });
    }

    const body = await request.json();
    const { supplierId, query } = body;

    if (!supplierId) {
      return NextResponse.json({ error: "supplierId is required" }, { status: 400 });
    }

    const count = await WholesaleService.syncSupplierCatalog(supplierId, query);

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${count} wholesale products from supplier.`,
      count,
    });
  } catch (err: any) {
    console.error("Wholesale catalog sync POST error:", err);
    return NextResponse.json({ error: err.message || "Sync failed" }, { status: 500 });
  }
}
