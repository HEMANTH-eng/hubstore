import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to cancel your order" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { reason = "Customer requested cancellation" } = body;

    const order = await prisma.order.findFirst({
      where: {
        id,
        ...(user.role !== "ADMIN" ? { userId: user.id } : {}),
      },
      include: {
        items: true,
        payment: true,
        shipment: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "CANCELLED") {
      return NextResponse.json({ error: "This order is already cancelled" }, { status: 400 });
    }

    if (["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.status)) {
      return NextResponse.json(
        { error: "Order has already been dispatched. You can request a Return/Replacement once delivered." },
        { status: 400 }
      );
    }

    // Update order status to CANCELLED
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "CANCELLED",
        notes: order.notes
          ? `${order.notes}\n[Cancelled: ${reason}]`
          : `[Cancelled: ${reason}]`,
      },
    });

    // Update payment status to REFUNDED if paid
    if (order.payment && order.payment.status === "SUCCESS") {
      await prisma.payment.update({
        where: { id: order.payment.id },
        data: {
          status: "REFUNDED",
        },
      });
    }

    // Restock inventory safely
    for (const item of order.items) {
      try {
        if (item.variantId) {
          await prisma.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
        await prisma.inventory.update({
          where: { productId: item.productId },
          data: { quantity: { increment: item.quantity } },
        });
      } catch (stockErr) {
        console.warn("Could not restock item:", item.productId, stockErr);
      }
    }

    // Send customer notification
    try {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Order Cancelled",
          message: `Order #${order.orderNumber} has been cancelled.${
            order.payment?.status === "SUCCESS"
              ? " Your refund of ₹" + order.totalAmount.toLocaleString("en-IN") + " has been initiated and will reflect in 3-5 business days."
              : ""
          }`,
          type: "ORDER",
          link: `/orders/${order.id}`,
        },
      });
    } catch (notifErr) {
      console.warn("Notification notice:", notifErr);
    }

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
      order: updatedOrder,
    });
  } catch (err: any) {
    console.error("Order cancellation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to cancel order" },
      { status: 500 }
    );
  }
}
