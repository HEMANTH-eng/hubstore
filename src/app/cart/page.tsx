"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Trash2,
  Heart,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { formatCurrency } from "@/lib/currency";
import { APP_CONFIG } from "@/lib/constants";
import { useToast } from "@/components/ui/Toast";

export default function CartPage() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    items,
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

  const toggleWishlist = useWishlistStore((state) => state.toggleItem);

  const [inputCoupon, setInputCoupon] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const subtotal = getSubtotal();
  const shipping = getShippingFee();
  const tax = getTaxAmount();
  const grandTotal = getGrandTotal();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;

    setIsValidating(true);
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
      setIsValidating(false);
    }
  };

  const handleMoveToWishlist = (item: any) => {
    removeItem(item.productId, item.variantId);
    toggleWishlist({
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      price: item.price,
      compareAtPrice: item.compareAtPrice,
      image: item.image,
      rating: 4.8,
      reviewCount: 20,
      inStock: true,
    });
    toast(`Moved "${item.name}" to your wishlist`, "success");
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Your Cart is Currently Empty</h1>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2">
            Explore our curated catalog of electronics, fashion, and home essentials to fill your bag!
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition-colors text-sm"
        >
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Shopping Cart ({items.reduce((s, i) => s + i.quantity, 0)} items)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your items and proceed to multi-step secure checkout
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId || "base"}`}
                className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
              >
                <div className="flex gap-4 items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover bg-slate-50 border border-slate-100 shrink-0"
                  />
                  <div className="space-y-1">
                    <Link
                      href={`/products/${item.slug}`}
                      className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    {item.variantTitle && (
                      <p className="text-xs text-slate-500">Variant: {item.variantTitle}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-extrabold text-slate-900">
                        {formatCurrency(item.price)}
                      </span>
                      {item.compareAtPrice && item.compareAtPrice > item.price && (
                        <span className="text-slate-400 line-through">
                          {formatCurrency(item.compareAtPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Stepper */}
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1, item.variantId)
                      }
                      className="p-1.5 hover:bg-slate-200 text-slate-600"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1, item.variantId)
                      }
                      disabled={item.quantity >= item.maxStock}
                      className="p-1.5 hover:bg-slate-200 text-slate-600 disabled:opacity-30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900 block">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMoveToWishlist(item)}
                      className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Move to Wishlist"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove from Cart"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <Link href="/products" className="text-blue-600 font-bold hover:underline">
              ← Continue Shopping
            </Link>
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <ShieldCheck className="w-4 h-4" /> 100% Purchase Protection
            </span>
          </div>
        </div>

        {/* Order Summary Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 border-b pb-3">Order Summary</h2>

            {/* Coupon Code Input */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700">Apply Promo Code</span>
              {couponCode ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <Tag className="w-3.5 h-3.5" />
                    <span>{couponCode} (-{formatCurrency(couponDiscount)})</span>
                  </div>
                  <button onClick={removeCoupon} className="text-rose-600 font-bold hover:underline">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value)}
                    placeholder="Enter coupon code"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs uppercase placeholder:normal-case outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={isValidating || !inputCoupon.trim()}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl disabled:opacity-50"
                  >
                    {isValidating ? "..." : "Apply"}
                  </button>
                </form>
              )}
            </div>

            {/* Calculation Lines */}
            <div className="space-y-2.5 text-xs text-slate-600 border-t pt-4">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>-{formatCurrency(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-bold text-slate-900">
                  {shipping === 0 ? (
                    <span className="text-emerald-600">FREE</span>
                  ) : (
                    formatCurrency(shipping)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated GST (18%)</span>
                <span>Included in price</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-base font-black text-slate-950">
                <span>Grand Total</span>
                <span className="text-blue-600">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => router.push("/checkout")}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-98 transition-all text-sm cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
