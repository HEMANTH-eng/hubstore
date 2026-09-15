import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      itemIds = [],
      reason = "Defective or damaged item",
      resolution = "REFUND",
      refundMethod = "ORIGINAL_PAYMENT",
      pickupDate = new Date().toISOString(),
      pickupSlot = "MORNING",
      pickupAddress = "",
      notes = "",
      photos = [],
    } = body;

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to request a return" }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        payment: true,
        address: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify ownership or admin
    if (user.role !== "ADMIN" && order.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized access to order" }, { status: 403 });
    }

    const returnReference = `RET-${Date.now().toString().slice(-6)}`;
    const reverseAWB = `REV-DEL-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const returnNotes = JSON.stringify({
      returnReference,
      reverseAWB,
      reason,
      resolution,
      refundMethod,
      pickupDate,
      pickupSlot,
      pickupAddress: pickupAddress || (order.address ? `${order.address.street}, ${order.address.city}` : "Customer Address"),
      photos,
      requestedAt: new Date().toISOString(),
      customerNotes: notes,
    });

    // Update order status to RETURNED and save return details in notes
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: "RETURNED",
        notes: returnNotes,
      },
    });

    // If payment exists and resolution is REFUND, update payment status to REFUNDED
    if (order.payment && resolution === "REFUND") {
      await prisma.payment.update({
        where: { id: order.payment.id },
        data: {
          status: "REFUNDED",
        },
      });
    }

    // Create a customer notification record
    await prisma.notification.create({
      data: {
        userId: order.userId,
        title: `Return Approved for Order #${order.orderNumber}`,
        message: `Your return request (${returnReference}) has been approved. Delhivery will pick up the package on ${new Date(pickupDate).toLocaleDateString("en-IN")}. Reverse AWB: ${reverseAWB}.`,
        type: "ORDER",
        link: `/orders/${order.id}`,
      },
    });

    return NextResponse.json({
      success: true,
      returnReference,
      reverseAWB,
      resolution,
      refundMethod,
      status: "APPROVED",
      pickupCourier: "Delhivery Reverse Logistics",
      pickupDate,
      pickupSlot,
      message: "Return request scheduled successfully. Our courier partner will collect the parcel.",
    });
  } catch (error: any) {
    console.error("Return submission error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process return request" },
      { status: 500 }
    );
  }
}
