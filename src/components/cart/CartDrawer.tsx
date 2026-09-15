"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { formatCurrency } from "@/lib/currency";
import { APP_CONFIG } from "@/lib/constants";
import { useToast } from "@/components/ui/Toast";

export function CartDrawer() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    couponCode,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getShippingFee,
    getTaxAmount,
    getGrandTotal,
  } = useCartStore();

  const [inputCoupon, setInputCoupon] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const subtotal = getSubtotal();
  const shipping = getShippingFee();
  const tax = getTaxAmount();
  const grandTotal = getGrandTotal();

  useEffect(() => {
    closeCart();
  }, [pathname, closeCart]);

  if (!isOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;

    setIsValidatingCoupon(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: inputCoupon.trim().toUpperCase(),
          cartSubtotal: subtotal,
        }),
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        applyCoupon(data.coupon.code, data.coupon.discountAmount);
        toast(`Coupon "${data.coupon.code}" applied! Saved ₹${data.coupon.discountAmount}`, "success");
        setInputCoupon("");
      } else {
        toast(data.error || "Invalid coupon code", "error");
      }
    } catch (err) {
      toast("Failed to validate coupon", "error");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleProceedToCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  return (
    <div className="fixed inset-0 z-70 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">
                Shopping Cart ({items.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Your cart is empty</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Looks like you haven&apos;t added any items to your cart yet. Explore our featured
                    categories!
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeCart();
                    router.push("/products");
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId || "base"}`}
                  className="flex gap-3.5 p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-18 h-18 rounded-lg object-cover bg-slate-50 shrink-0"
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={closeCart}
                          className="text-xs font-semibold text-slate-900 hover:text-blue-600 line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="text-slate-400 hover:text-rose-600 transition-colors shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {item.variantTitle && (
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Variant: {item.variantTitle}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-slate-900">
                        {formatCurrency(item.price * item.quantity)}
                      </span>

                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1, item.variantId)
                          }
                          className="p-1 text-slate-600 hover:bg-slate-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1, item.variantId)
                          }
                          disabled={item.quantity >= item.maxStock}
                          className="p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Calculations and Checkout */}
          {items.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
              {/* Coupon Form */}
              {couponCode ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon: {couponCode} applied (-{formatCurrency(couponDiscount)})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-rose-600 font-bold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value)}
                    placeholder="Coupon code (e.g. WELCOME50)"
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs uppercase placeholder:normal-case outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={isValidatingCoupon || !inputCoupon.trim()}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50"
                  >
                    {isValidatingCoupon ? "Checking..." : "Apply"}
                  </button>
                </form>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Coupon Discount</span>
                    <span>-{formatCurrency(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-slate-900">
                    {shipping === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      formatCurrency(shipping)
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated GST (18%)</span>
                  <span>Included</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-extrabold text-slate-950">
                  <span>Total Amount</span>
                  <span className="text-blue-600">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-98 transition-all text-sm"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Encrypted 256-bit SSL Checkout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
