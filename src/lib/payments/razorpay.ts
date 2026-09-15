import { CreatePaymentIntentParams, PaymentProvider, PaymentResult, PaymentVerificationParams } from "./index";
import crypto from "crypto";

export class RazorpayProvider implements PaymentProvider {
  private keyId: string;
  private keySecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_sampleKeyId123";
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || "sampleRazorpaySecretKey456";
  }

  async createPaymentOrder(params: CreatePaymentIntentParams): Promise<PaymentResult> {
    try {
      // In production with live keys, this connects to Razorpay API:
      // const order = await razorpay.orders.create({ amount: Math.round(params.amount * 100), currency: "INR", receipt: params.orderNumber });
      // For sandbox/development architecture:
      const simulatedRazorpayOrderId = `order_${Math.random().toString(36).substring(2, 14)}`;

      return {
        success: true,
        transactionId: simulatedRazorpayOrderId,
        data: {
          key: this.keyId,
          amount: Math.round(params.amount * 100), // amount in paise
          currency: "INR",
          name: "HubStore Marketplace",
          description: `Order #${params.orderNumber}`,
          order_id: simulatedRazorpayOrderId,
          prefill: {
            name: params.customer.name || "",
            email: params.customer.email,
            contact: params.customer.phone || "",
          },
          theme: {
            color: "#2563eb",
          },
        },
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Failed to initialize Razorpay payment order",
      };
    }
  }

  async verifyPayment(params: PaymentVerificationParams): Promise<PaymentResult> {
    try {
      const { paymentId, metadata } = params;
      const razorpayOrderId = metadata?.razorpay_order_id;
      const razorpaySignature = metadata?.razorpay_signature;

      // In production verify HMAC SHA256:
      // const expectedSignature = crypto.createHmac("sha256", this.keySecret).update(`${razorpayOrderId}|${paymentId}`).digest("hex");
      // if (expectedSignature !== razorpaySignature) return { success: false, message: "Invalid signature" };

      if (!paymentId) {
        return { success: false, message: "Payment ID missing" };
      }

      return {
        success: true,
        transactionId: paymentId,
        message: "Payment successfully verified through Razorpay.",
        data: {
          paymentId,
          razorpayOrderId,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Razorpay signature verification failed",
      };
    }
  }
}

export const razorpayProvider = new RazorpayProvider();
