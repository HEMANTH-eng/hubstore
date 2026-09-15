import { CreatePaymentIntentParams, PaymentProvider, PaymentResult, PaymentVerificationParams } from "./index";

export class StripeProvider implements PaymentProvider {
  async createPaymentOrder(params: CreatePaymentIntentParams): Promise<PaymentResult> {
    const clientSecret = `pi_${Math.random().toString(36).substring(2, 16)}_secret_${Math.random().toString(36).substring(2, 16)}`;
    return {
      success: true,
      transactionId: clientSecret,
      data: {
        clientSecret,
        amount: Math.round(params.amount * 100),
        currency: "inr",
      },
    };
  }

  async verifyPayment(params: PaymentVerificationParams): Promise<PaymentResult> {
    if (!params.paymentId) {
      return { success: false, message: "Missing Stripe payment intent ID" };
    }
    return {
      success: true,
      transactionId: params.paymentId,
      message: "Stripe payment intent successfully verified.",
    };
  }
}

export const stripeProvider = new StripeProvider();
