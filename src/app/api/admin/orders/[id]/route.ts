import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin required." }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, carrier, trackingNumber, notes } = body;

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { shipment: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id },
        data: {
          ...(status ? { status } : {}),
          ...(notes ? { notes } : {}),
        },
      });

      if (carrier || trackingNumber || status) {
        await tx.shipment.upsert({
          where: { orderId: id },
          create: {
            orderId: id,
            carrier: carrier || "HubStore Express",
            trackingNumber: trackingNumber || `TRK${Math.floor(100000000 + Math.random() * 900000000)}IN`,
            status: status === "DELIVERED" ? "DELIVERED" : status === "SHIPPED" ? "IN_TRANSIT" : "LABEL_CREATED",
            shippedAt: status === "SHIPPED" ? new Date() : undefined,
            deliveredAt: status === "DELIVERED" ? new Date() : undefined,
          },
          update: {
            ...(carrier ? { carrier } : {}),
            ...(trackingNumber ? { trackingNumber } : {}),
            ...(status === "SHIPPED" ? { status: "IN_TRANSIT", shippedAt: new Date() } : {}),
            ...(status === "DELIVERED" ? { status: "DELIVERED", deliveredAt: new Date() } : {}),
          },
        });
      }

      // Notify customer of order progress
      if (status) {
        await tx.notification.create({
          data: {
            userId: existingOrder.userId,
            title: `Order #${existingOrder.orderNumber} Update`,
            message: `Your order status has been updated to ${status}.`,
            type: "ORDER",
            link: `/orders/${existingOrder.id}`,
          },
        });
      }

      return order;
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update order" }, { status: 500 });
  }
}
