import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { razorpayProvider } from "@/lib/payments/razorpay";
import { stripeProvider } from "@/lib/payments/stripe";
import { codProvider } from "@/lib/payments/cod";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, paymentId, signature, provider = "RAZORPAY", method = "UPI", metadata } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user.id },
      include: { payment: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify through the selected payment provider
    let verificationResult;
    const verifyParams = {
      orderId: order.id,
      paymentId: paymentId || `pay_${Math.random().toString(36).substring(2, 14)}`,
      signature,
      provider,
      metadata,
    };

    if (provider === "STRIPE") {
      verificationResult = await stripeProvider.verifyPayment(verifyParams);
    } else if (provider === "COD") {
      verificationResult = await codProvider.verifyPayment(verifyParams);
    } else {
      verificationResult = await razorpayProvider.verifyPayment(verifyParams);
    }

    if (!verificationResult.success) {
      return NextResponse.json(
        { error: verificationResult.message || "Payment verification failed" },
        { status: 400 }
      );
    }

    // Confirm order and mark payment as SUCCESS safely
    if (order.payment) {
      await prisma.payment.update({
        where: { id: order.payment.id },
        data: {
          status: "SUCCESS",
          method: method || "ONLINE",
          transactionId: verificationResult.transactionId || paymentId,
          paymentData: JSON.stringify({
            verifiedAt: new Date().toISOString(),
            provider,
            ...metadata,
          }),
        },
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "CONFIRMED",
      },
    });

    // Customer notification
    try {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Payment Confirmed",
          message: `Payment of ₹${order.totalAmount.toLocaleString("en-IN")} confirmed for order #${order.orderNumber}.`,
          type: "ORDER",
          link: `/orders/${order.id}`,
        },
      });
    } catch (notifErr) {
      console.warn("Notification notice:", notifErr);
    }

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified and order confirmed.",
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}
