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

    const dispatches = await prisma.wholesaleOrderDispatch.findMany({
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

    return NextResponse.json({ dispatches });
  } catch (err: any) {
    console.error("Wholesale dispatches GET error:", err);
    return NextResponse.json({ error: err.message || "Failed to load dispatches" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied. Admin required." }, { status: 403 });
    }

    const body = await request.json();
    const { dispatchId, action, createDemoDispatch } = body;

    // Helper for testing order fulfillment dispatch
    if (createDemoDispatch) {
      const firstSupplier = await prisma.wholesaleSupplier.findFirst();
      if (!firstSupplier) {
        return NextResponse.json({ error: "No supplier configured" }, { status: 400 });
      }

      const sampleOrderNum = `HS-${Math.floor(100000 + Math.random() * 900000)}`;
      const sampleDispatch = await prisma.wholesaleOrderDispatch.create({
        data: {
          supplierId: firstSupplier.id,
          orderId: `demo-order-${Date.now()}`,
          orderNumber: sampleOrderNum,
          customerName: "Hemanth B",
          customerPhone: "+91 98765 43210",
          shippingAddress: JSON.stringify({
            street: "42 Tech Park Road, Whitefield",
            city: "Bengaluru",
            state: "Karnataka",
            postalCode: "560066",
            country: "India",
          }),
          items: JSON.stringify([
            {
              sku: "WHL-AUD-NC99",
              title: "AuraBass ANC Pro Wireless Earbuds",
              quantity: 1,
              costPrice: 520,
            },
          ]),
          totalWholesaleCost: 520,
          status: "PENDING",
        },
        include: { supplier: true },
      });

      return NextResponse.json({
        success: true,
        message: "Created sample wholesale order dispatch ready for supplier fulfillment.",
        dispatch: sampleDispatch,
      });
    }

    if (!dispatchId) {
      return NextResponse.json({ error: "dispatchId is required" }, { status: 400 });
    }

    const updated = await WholesaleService.dispatchOrderToSupplier(dispatchId);

    return NextResponse.json({
      success: true,
      message: `Order successfully dispatched to supplier! Carrier: ${updated.carrier}, Tracking: ${updated.trackingNumber}`,
      dispatch: updated,
    });
  } catch (err: any) {
    console.error("Wholesale dispatch error:", err);
    return NextResponse.json({ error: err.message || "Failed to dispatch order" }, { status: 500 });
  }
}
