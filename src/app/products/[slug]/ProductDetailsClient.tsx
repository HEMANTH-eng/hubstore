"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Zap,
  Heart,
  Plus,
  Minus,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Scale,
} from "lucide-react";
import { VariantSelector } from "@/components/product/VariantSelector";
import { ProductVariantItem } from "@/types";
import { formatCurrency, calculateDiscountPercentage } from "@/lib/currency";
import { useCartStore } from "@/lib/store/cartStore";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { useCompareStore } from "@/lib/store/compareStore";
import { useToast } from "@/components/ui/Toast";

interface ProductDetailsClientProps {
  product: any;
  variants: ProductVariantItem[];
  initialStock: number;
  discountPercent: number;
}

export function ProductDetailsClient({
  product,
  variants,
  initialStock,
  discountPercent,
}: ProductDetailsClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const addItem = useCartStore((state) => state.addItem);
  const { isInWishlist, toggleItem } = useWishlistStore();
  const { isInCompare, addToCompare, removeFromCompare } = useCompareStore();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariantItem | null>(
    variants && variants.length > 0 ? variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [pincodeInput, setPincodeInput] = useState("560038");
  const [deliveryEstimated, setDeliveryEstimated] = useState(true);

  const activePrice = selectedVariant ? selectedVariant.price : product.price;
  const activeComparePrice = selectedVariant
    ? selectedVariant.compareAtPrice
    : product.compareAtPrice;
  const activeStock = selectedVariant ? selectedVariant.stock : initialStock;
  const isOutOfStock = activeStock <= 0;
  const isFavorited = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);

  const deliveryTime = product.deliveryTime || "5-8 business days";
  const dispatchDays = product.dispatchDays || 2;

  const getDeliveryDateRange = () => {
    let minDays = 5;
    let maxDays = 8;
    const match = (deliveryTime || "").match(/(\d+)\s*[-–to]+\s*(\d+)/i);
    if (match) {
      minDays = parseInt(match[1], 10);
      maxDays = parseInt(match[2], 10);
    }
    const minDate = new Date(Date.now() + minDays * 24 * 60 * 60 * 1000);
    const maxDate = new Date(Date.now() + maxDays * 24 * 60 * 60 * 1000);

    return `${minDate.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })} – ${maxDate.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })}`;
  };

  const primaryImage =
    product.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop";

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast("This variant is currently out of stock", "error");
      return;
    }

    addItem(
      {
        productId: product.id,
        variantId: selectedVariant?.id || null,
        name: product.name,
        slug: product.slug,
        price: activePrice,
        compareAtPrice: activeComparePrice,
        image: selectedVariant?.image || primaryImage,
        maxStock: activeStock,
        variantTitle: selectedVariant?.title || null,
      },
      quantity
    );

    toast(`Added ${quantity} item(s) to your cart!`, "success");
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  const handleToggleWishlist = () => {
    toggleItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: activePrice,
      compareAtPrice: activeComparePrice,
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

  const handleToggleCompare = () => {
    if (isCompared) {
      removeFromCompare(product.id);
      toast("Removed from comparison", "info");
    } else {
      const added = addToCompare({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: activePrice,
        compareAtPrice: activeComparePrice,
        image: primaryImage,
        rating: product.rating,
        reviewCount: product.reviewCount,
        category: product.category?.name || "General",
        brand: product.brand?.name || "HubStore",
        inStock: !isOutOfStock,
        stockCount: activeStock,
        deliveryTime: deliveryTime,
        dispatchDays: dispatchDays,
        shortDescription: product.shortDescription,
      });

      if (added) {
        toast(`Added "${product.name.substring(0, 25)}..." to compare!`, "success");
      } else {
        toast("Comparison dock full (max 4 products). Remove one first.", "error");
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Price Block */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-black text-slate-950">
          {formatCurrency(activePrice)}
        </span>
        {activeComparePrice && activeComparePrice > activePrice && (
          <span className="text-lg text-slate-400 line-through">
            {formatCurrency(activeComparePrice)}
          </span>
        )}
        {discountPercent > 0 && (
          <span className="bg-rose-100 text-rose-700 text-xs font-extrabold px-2 py-0.5 rounded-md">
            Save {discountPercent}%
          </span>
        )}
      </div>

      <p className="text-xs text-slate-500">
        Inclusive of all applicable taxes. Free shipping on this order.
      </p>

      {/* Variant Selector */}
      {variants && variants.length > 0 && (
        <VariantSelector
          variants={variants}
          selectedVariantId={selectedVariant?.id || null}
          onSelectVariant={(v) => {
            setSelectedVariant(v);
            setQuantity(1);
          }}
        />
      )}

      {/* Stock status */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-semibold text-slate-700">Availability:</span>
        {isOutOfStock ? (
          <span className="text-rose-600 font-bold">Currently Out of Stock</span>
        ) : activeStock <= 5 ? (
          <span className="text-amber-600 font-bold">
            Only {activeStock} items left in stock — order soon
          </span>
        ) : (
          <span className="text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            In Stock (Ready for Dispatch)
          </span>
        )}
      </div>

      {/* Pincode & Delivery Date Estimator */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-blue-600" />
            Check Delivery to Your Area:
          </span>
        </div>

        <div className="flex gap-2 max-w-xs">
          <input
            type="text"
            maxLength={6}
            value={pincodeInput}
            onChange={(e) => setPincodeInput(e.target.value)}
            placeholder="Enter 6-digit Pincode"
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-500 font-mono"
          />
          <button
            type="button"
            onClick={() => setDeliveryEstimated(pincodeInput.length === 6)}
            className="bg-slate-900 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
          >
            Check
          </button>
        </div>

        {deliveryEstimated && (
          <div className="space-y-1 pt-1">
            <p className="text-slate-700 text-xs">
              Estimated Delivery:{" "}
              <strong className="text-slate-950 font-extrabold">{getDeliveryDateRange()}</strong>
              {" "}(<span className="text-blue-600 font-semibold">{deliveryTime}</span>) •{" "}
              <strong className="text-emerald-700 font-extrabold">FREE</strong>
            </p>
            <p className="text-[11px] text-slate-500">
              Sourced & quality-inspected • Dispatched within {dispatchDays} business days via BlueDart / Delhivery
            </p>
          </div>
        )}
      </div>

      {/* Quantity & CTA Buttons */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-slate-700">Quantity:</span>
          <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1 || isOutOfStock}
              className="p-2 hover:bg-slate-100 text-slate-600 disabled:opacity-30"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center text-xs font-bold text-slate-900">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(Math.min(activeStock, quantity + 1))}
              disabled={quantity >= activeStock || isOutOfStock}
              className="p-2 hover:bg-slate-100 text-slate-600 disabled:opacity-30"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 disabled:opacity-40 text-sm cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </button>

          {/* Buy Now */}
          <button
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-98 disabled:opacity-40 text-sm cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Buy Now</span>
          </button>
        </div>

        {/* Buyer Agreement & Fulfillment Guarantee */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex items-start gap-2.5 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-slate-800 text-[11px]">
              Fulfillment & Quality Guarantee
            </p>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Each unit is individually inspected and bubble-wrapped before courier pickup. Standard doorstep delivery in <strong>{deliveryTime}</strong> with real-time SMS & email tracking.
            </p>
          </div>
        </div>

        {/* Action Buttons: Wishlist & Compare */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleToggleWishlist}
            className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              isFavorited
                ? "bg-rose-50 border-rose-200 text-rose-700"
                : "border-slate-200 hover:bg-slate-50 text-slate-700"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorited ? "fill-rose-600 text-rose-600" : "text-slate-400"
              }`}
            />
            <span>{isFavorited ? "In Wishlist" : "Wishlist"}</span>
          </button>

          <button
            onClick={handleToggleCompare}
            className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              isCompared
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "border-slate-200 hover:bg-slate-50 text-slate-700"
            }`}
          >
            <Scale
              className={`w-4 h-4 ${
                isCompared ? "text-blue-600 font-bold" : "text-slate-400"
              }`}
            />
            <span>{isCompared ? "In Compare" : "Compare"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
