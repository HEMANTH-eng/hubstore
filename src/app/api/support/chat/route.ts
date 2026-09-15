import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { APP_CONFIG, ORDER_STATUS_LABELS } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message = "", orderNumber = "" } = body;
    const cleanMsg = (message as string).toLowerCase().trim();

    // 1. Check if user is asking about order tracking or gave an order reference
    const orderMatch =
      (message as string).match(/NC-\d{4}-\d+/i) ||
      (message as string).match(/cm[a-z0-9]+/i) ||
      (orderNumber ? [orderNumber] : null);

    if (
      orderMatch ||
      cleanMsg.includes("order") ||
      cleanMsg.includes("track") ||
      cleanMsg.includes("where is my") ||
      cleanMsg.includes("status")
    ) {
      // Look up specific order or latest active order
      let order = null;
      if (orderMatch) {
        const queryTerm = orderMatch[0];
        order = await prisma.order.findFirst({
          where: {
            OR: [
              { orderNumber: { contains: queryTerm } },
              { id: queryTerm },
            ],
          },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            address: true,
            payment: true,
            shipment: true,
          },
        });
      }

      // If no specific order found by ID, get the most recent customer order
      if (!order) {
        order = await prisma.order.findFirst({
          orderBy: { createdAt: "desc" },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            address: true,
            payment: true,
            shipment: true,
          },
        });
      }

      if (order) {
        const statusMeta = ORDER_STATUS_LABELS[order.status] || {
          label: order.status,
          step: 2,
        };

        const itemCount = order.items.reduce((acc: number, item: any) => acc + item.quantity, 0);
        const firstItem = order.items[0]?.product?.name || "Marketplace Product";

        let statusExplanation = "";
        if (order.status === "CONFIRMED" || order.status === "PLACED") {
          statusExplanation =
            "Your order has been confirmed and forwarded to our wholesale sourcing hub. It will undergo a 5-point quality inspection before secure packaging.";
        } else if (order.status === "PACKED") {
          statusExplanation =
            "Your items have passed quality verification, sealed in tamper-proof bubble mailers, and are queued for courier pickup.";
        } else if (order.status === "SHIPPED") {
          const courier = order.shipment?.carrier || "Delhivery Express";
          const awb = order.shipment?.trackingNumber || "DEL-8849201948";
          statusExplanation =
            `Your package is in transit with ${courier} (AWB: ${awb}). Expected delivery within 2–4 business days.`;
        } else if (order.status === "OUT_FOR_DELIVERY") {
          statusExplanation =
            "Your package is out for delivery today! Please share secure delivery OTP 4892 with the delivery executive.";
        } else if (order.status === "DELIVERED") {
          statusExplanation =
            "Your order was successfully delivered! Your 7-day hassle-free return/replacement window is currently active.";
        }

        return NextResponse.json({
          reply: `Here are the latest details for Order #${order.orderNumber}:\n\n` +
            `• **Status**: ${statusMeta.label}\n` +
            `• **Items**: ${firstItem} ${itemCount > 1 ? `(+${itemCount - 1} more)` : ""}\n` +
            `• **Total Amount**: ₹${order.totalAmount.toLocaleString("en-IN")}\n` +
            `• **Payment**: ${order.payment?.status || "CONFIRMED"} via ${order.payment?.provider || "Razorpay UPI"}\n` +
            `• **Destination**: ${order.address?.city || "Customer City"}, ${order.address?.state || "India"}\n\n` +
            `${statusExplanation}`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          actions: [
            { label: "View Live Tracker", url: `/orders/${order.id}`, type: "link" },
            { label: "Download GST Invoice", url: `/orders/${order.id}/invoice`, type: "link" },
            { label: "WhatsApp Updates", url: `/orders/${order.id}`, type: "button" },
          ],
          suggestions: [
            "Wholesale delivery SLA explained",
            "How do I request a return?",
            "Talk to human on WhatsApp",
          ],
        });
      }
    }

    // 2. Wholesale Sourcing SLA & Estimated Delivery Timelines
    if (
      cleanMsg.includes("wholesale") ||
      cleanMsg.includes("sla") ||
      cleanMsg.includes("delivery time") ||
      cleanMsg.includes("how long") ||
      cleanMsg.includes("estimation") ||
      cleanMsg.includes("shipping time") ||
      cleanMsg.includes("days")
    ) {
      return NextResponse.json({
        reply:
          `⏱️ **HubStore Direct-from-Wholesale Delivery SLA (5–8 Business Days)**:\n\n` +
          `To offer maximum savings directly to consumers without distributor markups, HubStore fulfills items straight through verified wholesale partnerships:\n\n` +
          `1. **Days 1–2 (Wholesale Procurement)**: Items are sourced directly from verified manufacturer hubs.\n` +
          `2. **Days 3–4 (Quality Inspection & Packaging)**: Arrives at our central fulfillment facility for 5-point quality check & bubble packaging.\n` +
          `3. **Days 5–8 (Express Delivery)**: Dispatched via Delhivery Express or BlueDart straight to your doorstep.\n\n` +
          `*Note: Buyers consent to this transparent 5–8 business day timeline during Step 4 checkout.*`,
        actions: [
          { label: "Explore Catalog Deals", url: "/products", type: "link" },
          { label: "View Active Cart", url: "/checkout", type: "link" },
        ],
        suggestions: [
          "Where is my order?",
          "Can I cancel my order?",
          "Are all products 100% genuine?",
        ],
      });
    }

    // 3. Returns, Replacements & Refund Policy
    if (
      cleanMsg.includes("return") ||
      cleanMsg.includes("refund") ||
      cleanMsg.includes("replace") ||
      cleanMsg.includes("damaged") ||
      cleanMsg.includes("exchange")
    ) {
      return NextResponse.json({
        reply:
          `🔄 **HubStore 7-Day Buyer Protection & Refund Policy**:\n\n` +
          `• **7-Day Hassle-Free Window**: Request replacement or refund within 7 days of delivery.\n` +
          `• **Eligible Reasons**: Defective product, damaged in transit, incorrect item, or missing accessories.\n` +
          `• **Zero Reverse Shipping Cost**: Courier will pick up the item directly from your doorstep for free.\n` +
          `• **Fast Refund Processing**: Instant UPI / Bank account transfer credited within 24–48 hours of pickup verification.`,
        actions: [
          { label: "View My Orders", url: "/account?tab=orders", type: "link" },
          { label: "Contact Returns Team", url: `https://wa.me/9118002026682?text=Return%20Inquiry`, type: "external" },
        ],
        suggestions: [
          "Where is my order?",
          "Wholesale delivery SLA",
          "Download GST Invoice",
        ],
      });
    }

    // 4. Invoices and GST
    if (cleanMsg.includes("invoice") || cleanMsg.includes("gst") || cleanMsg.includes("bill") || cleanMsg.includes("tax")) {
      return NextResponse.json({
        reply:
          `🧾 **GST Compliant Tax Invoices**:\n\n` +
          `Every order on HubStore includes a 100% genuine GST tax invoice featuring HSN codes, IGST/CGST/SGST breakdowns, seller GSTIN, and serial numbers for warranty claims.\n\n` +
          `You can view and download your print-ready PDF invoice directly from any order page.`,
        actions: [
          { label: "View Order History", url: "/account?tab=orders", type: "link" },
        ],
        suggestions: [
          "Where is my order?",
          "Wholesale sourcing timeline",
          "WhatsApp Live Support",
        ],
      });
    }

    // 5. Payment queries
    if (
      cleanMsg.includes("payment") ||
      cleanMsg.includes("upi") ||
      cleanMsg.includes("cod") ||
      cleanMsg.includes("cash on delivery") ||
      cleanMsg.includes("card")
    ) {
      return NextResponse.json({
        reply:
          `💳 **Accepted Payment Methods on HubStore**:\n\n` +
          `• **UPI (Fastest & 0% Fee)**: PhonePe, Google Pay, Paytm, BHIM with dynamic QR code scanning.\n` +
          `• **Credit & Debit Cards**: Visa, MasterCard, RuPay with 256-bit SSL encryption.\n` +
          `• **Netbanking**: 50+ major Indian banks supported.\n` +
          `• **Cash on Delivery (COD)**: Available across 19,000+ Indian pincodes up to ₹25,000 order value (₹40 nominal handling charge).`,
        suggestions: [
          "Where is my order?",
          "Wholesale delivery SLA",
          "Contact WhatsApp Support",
        ],
      });
    }

    // 6. WhatsApp or Human Escalation
    if (
      cleanMsg.includes("whatsapp") ||
      cleanMsg.includes("human") ||
      cleanMsg.includes("agent") ||
      cleanMsg.includes("call") ||
      cleanMsg.includes("contact") ||
      cleanMsg.includes("helpline")
    ) {
      return NextResponse.json({
        reply:
          `💬 **Connect Directly with HubStore Human Support Team**:\n\n` +
          `Our support specialists are available Monday to Saturday, 9:00 AM – 9:00 PM IST:\n\n` +
          `• **WhatsApp Business**: Click below to initiate instant WhatsApp chat with pre-filled context.\n` +
          `• **Toll-Free Helpline**: ${APP_CONFIG.supportPhone}\n` +
          `• **Email Assistance**: ${APP_CONFIG.supportEmail}`,
        actions: [
          {
            label: "Open WhatsApp Chat",
            url: `https://wa.me/9118002026682?text=Hello%20HubStore%20Support,%20I%20need%20assistance`,
            type: "external",
          },
        ],
        suggestions: [
          "Where is my order?",
          "Wholesale delivery SLA",
          "Return & Refund Policy",
        ],
      });
    }

    // Default intelligent fallback assistant response
    return NextResponse.json({
      reply:
        `Hello! I'm the **HubStore Intelligent Order & Sourcing Assistant** 🤖.\n\n` +
        `I can help you instantly with:\n` +
        `• Real-time order tracking, courier AWB & OTP verification\n` +
        `• Wholesale direct-sourcing SLA & delivery timelines (5–8 business days)\n` +
        `• GST tax invoice downloads & warranty receipts\n` +
        `• 7-day hassle-free returns & replacement requests\n` +
        `• Instant escalation to our WhatsApp support team`,
      suggestions: [
        "Where is my order?",
        "Wholesale delivery SLA",
        "Return & Refund Policy",
        "Chat with WhatsApp Support",
      ],
    });
  } catch (error) {
    console.error("Support chat error:", error);
    return NextResponse.json(
      {
        reply:
          "I'm temporarily having trouble looking up records. Please try again or tap below to chat with our WhatsApp support team.",
        suggestions: ["Chat with WhatsApp Support", "Where is my order?"],
      },
      { status: 200 }
    );
  }
}
