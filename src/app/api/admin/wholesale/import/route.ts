import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { WholesaleService } from "@/lib/wholesale";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied. Admin required." }, { status: 403 });
    }

    const body = await request.json();
    const { wholesaleProductId, wholesaleProductIds } = body;

    const idsToImport: string[] = wholesaleProductIds || (wholesaleProductId ? [wholesaleProductId] : []);

    if (idsToImport.length === 0) {
      return NextResponse.json({ error: "wholesaleProductId is required" }, { status: 400 });
    }

    const importedProducts = [];
    for (const id of idsToImport) {
      const product = await WholesaleService.importProductToStore(id);
      importedProducts.push(product);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${importedProducts.length} product(s) to HypperStore live catalog!`,
      products: importedProducts,
    });
  } catch (err: any) {
    console.error("Wholesale product import error:", err);
    return NextResponse.json({ error: err.message || "Failed to import wholesale product" }, { status: 500 });
  }
}
