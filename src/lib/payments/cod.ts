import { CreatePaymentIntentParams, PaymentProvider, PaymentResult, PaymentVerificationParams } from "./index";
import { APP_CONFIG } from "../constants";

export class CashOnDeliveryProvider implements PaymentProvider {
  async createPaymentOrder(params: CreatePaymentIntentParams): Promise<PaymentResult> {
    if (params.amount > APP_CONFIG.maxCodAmount) {
      return {
        success: false,
        message: `Cash on Delivery is only eligible for orders up to ₹${APP_CONFIG.maxCodAmount.toLocaleString("en-IN")}. Please select online payment.`,
      };
    }

    return {
      success: true,
      transactionId: `COD_${params.orderNumber}_${Date.now()}`,
      message: "Order placed via Cash on Delivery. Please keep cash or UPI ready at delivery.",
      data: {
        provider: "COD",
        fee: APP_CONFIG.codFee,
      },
    };
  }

  async verifyPayment(params: PaymentVerificationParams): Promise<PaymentResult> {
    return {
      success: true,
      transactionId: `COD_VERIFIED_${params.orderId}`,
      message: "COD order verified.",
    };
  }
}

export const codProvider = new CashOnDeliveryProvider();
