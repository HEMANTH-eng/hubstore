"use client";

import React from "react";
import Link from "next/link";
import { Star, Heart, ShoppingCart, Check, Scale } from "lucide-react";
import { formatCurrency, calculateDiscountPercentage } from "@/lib/currency";
import { useCartStore } from "@/lib/store/cartStore";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { useCompareStore } from "@/lib/store/compareStore";
import { useToast } from "@/components/ui/Toast";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number | null;
    discountPercent?: number | null;
    rating: number;
    reviewCount: number;
    images: { url: string; alt?: string | null }[];
    brand?: { name: string } | null;
    category?: { name: string } | null;
    inventory?: { quantity: number } | null;
  };
  customBadge?: {
    text: string;
    variant?: "gold" | "rose" | "indigo" | "emerald" | "amber";
  };
}

export function ProductCard({ product, customBadge }: ProductCardProps) {
  const { toast } = useToast();
  const addItem = useCartStore((state) => state.addItem);
  const { isInWishlist, toggleItem } = useWishlistStore();
  const { isInCompare, addToCompare, removeFromCompare } = useCompareStore();

  const isFavorited = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);
  const primaryImage =
    product.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop";
  const stock = product.inventory?.quantity ?? 10;
  const isOutOfStock = stock <= 0;
  const discountPercent =
    product.discountPercent ||
    calculateDiscountPercentage(product.price, product.compareAtPrice);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast("Sorry, this item is out of stock", "error");
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      image: primaryImage,
      maxStock: stock,
    });

    toast(`Added "${product.name.substring(0, 30)}..." to your cart!`, "success");
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toggleItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      image: primaryImage,
      rating: product.rating,
      reviewCount: product.reviewCount,
      inStock: !isOutOfStock,
    });

    if (isFavorited) {
      toast("Removed from wishlist", "info");
    } else {
      toast("Added to your wishlist", "success");
    }
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCompared) {
      removeFromCompare(product.id);
      toast("Removed from comparison", "info");
    } else {
      const added = addToCompare({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        image: primaryImage,
        rating: product.rating,
        reviewCount: product.reviewCount,
        category: product.category?.name || "General",
        brand: product.brand?.name || "HyperStore",
        inStock: !isOutOfStock,
        stockCount: stock,
      });

      if (added) {
        toast(`Added "${product.name.substring(0, 25)}..." to compare!`, "success");
      } else {
        toast("Comparison dock full (max 4 products). Remove one first.", "error");
      }
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Product Image Area */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-square bg-slate-50 overflow-hidden">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          decoding="async"
        />

        {/* Custom and Discount Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start z-10">
          {customBadge && (
            <span
              className={`text-[10px] tracking-wide uppercase px-2 py-0.5 rounded-md shadow-sm font-extrabold flex items-center gap-1 ${
                customBadge.variant === "gold"
                  ? "bg-amber-400 text-amber-950 shadow-amber-400/30"
                  : customBadge.variant === "emerald"
                  ? "bg-emerald-600 text-white shadow-emerald-600/30"
                  : customBadge.variant === "indigo"
                  ? "bg-indigo-600 text-white shadow-indigo-600/30"
                  : customBadge.variant === "rose"
                  ? "bg-rose-600 text-white shadow-rose-600/30"
                  : "bg-slate-900 text-white"
              }`}
            >
              {customBadge.text}
            </span>
          )}

          {discountPercent > 0 && (
            <span className="bg-rose-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-slate-950 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}

        {/* Action Buttons at Top Right: Compare & Wishlist */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {/* Compare Button */}
          <button
            onClick={handleToggleCompare}
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer ${
              isCompared
                ? "bg-indigo-600 text-white"
                : "bg-white/90 text-slate-500 hover:text-indigo-600 hover:bg-white"
            }`}
            title={isCompared ? "Remove from comparison" : "Add to comparison"}
          >
            <Scale className="w-3.5 h-3.5" />
          </button>

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer ${
              isFavorited
                ? "bg-rose-50 text-rose-600"
                : "bg-white/90 text-slate-500 hover:text-rose-600 hover:bg-white"
            }`}
            title={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? "fill-rose-600" : ""}`} />
          </button>
        </div>
      </Link>

      {/* Details Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-1">
            <span className="uppercase tracking-wider text-blue-600 font-semibold truncate max-w-[120px]">
              {product.brand?.name || product.category?.name || "HyperStore"}
            </span>
            {stock <= 5 && stock > 0 && (
              <span className="text-amber-600 font-bold">Only {stock} left!</span>
            )}
          </div>

          {/* Product Name */}
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Ratings */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center gap-0.5 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-xs font-bold border border-emerald-200">
              <span>{product.rating.toFixed(1)}</span>
              <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
            </div>
            <span className="text-[11px] text-slate-500">
              ({product.reviewCount.toLocaleString()})
            </span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-950">
                {formatCurrency(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xs text-slate-400 line-through">
                  {formatCurrency(product.compareAtPrice)}
                </span>
              )}
            </div>
            <p className="text-[10px] text-emerald-600 font-semibold">Free Delivery</p>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-blue-600 text-white flex items-center justify-center transition-all disabled:opacity-50 disabled:hover:bg-slate-900 active:scale-90 shadow-sm"
            title="Add to cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
