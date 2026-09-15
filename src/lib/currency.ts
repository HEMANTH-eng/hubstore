// Currency representation and safe calculations

/**
 * Format an amount in Indian Rupees (INR)
 * Handles formatting with Indian numbering format (e.g. ₹1,23,456)
 */
export function formatCurrency(amount: number, showDecimals: boolean = false): string {
  if (isNaN(amount)) return "₹0";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);
}

/**
 * Convert rupee value to paise (integer smallest currency unit) to avoid floating point inaccuracies
 */
export function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Convert paise to rupees
 */
export function fromPaise(paise: number): number {
  return paise / 100;
}

/**
 * Safely compute discount percentage between compareAtPrice and price
 */
export function calculateDiscountPercentage(price: number, compareAtPrice?: number | null): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}
