import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, status = "DISPATCHED", channel = "WHATSAPP" } = body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: true } },
        shipment: true,
        address: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    let title = "";
    let message = "";
    const phone = order.address?.phone || "+91 98765 43210";
    const courier = order.shipment?.carrier || "BlueDart Express";
    const awb = order.shipment?.trackingNumber || "BD-IND-86798194";

    switch (status) {
      case "CONFIRMED":
      case "PLACED":
        title = channel === "WHATSAPP" ? "🟢 WhatsApp: Order Confirmed" : "💬 SMS: Order Confirmed";
        message = `Order #${order.orderNumber} confirmed for ₹${order.totalAmount.toLocaleString("en-IN")}. Quality check in progress. Delivery in 5-8 business days.`;
        break;
      case "DISPATCHED":
      case "SHIPPED":
        title = channel === "WHATSAPP" ? "🟢 WhatsApp: Order Dispatched" : "💬 SMS: Order Dispatched";
        message = `Great news! Order #${order.orderNumber} dispatched via ${courier} (AWB: ${awb}). Track live at hubstore.in/orders/${order.id}`;
        break;
      case "OUT_FOR_DELIVERY":
        title = channel === "WHATSAPP" ? "🟢 WhatsApp: Out for Delivery" : "💬 SMS: Out for Delivery";
        message = `Your parcel #${order.orderNumber} is out for delivery today with ${courier}. Delivery OTP: 4892.`;
        break;
      case "DELIVERED":
        title = channel === "WHATSAPP" ? "🟢 WhatsApp: Order Delivered" : "💬 SMS: Order Delivered";
        message = `Order #${order.orderNumber} was delivered safely. Download your GST tax invoice at hubstore.in/orders/${order.id}/invoice`;
        break;
      default:
        title = "🟢 Order Notification";
        message = `Update for Order #${order.orderNumber}: status is ${status}.`;
    }

    // Record notification in database
    const notification = await prisma.notification.create({
      data: {
        userId: user.id,
        title,
        message,
        type: "ORDER",
        link: `/orders/${order.id}`,
      },
    });

    return NextResponse.json({
      success: true,
      channel,
      phone,
      title,
      message,
      notificationId: notification.id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to simulate notification" },
      { status: 500 }
    );
  }
}
