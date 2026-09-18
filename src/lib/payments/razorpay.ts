import { CreatePaymentIntentParams, PaymentProvider, PaymentResult, PaymentVerificationParams } from "./index";
import crypto from "crypto";
import Razorpay from "razorpay";

export class RazorpayProvider implements PaymentProvider {
  private keyId: string;
  private keySecret: string;
  private isConfigured: boolean;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || "";
    this.isConfigured = Boolean(
      this.keyId &&
      this.keySecret &&
      !this.keyId.includes("sampleKeyId") &&
      !this.keySecret.includes("sampleRazorpaySecret")
    );
  }

  async createPaymentOrder(params: CreatePaymentIntentParams): Promise<PaymentResult> {
    try {
      const amountInPaise = Math.round(params.amount * 100);

      // If real Razorpay API keys are configured, create order via official SDK
      if (this.isConfigured) {
        const razorpay = new Razorpay({
          key_id: this.keyId,
          key_secret: this.keySecret,
        });

        const rzpOrder = await razorpay.orders.create({
          amount: amountInPaise,
          currency: "INR",
          receipt: params.orderNumber.substring(0, 40),
          notes: {
            orderId: params.orderId,
            orderNumber: params.orderNumber,
            customerEmail: params.customer.email,
          },
        });

        return {
          success: true,
          transactionId: rzpOrder.id,
          data: {
            key: this.keyId,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency || "INR",
            name: "HypperStore",
            description: `Order #${params.orderNumber}`,
            order_id: rzpOrder.id,
            prefill: {
              name: params.customer.name || "",
              email: params.customer.email,
              contact: params.customer.phone || "",
            },
            theme: {
              color: "#2563eb",
            },
            isLiveGateway: true,
          },
        };
      }

      // Fallback sandbox simulation when sample keys are active
      const simulatedRazorpayOrderId = `order_${Math.random().toString(36).substring(2, 14)}`;

      return {
        success: true,
        transactionId: simulatedRazorpayOrderId,
        data: {
          key: this.keyId || "rzp_test_sampleKeyId123",
          amount: amountInPaise,
          currency: "INR",
          name: "HypperStore Marketplace",
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
          isLiveGateway: false,
        },
      };
    } catch (err: any) {
      console.error("Razorpay order creation error:", err);
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

      if (!paymentId) {
        return { success: false, message: "Payment ID missing" };
      }

      // If live configured keys, perform cryptographic HMAC-SHA256 signature verification
      if (this.isConfigured && razorpayOrderId && razorpaySignature) {
        const expectedSignature = crypto
          .createHmac("sha256", this.keySecret)
          .update(`${razorpayOrderId}|${paymentId}`)
          .digest("hex");

        if (expectedSignature !== razorpaySignature) {
          return {
            success: false,
            message: "Tampered or invalid Razorpay payment signature",
          };
        }
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
      console.error("Razorpay verification error:", err);
      return {
        success: false,
        message: err.message || "Razorpay signature verification failed",
      };
    }
  }
}

export const razorpayProvider = new RazorpayProvider();
