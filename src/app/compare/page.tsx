"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Scale,
  ShoppingCart,
  Zap,
  Trash2,
  Plus,
  CheckCircle2,
  AlertCircle,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Receipt,
  Search,
  X,
  Share2,
  ArrowRight,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { useCompareStore, CompareProduct } from "@/lib/store/compareStore";
import { useCartStore } from "@/lib/store/cartStore";
import { formatCurrency, calculateDiscountPercentage } from "@/lib/currency";
import { useToast } from "@/components/ui/Toast";

export default function ComparePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { items, removeFromCompare, clearCompare, addToCompare } = useCompareStore();
  const addToCart = useCartStore((state) => state.addItem);

  const [highlightDiffs, setHighlightDiffs] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch catalog products for "+ Add to Compare" modal
  useEffect(() => {
    async function loadProducts() {
      setIsLoadingCatalog(true);
      try {
        const res = await fetch("/api/products?limit=20");
        const json = await res.json();
        if (json && json.products) {
          setCatalogProducts(json.products);
        }
      } catch (err) {
        console.error("Failed to fetch catalog products for compare:", err);
      } finally {
        setIsLoadingCatalog(false);
      }
    }
    loadProducts();
  }, []);

  const handleAddToCart = (product: CompareProduct) => {
    if (!product.inStock) {
      toast("This product is currently out of stock", "error");
      return;
    }
    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      image: product.image,
      maxStock: product.stockCount || 20,
    });
    toast(`Added "${product.name.substring(0, 30)}..." to your cart!`, "success");
  };

  const handleBuyNow = (product: CompareProduct) => {
    if (!product.inStock) {
      toast("This product is currently out of stock", "error");
      return;
    }
    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      image: product.image,
      maxStock: product.stockCount || 20,
    });
    router.push("/checkout");
  };

  const handleAddAllToCart = () => {
    const inStockItems = items.filter((item) => item.inStock);
    if (inStockItems.length === 0) {
      toast("None of the compared products are in stock", "error");
      return;
    }
    inStockItems.forEach((product) => {
      addToCart({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        image: product.image,
        maxStock: product.stockCount || 20,
      });
    });
    toast(`Added ${inStockItems.length} products to your cart!`, "success");
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      toast("Comparison page link copied to clipboard!", "success");
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  // Helper to check if values differ across compared items
  const checkIsDifferent = (extractor: (item: CompareProduct) => any) => {
    if (items.length < 2) return false;
    const firstVal = extractor(items[0]);
    return items.some((item) => extractor(item) !== firstVal);
  };

  // Find best price among items
  const lowestPrice = items.length > 0 ? Math.min(...items.map((i) => i.price)) : 0;
  const highestRating = items.length > 0 ? Math.max(...items.map((i) => i.rating)) : 0;

  // Filter catalog products for modal
  const filteredCatalog = catalogProducts.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand?.name && p.brand.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const alreadyInCompare = items.some((i) => i.id === p.id);
    return matchesSearch && !alreadyInCompare;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Comparison Studio</span>
        </div>

        {/* Studio Header Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  Product Comparison Studio
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {items.length} of 4 Items
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Side-by-side technical specs, wholesale pricing, delivery SLAs, and buyer guarantees
                </p>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {items.length >= 2 && (
              <button
                onClick={() => setHighlightDiffs(!highlightDiffs)}
                className={`text-xs font-bold px-3.5 py-2 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                  highlightDiffs
                    ? "bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20"
                    : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{highlightDiffs ? "Differences Highlighted" : "Highlight Differences"}</span>
              </button>
            )}

            {items.length < 4 && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </button>
            )}

            {items.length > 0 && (
              <>
                <button
                  onClick={handleShare}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Share comparison link"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{copiedLink ? "Copied!" : "Share"}</span>
                </button>

                <button
                  onClick={clearCompare}
                  className="bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Remove all products"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear All</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Empty or Insufficient State (< 2 Products) */}
        {items.length < 2 ? (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto shadow-sm">
                <Scale className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-900">
                  {items.length === 0
                    ? "Your Comparison Matrix is Empty"
                    : "Add 1 More Product to Start Comparing"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                  {items.length === 0
                    ? "Select up to 4 products across the catalog to analyze side-by-side specs, pricing savings, courier SLAs, and buyer protection."
                    : "You currently have 1 product selected. Choose another item from below or the catalog to see side-by-side differences."}
                </p>
              </div>

              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Choose from Catalog</span>
                </button>
                <Link
                  href="/"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors"
                >
                  <span>Explore Home Deals</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Quick Pick: Recommended Items to Compare */}
            {catalogProducts.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Popular Products to Compare
                    </h3>
                    <p className="text-xs text-slate-500">
                      Click "+ Compare" to instantly add an item to your matrix
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {catalogProducts.slice(0, 4).map((product) => {
                    const isAlreadyIn = items.some((i) => i.id === product.id);
                    const primaryImage =
                      product.images?.[0]?.url ||
                      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop";

                    return (
                      <div
                        key={product.id}
                        className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden relative">
                            <img
                              src={primaryImage}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                            {product.brand?.name && (
                              <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                                {product.brand.name}
                              </span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-slate-900 line-clamp-2">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="font-extrabold text-sm text-slate-900">
                                {formatCurrency(product.price)}
                              </span>
                              {product.compareAtPrice && product.compareAtPrice > product.price && (
                                <span className="text-xs text-slate-400 line-through">
                                  {formatCurrency(product.compareAtPrice)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          disabled={isAlreadyIn}
                          onClick={() => {
                            addToCompare({
                              id: product.id,
                              name: product.name,
                              slug: product.slug,
                              price: product.price,
                              compareAtPrice: product.compareAtPrice,
                              image: primaryImage,
                              rating: product.rating,
                              reviewCount: product.reviewCount,
                              category: product.category?.name || "General",
                              brand: product.brand?.name || "HypperStore",
                              inStock: true,
                              stockCount: product.inventory?.quantity || 15,
                              deliveryTime: "5-8 business days",
                              dispatchDays: 2,
                              shortDescription: product.description?.substring(0, 80),
                            });
                            toast(`Added "${product.name.substring(0, 25)}..." to compare!`, "success");
                          }}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isAlreadyIn
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                              : "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                          }`}
                        >
                          <Scale className="w-3.5 h-3.5" />
                          <span>{isAlreadyIn ? "In Comparison" : "+ Add to Compare"}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Side-by-Side Comparison Matrix Table */
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr>
                      {/* Left Header Corner */}
                      <th className="p-4 sm:p-5 w-48 sm:w-56 bg-slate-50/80 border-b border-r border-slate-200 text-xs font-extrabold text-slate-500 uppercase tracking-wider sticky left-0 z-20">
                        <div className="space-y-1">
                          <span>Specifications</span>
                          {highlightDiffs && (
                            <div className="flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold normal-case">
                              <AlertCircle className="w-3 h-3" />
                              Diffs Active
                            </div>
                          )}
                        </div>
                      </th>

                      {/* Product Columns Headers */}
                      {items.map((product) => {
                        const discount = calculateDiscountPercentage(
                          product.price,
                          product.compareAtPrice
                        );
                        return (
                          <th
                            key={product.id}
                            className="p-4 sm:p-5 min-w-[240px] max-w-[280px] border-b border-r border-slate-200 align-top bg-white relative group"
                          >
                            <div className="space-y-3">
                              {/* Remove button */}
                              <button
                                onClick={() => removeFromCompare(product.id)}
                                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                                title="Remove from comparison"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>

                              {/* Image */}
                              <div className="aspect-square w-full rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden relative">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                                {product.price === lowestPrice && items.length > 1 && (
                                  <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">
                                    Best Price
                                  </span>
                                )}
                              </div>

                              {/* Title & Brand */}
                              <div>
                                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                                  {product.brand || "HypperStore"}
                                </span>
                                <h3 className="text-xs sm:text-sm font-black text-slate-900 line-clamp-2 mt-0.5 leading-snug">
                                  <Link
                                    href={`/products/${product.slug}`}
                                    className="hover:text-blue-600 transition-colors"
                                  >
                                    {product.name}
                                  </Link>
                                </h3>
                              </div>

                              {/* Price Block */}
                              <div className="space-y-1">
                                <div className="flex items-baseline gap-2">
                                  <span className="text-lg font-black text-slate-950">
                                    {formatCurrency(product.price)}
                                  </span>
                                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                                    <span className="text-xs text-slate-400 line-through">
                                      {formatCurrency(product.compareAtPrice)}
                                    </span>
                                  )}
                                </div>
                                {discount > 0 && (
                                  <span className="inline-block text-[11px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                                    Save {discount}% ({formatCurrency((product.compareAtPrice || 0) - product.price)})
                                  </span>
                                )}
                              </div>

                              {/* Primary CTAs */}
                              <div className="space-y-2 pt-1">
                                <button
                                  onClick={() => handleAddToCart(product)}
                                  disabled={!product.inStock}
                                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98 disabled:opacity-40 cursor-pointer"
                                >
                                  <ShoppingCart className="w-3.5 h-3.5" />
                                  <span>{product.inStock ? "Add to Cart" : "Out of Stock"}</span>
                                </button>
                                <button
                                  onClick={() => handleBuyNow(product)}
                                  disabled={!product.inStock}
                                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/20 active:scale-98 disabled:opacity-40 cursor-pointer"
                                >
                                  <Zap className="w-3.5 h-3.5" />
                                  <span>Buy Now</span>
                                </button>
                              </div>
                            </div>
                          </th>
                        );
                      })}

                      {/* Empty Column Slot if < 4 Items */}
                      {items.length < 4 && (
                        <th className="p-5 min-w-[220px] border-b border-slate-200 align-middle text-center bg-slate-50/50">
                          <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="w-full h-full min-h-[300px] border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-blue-600 transition-all p-6 cursor-pointer group"
                          >
                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 group-hover:border-blue-300 flex items-center justify-center shadow-sm">
                              <Plus className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
                            </div>
                            <div>
                              <span className="block font-black text-xs sm:text-sm text-slate-700 group-hover:text-blue-600">
                                Add Product
                              </span>
                              <span className="text-[11px] text-slate-400">
                                Up to {4 - items.length} more
                              </span>
                            </div>
                          </button>
                        </th>
                      )}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 text-xs">
                    {/* SECTION: GENERAL SPECIFICATIONS */}
                    <tr className="bg-slate-100/70 font-extrabold text-slate-800">
                      <td colSpan={items.length + (items.length < 4 ? 2 : 1)} className="p-3 text-[11px] uppercase tracking-wider sticky left-0">
                        General Specifications & Category
                      </td>
                    </tr>

                    {/* Brand */}
                    {(() => {
                      const isDiff = checkIsDifferent((i) => i.brand);
                      const isHighlighted = highlightDiffs && isDiff;
                      return (
                        <tr className={isHighlighted ? "bg-amber-50/70 border-l-4 border-l-amber-500" : "hover:bg-slate-50"}>
                          <td className="p-4 font-bold text-slate-600 border-r border-slate-200 sticky left-0 bg-inherit">
                            Brand & Origin
                          </td>
                          {items.map((p) => (
                            <td key={p.id} className="p-4 border-r border-slate-200 font-extrabold text-slate-900">
                              {p.brand || "HypperStore"}
                            </td>
                          ))}
                          {items.length < 4 && <td className="bg-slate-50/50"></td>}
                        </tr>
                      );
                    })()}

                    {/* Category */}
                    {(() => {
                      const isDiff = checkIsDifferent((i) => i.category);
                      const isHighlighted = highlightDiffs && isDiff;
                      return (
                        <tr className={isHighlighted ? "bg-amber-50/70 border-l-4 border-l-amber-500" : "hover:bg-slate-50"}>
                          <td className="p-4 font-bold text-slate-600 border-r border-slate-200 sticky left-0 bg-inherit">
                            Category
                          </td>
                          {items.map((p) => (
                            <td key={p.id} className="p-4 border-r border-slate-200 font-semibold text-slate-700">
                              {p.category || "General"}
                            </td>
                          ))}
                          {items.length < 4 && <td className="bg-slate-50/50"></td>}
                        </tr>
                      );
                    })()}

                    {/* Customer Rating */}
                    {(() => {
                      const isDiff = checkIsDifferent((i) => i.rating);
                      const isHighlighted = highlightDiffs && isDiff;
                      return (
                        <tr className={isHighlighted ? "bg-amber-50/70 border-l-4 border-l-amber-500" : "hover:bg-slate-50"}>
                          <td className="p-4 font-bold text-slate-600 border-r border-slate-200 sticky left-0 bg-inherit">
                            Customer Rating
                          </td>
                          {items.map((p) => (
                            <td key={p.id} className="p-4 border-r border-slate-200">
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-slate-900 flex items-center gap-1 bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                  {p.rating.toFixed(1)}
                                </span>
                                <span className="text-slate-400 text-[11px]">
                                  ({p.reviewCount} reviews)
                                </span>
                              </div>
                            </td>
                          ))}
                          {items.length < 4 && <td className="bg-slate-50/50"></td>}
                        </tr>
                      );
                    })()}

                    {/* Stock Status */}
                    {(() => {
                      const isDiff = checkIsDifferent((i) => i.inStock);
                      const isHighlighted = highlightDiffs && isDiff;
                      return (
                        <tr className={isHighlighted ? "bg-amber-50/70 border-l-4 border-l-amber-500" : "hover:bg-slate-50"}>
                          <td className="p-4 font-bold text-slate-600 border-r border-slate-200 sticky left-0 bg-inherit">
                            Stock Availability
                          </td>
                          {items.map((p) => (
                            <td key={p.id} className="p-4 border-r border-slate-200">
                              {p.inStock ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-extrabold text-[11px] border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3" />
                                  In Stock (Dispatch Ready)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full font-extrabold text-[11px] border border-rose-200">
                                  Out of Stock
                                </span>
                              )}
                            </td>
                          ))}
                          {items.length < 4 && <td className="bg-slate-50/50"></td>}
                        </tr>
                      );
                    })()}

                    {/* SECTION: PRICING & SAVINGS BREAKDOWN */}
                    <tr className="bg-slate-100/70 font-extrabold text-slate-800">
                      <td colSpan={items.length + (items.length < 4 ? 2 : 1)} className="p-3 text-[11px] uppercase tracking-wider sticky left-0">
                        Pricing, MRP & Wholesale Value
                      </td>
                    </tr>

                    {/* Selling Price */}
                    {(() => {
                      const isDiff = checkIsDifferent((i) => i.price);
                      const isHighlighted = highlightDiffs && isDiff;
                      return (
                        <tr className={isHighlighted ? "bg-amber-50/70 border-l-4 border-l-amber-500" : "hover:bg-slate-50"}>
                          <td className="p-4 font-bold text-slate-600 border-r border-slate-200 sticky left-0 bg-inherit">
                            Online Deal Price
                          </td>
                          {items.map((p) => (
                            <td key={p.id} className="p-4 border-r border-slate-200">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-slate-950">
                                  {formatCurrency(p.price)}
                                </span>
                                {p.price === lowestPrice && items.length > 1 && (
                                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                    Lowest
                                  </span>
                                )}
                              </div>
                            </td>
                          ))}
                          {items.length < 4 && <td className="bg-slate-50/50"></td>}
                        </tr>
                      );
                    })()}

                    {/* Compare Price / MRP */}
                    {(() => {
                      const isDiff = checkIsDifferent((i) => i.compareAtPrice);
                      const isHighlighted = highlightDiffs && isDiff;
                      return (
                        <tr className={isHighlighted ? "bg-amber-50/70 border-l-4 border-l-amber-500" : "hover:bg-slate-50"}>
                          <td className="p-4 font-bold text-slate-600 border-r border-slate-200 sticky left-0 bg-inherit">
                            Maximum Retail Price (MRP)
                          </td>
                          {items.map((p) => (
                            <td key={p.id} className="p-4 border-r border-slate-200 text-slate-500 font-medium">
                              {p.compareAtPrice ? formatCurrency(p.compareAtPrice) : formatCurrency(p.price)}
                            </td>
                          ))}
                          {items.length < 4 && <td className="bg-slate-50/50"></td>}
                        </tr>
                      );
                    })()}

                    {/* Total Discount % */}
                    {(() => {
                      const isDiff = checkIsDifferent((i) => calculateDiscountPercentage(i.price, i.compareAtPrice));
                      const isHighlighted = highlightDiffs && isDiff;
                      return (
                        <tr className={isHighlighted ? "bg-amber-50/70 border-l-4 border-l-amber-500" : "hover:bg-slate-50"}>
                          <td className="p-4 font-bold text-slate-600 border-r border-slate-200 sticky left-0 bg-inherit">
                            Net Discount Savings
                          </td>
                          {items.map((p) => {
                            const disc = calculateDiscountPercentage(p.price, p.compareAtPrice);
                            return (
                              <td key={p.id} className="p-4 border-r border-slate-200">
                                {disc > 0 ? (
                                  <span className="font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                    {disc}% OFF (Save {formatCurrency((p.compareAtPrice || 0) - p.price)})
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-medium">Standard Price</span>
                                )}
                              </td>
                            );
                          })}
                          {items.length < 4 && <td className="bg-slate-50/50"></td>}
                        </tr>
                      );
                    })()}

                    {/* SECTION: FULFILLMENT & SOURCING SLA */}
                    <tr className="bg-slate-100/70 font-extrabold text-slate-800">
                      <td colSpan={items.length + (items.length < 4 ? 2 : 1)} className="p-3 text-[11px] uppercase tracking-wider sticky left-0">
                        Fulfillment, Dispatch & Logistics SLA
                      </td>
                    </tr>

                    {/* Delivery Timeline */}
                    {(() => {
                      const isDiff = checkIsDifferent((i) => i.deliveryTime || "5-8 business days");
                      const isHighlighted = highlightDiffs && isDiff;
                      return (
                        <tr className={isHighlighted ? "bg-amber-50/70 border-l-4 border-l-amber-500" : "hover:bg-slate-50"}>
                          <td className="p-4 font-bold text-slate-600 border-r border-slate-200 sticky left-0 bg-inherit">
                            <span className="flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5 text-blue-600" />
                              Doorstep Delivery SLA
                            </span>
                          </td>
                          {items.map((p) => (
                            <td key={p.id} className="p-4 border-r border-slate-200">
                              <div className="space-y-0.5">
                                <span className="font-extrabold text-slate-900 text-xs">
                                  {p.deliveryTime || "5–8 Business Days"}
                                </span>
                                <p className="text-[11px] text-emerald-600 font-bold">
                                  FREE Standard Shipping
                                </p>
                              </div>
                            </td>
                          ))}
                          {items.length < 4 && <td className="bg-slate-50/50"></td>}
                        </tr>
                      );
                    })()}

                    {/* Sourcing & Dispatch */}
                    {(() => {
                      const isDiff = checkIsDifferent((i) => i.dispatchDays || 2);
                      const isHighlighted = highlightDiffs && isDiff;
                      return (
                        <tr className={isHighlighted ? "bg-amber-50/70 border-l-4 border-l-amber-500" : "hover:bg-slate-50"}>
                          <td className="p-4 font-bold text-slate-600 border-r border-slate-200 sticky left-0 bg-inherit">
                            Wholesale Sourcing & Dispatch
                          </td>
                          {items.map((p) => (
                            <td key={p.id} className="p-4 border-r border-slate-200 text-slate-700">
                              Dispatched in {p.dispatchDays || 2} business days via BlueDart / Delhivery Express
                            </td>
                          ))}
                          {items.length < 4 && <td className="bg-slate-50/50"></td>}
                        </tr>
                      );
                    })()}

                    {/* SECTION: BUYER PROTECTION & RETURNS */}
                    <tr className="bg-slate-100/70 font-extrabold text-slate-800">
                      <td colSpan={items.length + (items.length < 4 ? 2 : 1)} className="p-3 text-[11px] uppercase tracking-wider sticky left-0">
                        Buyer Protection, Returns & Invoicing
                      </td>
                    </tr>

                    {/* 7-Day Return Guarantee */}
                    <tr>
                      <td className="p-4 font-bold text-slate-600 border-r border-slate-200 sticky left-0 bg-white">
                        <span className="flex items-center gap-1.5">
                          <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                          Return & Replacement Policy
                        </span>
                      </td>
                      {items.map((p) => (
                        <td key={p.id} className="p-4 border-r border-slate-200">
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-slate-900 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              7-Day Free Doorstep Return
                            </span>
                            <p className="text-[11px] text-slate-500">
                              Instant UPI / Card refund upon courier pickup verification
                            </p>
                          </div>
                        </td>
                      ))}
                      {items.length < 4 && <td className="bg-slate-50/50"></td>}
                    </tr>

                    {/* GST Invoice */}
                    <tr>
                      <td className="p-4 font-bold text-slate-600 border-r border-slate-200 sticky left-0 bg-white">
                        <span className="flex items-center gap-1.5">
                          <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                          GST Invoice & ITC
                        </span>
                      </td>
                      {items.map((p) => (
                        <td key={p.id} className="p-4 border-r border-slate-200">
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-slate-900">
                              Tax Invoice Included
                            </span>
                            <p className="text-[11px] text-slate-500">
                              Input Tax Credit (18% GST) eligible for registered businesses
                            </p>
                          </div>
                        </td>
                      ))}
                      {items.length < 4 && <td className="bg-slate-50/50"></td>}
                    </tr>

                    {/* Quality & Inspection */}
                    <tr>
                      <td className="p-4 font-bold text-slate-600 border-r border-slate-200 sticky left-0 bg-white">
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                          Quality Certification
                        </span>
                      </td>
                      {items.map((p) => (
                        <td key={p.id} className="p-4 border-r border-slate-200 text-slate-700">
                          Individually bubble-wrapped & barcoded prior to dispatch
                        </td>
                      ))}
                      {items.length < 4 && <td className="bg-slate-50/50"></td>}
                    </tr>

                    {/* Bottom CTA Row */}
                    <tr className="bg-slate-50/80">
                      <td className="p-4 font-extrabold text-slate-700 border-r border-slate-200 sticky left-0 bg-slate-50/80">
                        Instant Checkout
                      </td>
                      {items.map((p) => (
                        <td key={p.id} className="p-4 border-r border-slate-200">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAddToCart(p)}
                              disabled={!p.inStock}
                              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs cursor-pointer disabled:opacity-40"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>Add to Cart</span>
                            </button>
                          </div>
                        </td>
                      ))}
                      {items.length < 4 && <td className="bg-slate-50/50"></td>}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bulk Cart Action Card */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-base sm:text-lg font-black flex items-center justify-center sm:justify-start gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-400" />
                  Ready to complete your wholesale purchase?
                </h3>
                <p className="text-xs sm:text-sm text-blue-200 max-w-xl">
                  Add all in-stock compared items to your cart with one click. Enjoy guaranteed 5–8 day delivery and doorstep returns.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleAddAllToCart}
                  className="bg-white hover:bg-blue-50 text-blue-950 font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-lg transition-all active:scale-98 cursor-pointer flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4 text-blue-600" />
                  <span>Add All to Cart</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Product to Compare Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Add Product to Comparison Matrix
                  </h3>
                  <p className="text-xs text-slate-500">
                    Slot {items.length + 1} of 4 • Select an item to compare side-by-side
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Search Bar */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search catalog by name, brand, or specs..."
                  className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                />
              </div>
            </div>

            {/* Modal Product List */}
            <div className="p-4 overflow-y-auto space-y-2.5 flex-1 divide-y divide-slate-100">
              {isLoadingCatalog ? (
                <div className="py-12 text-center text-xs text-slate-400 font-medium">
                  Loading catalog products...
                </div>
              ) : filteredCatalog.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 font-medium">
                  No matching products found or all are already in comparison.
                </div>
              ) : (
                filteredCatalog.map((product) => {
                  const primaryImage =
                    product.images?.[0]?.url ||
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop";

                  return (
                    <div
                      key={product.id}
                      className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 hover:bg-slate-50 p-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={primaryImage}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                        />
                        <div>
                          <span className="text-[10px] font-bold text-blue-600 uppercase">
                            {product.brand?.name || "HubStore"}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-black text-slate-900">
                              {formatCurrency(product.price)}
                            </span>
                            {product.compareAtPrice && product.compareAtPrice > product.price && (
                              <span className="text-[11px] text-slate-400 line-through">
                                {formatCurrency(product.compareAtPrice)}
                              </span>
                            )}
                            <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {product.rating?.toFixed(1) || "4.5"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const added = addToCompare({
                            id: product.id,
                            name: product.name,
                            slug: product.slug,
                            price: product.price,
                            compareAtPrice: product.compareAtPrice,
                            image: primaryImage,
                            rating: product.rating || 4.5,
                            reviewCount: product.reviewCount || 10,
                            category: product.category?.name || "General",
                            brand: product.brand?.name || "HubStore",
                            inStock: true,
                            stockCount: product.inventory?.quantity || 20,
                            deliveryTime: "5-8 business days",
                            dispatchDays: 2,
                            shortDescription: product.description?.substring(0, 100),
                          });
                          if (added) {
                            toast(`Added "${product.name.substring(0, 25)}..." to comparison!`, "success");
                            setIsAddModalOpen(false);
                          } else {
                            toast("Comparison dock full (max 4 products)", "error");
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-sm transition-all shrink-0 cursor-pointer"
                      >
                        + Select
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
