import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { APP_CONFIG } from "@/lib/constants";
import { codProvider } from "@/lib/payments/cod";
import { razorpayProvider } from "@/lib/payments/razorpay";
import { stripeProvider } from "@/lib/payments/stripe";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Please log in to complete your purchase" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { items, addressId, paymentMethod, couponCode, deliveryMethod, notes } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
    }

    if (!addressId) {
      return NextResponse.json({ error: "Please select a delivery address" }, { status: 400 });
    }

    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: user.id },
    });

    if (!address) {
      return NextResponse.json({ error: "Selected address was not found" }, { status: 404 });
    }

    // Recalculate prices and validate inventory strictly against the database
    const productIds = items.map((i: any) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        inventory: true,
        variants: true,
      },
    });

    const validatedOrderItems: Array<{
      productId: string;
      variantId?: string | null;
      quantity: number;
      unitPrice: number;
      total: number;
    }> = [];

    let calculatedSubtotal = 0;

    for (const item of items) {
      const dbProd = dbProducts.find((p) => p.id === item.productId);
      if (!dbProd || dbProd.status !== "PUBLISHED") {
        return NextResponse.json(
          { error: `Product "${item.name || item.productId}" is no longer available.` },
          { status: 400 }
        );
      }

      // Check variant price and stock if variant selected
      let unitPrice = dbProd.price;
      let availableStock = dbProd.inventory?.quantity || 0;

      if (item.variantId) {
        const variant = dbProd.variants.find((v) => v.id === item.variantId);
        if (variant) {
          unitPrice = variant.price;
          availableStock = variant.stock;
        }
      }

      if (item.quantity > availableStock) {
        return NextResponse.json(
          {
            error: `Only ${availableStock} units of "${dbProd.name}" are currently available in stock.`,
          },
          { status: 400 }
        );
      }

      const itemTotal = unitPrice * item.quantity;
      calculatedSubtotal += itemTotal;

      validatedOrderItems.push({
        productId: dbProd.id,
        variantId: item.variantId || null,
        quantity: item.quantity,
        unitPrice,
        total: itemTotal,
      });
    }

    // Validate coupon if provided
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (coupon && coupon.isActive) {
        if (!coupon.expiresAt || coupon.expiresAt >= new Date()) {
          if (!coupon.minOrderValue || calculatedSubtotal >= coupon.minOrderValue) {
            if (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit) {
              if (coupon.type === "PERCENTAGE") {
                discountAmount = (calculatedSubtotal * coupon.value) / 100;
                if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                  discountAmount = coupon.maxDiscount;
                }
              } else {
                discountAmount = coupon.value;
              }
              discountAmount = Math.min(discountAmount, calculatedSubtotal);
            }
          }
        }
      }
    }

    // Calculate shipping
    let shippingAmount = 0;
    if (calculatedSubtotal < APP_CONFIG.freeShippingThreshold) {
      shippingAmount =
        deliveryMethod === "EXPRESS"
          ? APP_CONFIG.expressShippingFee
          : APP_CONFIG.standardShippingFee;
    } else if (deliveryMethod === "EXPRESS") {
      shippingAmount = APP_CONFIG.expressShippingFee - APP_CONFIG.standardShippingFee;
    }

    // Calculate taxes (18% included GST or additional)
    const taxableTotal = Math.max(0, calculatedSubtotal - discountAmount);
    const taxAmount = Math.round(taxableTotal * (APP_CONFIG.taxRatePercent / 100) * 100) / 100;

    // Final grand total
    const totalAmount = Math.round((taxableTotal + shippingAmount) * 100) / 100;

    // Generate unique order number
    const orderNumber = `NC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Prepare payment intent through abstraction
    let paymentResult;
    if (paymentMethod === "COD") {
      paymentResult = await codProvider.createPaymentOrder({
        orderId: orderNumber,
        orderNumber,
        amount: totalAmount,
        currency: "INR",
        customer: { name: user.name, email: user.email },
      });
    } else if (paymentMethod === "STRIPE") {
      paymentResult = await stripeProvider.createPaymentOrder({
        orderId: orderNumber,
        orderNumber,
        amount: totalAmount,
        currency: "INR",
        customer: { name: user.name, email: user.email },
      });
    } else {
      // Default to Razorpay
      paymentResult = await razorpayProvider.createPaymentOrder({
        orderId: orderNumber,
        orderNumber,
        amount: totalAmount,
        currency: "INR",
        customer: { name: user.name, email: user.email },
      });
    }

    if (!paymentResult.success) {
      return NextResponse.json({ error: paymentResult.message }, { status: 400 });
    }

    // Create order with full relations (atomically in a single query)
    const createdOrder = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        addressId: address.id,
        status: paymentMethod === "COD" ? "CONFIRMED" : "PLACED",
        subtotal: calculatedSubtotal,
        discountAmount,
        shippingAmount,
        taxAmount,
        totalAmount,
        couponCode: discountAmount > 0 ? couponCode : null,
        notes,
        items: {
          create: validatedOrderItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.unitPrice,
            total: item.total,
          })),
        },
        payment: {
          create: {
            amount: totalAmount,
            currency: "INR",
            provider: paymentMethod,
            method: paymentMethod === "COD" ? "CASH" : "ONLINE",
            status: paymentMethod === "COD" ? "SUCCESS" : "PENDING",
            transactionId: paymentResult.transactionId || null,
            paymentData: JSON.stringify(paymentResult.data || {}),
          },
        },
        shipment: {
          create: {
            carrier: "HypperStore Express",
            trackingNumber: `TRK${Math.floor(100000000 + Math.random() * 900000000)}IN`,
            status: "LABEL_CREATED",
            estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          },
        },
      },
      include: {
        items: { include: { product: true } },
        payment: true,
        shipment: true,
        address: true,
      },
    });

    // 2. Decrement inventory (safe and resilient)
    for (const item of validatedOrderItems) {
      try {
        if (item.variantId) {
          await prisma.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }
        await prisma.inventory.update({
          where: { productId: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });
      } catch (invErr) {
        console.warn("Inventory decrement notice:", invErr);
      }
    }

    // 3. Record coupon usage if applicable
    if (couponCode && discountAmount > 0) {
      try {
        const coupon = await prisma.coupon.findUnique({
          where: { code: couponCode.toUpperCase() },
        });
        if (coupon) {
          await prisma.coupon.update({
            where: { id: coupon.id },
            data: { usageCount: { increment: 1 } },
          });

          await prisma.couponUsage.create({
            data: {
              couponId: coupon.id,
              userId: user.id,
              orderId: createdOrder.id,
            },
          });
        }
      } catch (cpnErr) {
        console.warn("Coupon usage record notice:", cpnErr);
      }
    }

    // 4. Create user notification
    try {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Order Placed Successfully",
          message: `Your order #${orderNumber} for ₹${totalAmount.toLocaleString("en-IN")} has been placed and is being processed.`,
          type: "ORDER",
          link: `/orders/${createdOrder.id}`,
        },
      });
    } catch (notifErr) {
      console.warn("Notification record notice:", notifErr);
    }

    return NextResponse.json({
      success: true,
      order: createdOrder,
      paymentResult,
    });
  } catch (error: any) {
    console.error("Checkout execution error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process order checkout" },
      { status: 500 }
    );
  }
}
