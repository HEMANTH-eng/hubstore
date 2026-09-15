// HubStore Global Constants & Design Tokens

export const APP_CONFIG = {
  name: "HubStore",
  description: "Next-Gen Shopping Marketplace — Electronics, Fashion, Home & Beyond.",
  tagline: "Quality Assured • Express Delivery • 100% Genuine Products",
  currency: "INR",
  currencySymbol: "₹",
  taxRatePercent: 18,
  freeShippingThreshold: 999,
  standardShippingFee: 70,
  expressShippingFee: 150,
  codFee: 40,
  maxCodAmount: 25000,
  supportEmail: "support@hubstore.com",
  supportPhone: "+91 1800-202-6682",
};

export const ORDER_STATUS_LABELS: Record<string, { label: string; color: string; step: number }> = {
  PLACED: { label: "Order Placed", color: "bg-blue-50 text-blue-700 border-blue-200", step: 1 },
  CONFIRMED: { label: "Confirmed", color: "bg-indigo-50 text-indigo-700 border-indigo-200", step: 2 },
  PACKED: { label: "Packed & Ready", color: "bg-purple-50 text-purple-700 border-purple-200", step: 3 },
  SHIPPED: { label: "Shipped", color: "bg-amber-50 text-amber-700 border-amber-200", step: 4 },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "bg-orange-50 text-orange-700 border-orange-200", step: 5 },
  DELIVERED: { label: "Delivered", color: "bg-emerald-50 text-emerald-700 border-emerald-200", step: 6 },
  CANCELLED: { label: "Cancelled", color: "bg-rose-50 text-rose-700 border-rose-200", step: 0 },
  RETURNED: { label: "Returned", color: "bg-gray-50 text-gray-700 border-gray-200", step: 0 },
};

export const PAYMENT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Payment Pending", color: "bg-amber-100 text-amber-800" },
  SUCCESS: { label: "Paid Securely", color: "bg-emerald-100 text-emerald-800" },
  FAILED: { label: "Payment Failed", color: "bg-rose-100 text-rose-800" },
  REFUNDED: { label: "Refunded", color: "bg-purple-100 text-purple-800" },
};
