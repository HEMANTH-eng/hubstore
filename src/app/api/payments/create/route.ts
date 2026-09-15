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
    const { orderId, provider = "RAZORPAY" } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user.id },
      include: { user: true, payment: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    let result;
    const intentParams = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
      currency: "INR",
      customer: {
        name: order.user?.name,
        email: order.user?.email || user.email,
        phone: order.user?.phone,
      },
    };

    if (provider === "STRIPE") {
      result = await stripeProvider.createPaymentOrder(intentParams);
    } else if (provider === "COD") {
      result = await codProvider.createPaymentOrder(intentParams);
    } else {
      result = await razorpayProvider.createPaymentOrder(intentParams);
    }

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    // Update payment record with intent info
    if (order.payment) {
      await prisma.payment.update({
        where: { id: order.payment.id },
        data: {
          provider,
          transactionId: result.transactionId || null,
          paymentData: JSON.stringify(result.data || {}),
        },
      });
    }

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
      provider,
      paymentData: result.data,
      transactionId: result.transactionId,
    });
  } catch (error: any) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
