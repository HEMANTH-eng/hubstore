// Payment Abstraction Service Layer

export interface CreatePaymentIntentParams {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  customer: {
    name?: string | null;
    email: string;
    phone?: string | null;
  };
}

export interface PaymentVerificationParams {
  orderId: string;
  paymentId?: string;
  signature?: string;
  provider: "RAZORPAY" | "COD" | "STRIPE";
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  message?: string;
  data?: any;
}

export interface PaymentProvider {
  createPaymentOrder(params: CreatePaymentIntentParams): Promise<PaymentResult>;
  verifyPayment(params: PaymentVerificationParams): Promise<PaymentResult>;
}
