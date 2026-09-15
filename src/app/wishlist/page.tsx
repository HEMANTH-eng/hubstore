"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Bell,
  BellRing,
  Share2,
  Truck,
  Star,
  CheckCircle2,
  Tag,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { useCartStore } from "@/lib/store/cartStore";
import { formatCurrency, calculateDiscountPercentage } from "@/lib/currency";
import { useToast } from "@/components/ui/Toast";

export default function WishlistPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { items, removeItem, clearWishlist, togglePriceAlert } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addItem);

  const [copiedLink, setCopiedLink] = useState(false);

  // Calculate totals
  const totalWishlistValue = items.reduce((sum, item) => sum + item.price, 0);
  const totalMrpValue = items.reduce(
    (sum, item) => sum + (item.compareAtPrice && item.compareAtPrice > item.price ? item.compareAtPrice : item.price),
    0
  );
  const totalSavings = Math.max(0, totalMrpValue - totalWishlistValue);
  const inStockCount = items.filter((i) => i.inStock !== false).length;

  const handleMoveToCart = (item: any) => {
    addToCart({
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      price: item.price,
      compareAtPrice: item.compareAtPrice,
      image: item.image,
      maxStock: 25,
    });
    removeItem(item.productId);
    toast(`Moved "${item.name}" to your cart!`, "success");
  };

  const handleBuyNow = (item: any) => {
    addToCart({
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      price: item.price,
      compareAtPrice: item.compareAtPrice,
      image: item.image,
      maxStock: 25,
    });
    removeItem(item.productId);
    router.push("/checkout");
  };

  const handleMoveAllToCart = () => {
    const availableItems = items.filter((i) => i.inStock !== false);
    if (availableItems.length === 0) {
      toast("No in-stock items available to move", "error");
      return;
    }

    availableItems.forEach((item) => {
      addToCart({
        productId: item.productId,
        name: item.name,
        slug: item.slug,
        price: item.price,
        compareAtPrice: item.compareAtPrice,
        image: item.image,
        maxStock: 25,
      });
      removeItem(item.productId);
    });

    toast(`Moved ${availableItems.length} item(s) to your cart!`, "success");
  };

  const handleToggleAlert = (productId: string, name: string) => {
    const isNowActive = togglePriceAlert(productId);
    if (isNowActive) {
      toast(`Price Alert active for "${name}"! We'll notify you on price drops.`, "success");
    } else {
      toast(`Price Alert disabled for "${name}".`, "info");
    }
  };

  const handleShareWishlist = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      toast("Wishlist link copied to clipboard! Share it with friends.", "success");
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-8">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-rose-50 border border-rose-100 text-rose-500 mx-auto flex items-center justify-center shadow-inner">
            <Heart className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Your Wishlist is Empty</h1>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Explore our marketplace, find products you love, and tap the heart icon to track price drops, stock updates, and save for later!
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg shadow-blue-500/20 active:scale-98 transition-all"
          >
            <span>Explore Marketplace Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories Quick Discovery */}
        <div className="pt-8 border-t border-slate-200 text-left space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-center">
            Popular Categories to Explore
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              href="/category/electronics"
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all text-center group"
            >
              <span className="text-2xl mb-1 block group-hover:scale-110 transition-transform">🎧</span>
              <span className="font-bold text-xs text-slate-900 block">Electronics</span>
              <span className="text-[11px] text-slate-500">Audio, Gadgets</span>
            </Link>
            <Link
              href="/category/fashion"
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all text-center group"
            >
              <span className="text-2xl mb-1 block group-hover:scale-110 transition-transform">👕</span>
              <span className="font-bold text-xs text-slate-900 block">Fashion</span>
              <span className="text-[11px] text-slate-500">Men & Women</span>
            </Link>
            <Link
              href="/category/home-kitchen"
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all text-center group"
            >
              <span className="text-2xl mb-1 block group-hover:scale-110 transition-transform">☕</span>
              <span className="font-bold text-xs text-slate-900 block">Home & Living</span>
              <span className="text-[11px] text-slate-500">Kitchen & Decor</span>
            </Link>
            <Link
              href="/category/fitness-wellness"
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all text-center group"
            >
              <span className="text-2xl mb-1 block group-hover:scale-110 transition-transform">⚡</span>
              <span className="font-bold text-xs text-slate-900 block">Fitness</span>
              <span className="text-[11px] text-slate-500">Health & Gear</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Stats Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                My Saved Wishlist
              </h1>
              <span className="bg-rose-50 text-rose-700 text-xs font-extrabold px-2.5 py-1 rounded-full border border-rose-200">
                {items.length} {items.length === 1 ? "Item" : "Items"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Track live price drop alerts, verified stock status, and move items to cart with 1 click.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWishlist}
              className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? "Link Copied!" : "Share Wishlist"}</span>
            </button>
            <button
              onClick={clearWishlist}
              className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        </div>

        {/* Summary Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Saved Value
            </span>
            <span className="text-xl font-black text-slate-950 block mt-0.5">
              {formatCurrency(totalWishlistValue)}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              {inStockCount} of {items.length} items currently in stock
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
              Potential Savings
            </span>
            <span className="text-xl font-black text-emerald-700 block mt-0.5">
              {formatCurrency(totalSavings)}
            </span>
            <span className="text-[11px] text-emerald-600 mt-0.5 block">
              Discounts available from MRP / wholesale baseline
            </span>
          </div>

          <div className="flex items-center">
            <button
              onClick={handleMoveAllToCart}
              disabled={inStockCount === 0}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold text-xs py-4 px-6 rounded-2xl shadow-lg shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Move All In-Stock ({inStockCount}) to Cart</span>
            </button>
          </div>
        </div>
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => {
          const discount =
            item.compareAtPrice && item.compareAtPrice > item.price
              ? calculateDiscountPercentage(item.price, item.compareAtPrice)
              : 0;

          return (
            <div
              key={item.productId}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              {/* Product Image & Badges */}
              <div className="relative aspect-square bg-slate-50 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />

                {/* Discount Badge */}
                {discount > 0 && (
                  <div className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    <span>{discount}% OFF</span>
                  </div>
                )}

                {/* Action Buttons Top Right */}
                <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-2 rounded-full bg-white/95 text-slate-400 hover:text-rose-600 shadow-md hover:bg-white transition-colors cursor-pointer"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleToggleAlert(item.productId, item.name)}
                    className={`p-2 rounded-full shadow-md transition-colors cursor-pointer ${
                      item.priceDropAlert
                        ? "bg-amber-500 text-white hover:bg-amber-600"
                        : "bg-white/95 text-slate-400 hover:text-amber-500 hover:bg-white"
                    }`}
                    title={
                      item.priceDropAlert
                        ? "Price Alert Active (Click to disable)"
                        : "Set Price Drop Alert"
                    }
                  >
                    {item.priceDropAlert ? (
                      <BellRing className="w-3.5 h-3.5 animate-pulse" />
                    ) : (
                      <Bell className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Stock Status Pill */}
                <div className="absolute bottom-3 left-3">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs backdrop-blur-md ${
                      item.inStock !== false
                        ? "bg-emerald-600/90 text-white"
                        : "bg-rose-600/90 text-white"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    {item.inStock !== false ? "In Stock (Dispatch in 2 Days)" : "Currently Out of Stock"}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{item.rating || "4.8"}</span>
                      <span className="text-slate-400">({item.reviewCount || "32"})</span>
                    </div>

                    {item.priceDropAlert && (
                      <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        🔔 Price Alert
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/products/${item.slug}`}
                    className="text-sm font-bold text-slate-900 hover:text-blue-600 line-clamp-2 transition-colors"
                  >
                    {item.name}
                  </Link>

                  {/* Pricing */}
                  <div className="flex items-baseline gap-2 pt-0.5">
                    <span className="text-lg font-black text-slate-950">
                      {formatCurrency(item.price)}
                    </span>
                    {item.compareAtPrice && item.compareAtPrice > item.price && (
                      <span className="text-xs text-slate-400 line-through">
                        {formatCurrency(item.compareAtPrice)}
                      </span>
                    )}
                  </div>

                  {/* Delivery Note */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                    <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>
                      Delivery: <strong>{item.deliveryTime || "5–8 business days"}</strong>
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleMoveToCart(item)}
                    disabled={item.inStock === false}
                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move to Cart</span>
                  </button>

                  <button
                    onClick={() => handleBuyNow(item)}
                    disabled={item.inStock === false}
                    className="w-full bg-blue-50 hover:bg-blue-100 disabled:opacity-40 text-blue-700 text-xs font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <Zap className="w-3.5 h-3.5 text-blue-600" />
                    <span>Buy Now</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
