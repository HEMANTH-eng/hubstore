import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const FROM_EMAIL = process.env.EMAIL_FROM || "HypperStore <orders@hypperstore.tech>";
// When using free tier without custom domain verified yet on Resend, Resend uses onboarding@resend.dev
const FALLBACK_FROM = "HypperStore <onboarding@resend.dev>";

interface OrderEmailParams {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  discountAmount?: number;
  paymentMethod: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export async function sendOrderConfirmationEmail(params: OrderEmailParams) {
  const storeUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.hypperstore.tech";
  const orderUrl = `${storeUrl}/orders/${params.orderId}`;
  const invoiceUrl = `${storeUrl}/orders/${params.orderId}/invoice`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #1d4ed8, #4338ca); padding: 32px 24px; text-align: center; color: #ffffff; }
    .logo { font-size: 24px; font-weight: 900; letter-spacing: 1px; }
    .badge { background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 11px; text-transform: uppercase; font-weight: bold; display: inline-block; margin-top: 8px; }
    .body { padding: 28px 24px; }
    .order-title { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
    .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .table th { text-align: left; padding: 8px; font-size: 11px; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; }
    .table td { padding: 12px 8px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
    .total-row td { font-weight: 800; font-size: 15px; color: #0f172a; border-top: 2px solid #e2e8f0; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff !important; padding: 12px 24px; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 10px; margin: 8px 4px; }
    .btn-secondary { background: #0f172a; }
    .footer { padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo">HypperStore</div>
      <div class="badge">Order Confirmed</div>
      <p style="margin: 8px 0 0 0; font-size: 13px; opacity: 0.9;">Order #${params.orderNumber}</p>
    </div>
    <div class="body">
      <p class="order-title">Hi ${params.customerName || "there"},</p>
      <p style="font-size: 13px; line-height: 1.6; color: #475569;">
        Thank you for shopping at <strong>HypperStore</strong>! Your order has been placed successfully and is being prepared for express delivery.
      </p>

      <table class="table">
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${params.items
            .map(
              (item) => `
            <tr>
              <td><strong>${item.name}</strong></td>
              <td style="text-align: center;">${item.quantity}</td>
              <td style="text-align: right;">₹${item.total.toLocaleString("en-IN")}</td>
            </tr>`
            )
            .join("")}
          <tr>
            <td colspan="2" style="color: #64748b;">Subtotal</td>
            <td style="text-align: right;">₹${params.subtotal.toLocaleString("en-IN")}</td>
          </tr>
          ${
            params.discountAmount && params.discountAmount > 0
              ? `<tr>
            <td colspan="2" style="color: #16a34a;">Coupon Discount</td>
            <td style="text-align: right; color: #16a34a;">-₹${params.discountAmount.toLocaleString("en-IN")}</td>
          </tr>`
              : ""
          }
          <tr>
            <td colspan="2" style="color: #64748b;">Delivery Fee</td>
            <td style="text-align: right; color: #16a34a;">${params.shippingAmount === 0 ? "FREE" : "₹" + params.shippingAmount}</td>
          </tr>
          <tr class="total-row">
            <td colspan="2">Total Payable</td>
            <td style="text-align: right; color: #1d4ed8;">₹${params.totalAmount.toLocaleString("en-IN")}</td>
          </tr>
        </tbody>
      </table>

      ${
        params.shippingAddress
          ? `
      <div style="background: #f8fafc; padding: 14px; border-radius: 12px; margin-bottom: 20px; font-size: 12px;">
        <strong style="color: #0f172a;">Shipping Address:</strong><br>
        <span style="color: #475569;">${params.shippingAddress.street}, ${params.shippingAddress.city}, ${params.shippingAddress.state} - ${params.shippingAddress.pincode}</span>
      </div>`
          : ""
      }

      <div style="text-align: center; margin: 24px 0;">
        <a href="${orderUrl}" class="btn">Track Order Online</a>
        <a href="${invoiceUrl}" class="btn btn-secondary">Download GST Tax Invoice</a>
      </div>
    </div>
    <div class="footer">
      HypperStore Marketplace &bull; India's Next-Gen Premium E-Commerce<br>
      Questions? Reach us at <a href="mailto:support@hypperstore.tech" style="color: #2563eb;">support@hypperstore.tech</a>
    </div>
  </div>
</body>
</html>
`;

  try {
    if (!resend) {
      console.log(`[Email Mock Service] Order confirmation email logged for ${params.customerEmail} (Order #${params.orderNumber})`);
      return { success: true, mocked: true };
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [params.customerEmail],
      subject: `Order Confirmed: #${params.orderNumber} - HypperStore`,
      html,
    });

    if (error) {
      // Try fallback from address if custom domain is not yet verified on Resend
      console.warn("Retrying with Resend fallback sender...", error);
      const fallback = await resend.emails.send({
        from: FALLBACK_FROM,
        to: [params.customerEmail],
        subject: `Order Confirmed: #${params.orderNumber} - HypperStore`,
        html,
      });
      return { success: !fallback.error, data: fallback.data, error: fallback.error };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Failed to dispatch order confirmation email:", err);
    return { success: false, error: err.message };
  }
}
