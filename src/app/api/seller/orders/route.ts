import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "SELLER" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Seller account required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const query = searchParams.get("q");

    const where: any = {};

    if (status && status !== "ALL") {
      if (status === "CONFIRMED") {
        where.status = { in: ["CONFIRMED", "PLACED"] };
      } else {
        where.status = status;
      }
    }

    if (query) {
      where.OR = [
        { orderNumber: { contains: query } },
        { user: { name: { contains: query } } },
        { address: { name: { contains: query } } },
        { address: { city: { contains: query } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
            variant: true,
          },
        },
        address: true,
        payment: true,
        shipment: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch seller orders" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "SELLER" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Seller account required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { orderId, action, carrier, trackingNumber, estimatedDelivery } = body;

    if (!orderId || !action) {
      return NextResponse.json(
        { error: "Missing required fields: orderId and action" },
        { status: 400 }
      );
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { shipment: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    let newOrderStatus = existingOrder.status;
    let shipmentData: any = {};

    if (action === "PACK") {
      newOrderStatus = "PACKED";
      shipmentData = {
        carrier: carrier || existingOrder.shipment?.carrier || "HubStore Express",
        status: "LABEL_CREATED",
      };
    } else if (action === "DISPATCH") {
      newOrderStatus = "SHIPPED";
      const awb =
        trackingNumber ||
        `BD-IND-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const eta = estimatedDelivery
        ? new Date(estimatedDelivery)
        : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

      shipmentData = {
        carrier: carrier || "BlueDart Express",
        trackingNumber: awb,
        status: "IN_TRANSIT",
        shippedAt: new Date(),
        estimatedDelivery: eta,
      };
    } else if (action === "OUT_FOR_DELIVERY") {
      newOrderStatus = "OUT_FOR_DELIVERY";
      shipmentData = {
        status: "OUT_FOR_DELIVERY",
      };
    } else if (action === "DELIVER") {
      newOrderStatus = "DELIVERED";
      shipmentData = {
        status: "DELIVERED",
        deliveredAt: new Date(),
      };
    } else {
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    // Execute atomic update
    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { status: newOrderStatus },
      }),
      prisma.shipment.upsert({
        where: { orderId },
        create: {
          orderId,
          ...shipmentData,
        },
        update: shipmentData,
      }),
    ]);

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      actionApplied: action,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update fulfillment status" },
      { status: 500 }
    );
  }
}
