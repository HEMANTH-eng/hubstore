import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { WholesaleService } from "@/lib/wholesale";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied. Admin required." }, { status: 403 });
    }

    // Ensure default demo wholesale supplier exists
    await WholesaleService.ensureDefaultSupplier();

    const suppliers = await prisma.wholesaleSupplier.findMany({
      include: {
        _count: {
          select: {
            products: true,
            dispatches: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const totalImported = await prisma.wholesaleProduct.count({
      where: { importedToStore: true },
    });

    const pendingDispatches = await prisma.wholesaleOrderDispatch.count({
      where: { status: "PENDING" },
    });

    return NextResponse.json({
      suppliers,
      stats: {
        totalSuppliers: suppliers.length,
        totalWholesaleProducts: suppliers.reduce((acc, s) => acc + s._count.products, 0),
        totalImportedToStore: totalImported,
        pendingDispatches,
      },
    });
  } catch (err: any) {
    console.error("Wholesale suppliers GET error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
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
      id,
      name,
      provider,
      apiKey,
      apiSecret,
      endpointUrl,
      markupType = "PERCENTAGE",
      markupValue = 35.0,
      autoFulfill = false,
      isActive = true,
      testOnly = false,
    } = body;

    if (!name || !provider) {
      return NextResponse.json({ error: "Supplier name and provider are required." }, { status: 400 });
    }

    const adapter = WholesaleService.getAdapter(provider);
    const testRes = await adapter.testConnection({
      name,
      provider,
      apiKey,
      apiSecret,
      endpointUrl,
      markupType,
      markupValue,
      autoFulfill,
      isActive,
    });

    if (testOnly) {
      return NextResponse.json({ testResult: testRes });
    }

    let supplier;
    if (id) {
      supplier = await prisma.wholesaleSupplier.update({
        where: { id },
        data: {
          name,
          provider,
          apiKey,
          apiSecret,
          endpointUrl,
          markupType,
          markupValue: parseFloat(markupValue),
          autoFulfill: Boolean(autoFulfill),
          isActive: Boolean(isActive),
        },
      });
    } else {
      supplier = await prisma.wholesaleSupplier.create({
        data: {
          name,
          provider,
          apiKey,
          apiSecret,
          endpointUrl,
          markupType,
          markupValue: parseFloat(markupValue),
          autoFulfill: Boolean(autoFulfill),
          isActive: Boolean(isActive),
        },
      });

      // Auto-sync initial catalog
      await WholesaleService.syncSupplierCatalog(supplier.id);
    }

    return NextResponse.json({
      success: true,
      supplier,
      testResult: testRes,
    });
  } catch (err: any) {
    console.error("Wholesale suppliers POST error:", err);
    return NextResponse.json({ error: err.message || "Failed to save supplier" }, { status: 500 });
  }
}
