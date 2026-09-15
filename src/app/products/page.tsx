"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  SlidersHorizontal,
  Grid,
  List,
  ChevronRight,
  Star,
  Check,
  X,
  Package,
  RotateCcw,
  Sparkles,
  Hash,
} from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { formatCurrency } from "@/lib/currency";

function ProductsCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [didYouMean, setDidYouMean] = useState<string | null>(null);
  const [originalQuery, setOriginalQuery] = useState<string | null>(null);

  // Active filter states from URL
  const currentCategory = searchParams.get("category") || "";
  const currentBrands = searchParams.get("brands")?.split(",").filter(Boolean) || [];
  const currentSort = searchParams.get("sort") || "featured";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentRating = searchParams.get("rating") || "";
  const currentInStock = searchParams.get("inStock") === "true";
  const searchQuery = searchParams.get("q") || "";

  // Fetch categories once
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadCategories();
  }, []);

  // Fetch products whenever searchParams change
  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams(searchParams.toString());
        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        setProducts(data.products || []);
        setTotalCount(data.pagination?.total || 0);
        setDidYouMean(data.didYouMean || null);
        setOriginalQuery(data.originalQuery || null);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, [searchParams]);

  // Update query params helper
  const updateQueryParam = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    router.push(`/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push("/products");
  };

  const handleBrandToggle = (brandSlug: string) => {
    let newBrands = [...currentBrands];
    if (newBrands.includes(brandSlug)) {
      newBrands = newBrands.filter((b) => b !== brandSlug);
    } else {
      newBrands.push(brandSlug);
    }
    updateQueryParam({ brands: newBrands.length > 0 ? newBrands.join(",") : null });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-900">
          {searchQuery ? `Search: "${searchQuery}"` : currentCategory ? currentCategory : "All Products"}
        </span>
      </nav>

      {/* Typo Correction Notification Banner */}
      {didYouMean && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-3 text-amber-900">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900">
                Showing results for <span className="underline italic text-amber-700 font-extrabold">{didYouMean}</span>
              </p>
              <p className="text-slate-500 mt-0.5">
                No direct matches found for &ldquo;{originalQuery}&rdquo;. We automatically searched for the corrected term.
              </p>
            </div>
          </div>

          <button
            onClick={() => updateQueryParam({ q: didYouMean })}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer self-start sm:self-auto"
          >
            Apply &ldquo;{didYouMean}&rdquo;
          </button>
        </div>
      )}

      {/* Title & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight capitalize">
            {searchQuery
              ? `Results for "${searchQuery}"`
              : currentCategory
              ? `${currentCategory.replace("-", " ")} Collection`
              : "All Products"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing {products.length} of {totalCount} items
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 hidden sm:inline">Sort by:</span>
            <select
              value={currentSort}
              onChange={(e) => updateQueryParam({ sort: e.target.value })}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 shadow-xs cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>

          {/* Grid/List View Toggle */}
          <div className="hidden sm:flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-xs">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "list" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: Filters Sidebar + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block space-y-6 bg-white p-5 rounded-2xl border border-slate-200 h-fit shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <span>Filters</span>
            </h3>
            {(currentCategory || currentBrands.length > 0 || currentMinPrice || currentRating) && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-rose-600 hover:underline font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Category
            </span>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => updateQueryParam({ category: null })}
                className={`w-full text-left py-1 px-2 rounded-md transition-colors ${
                  !currentCategory ? "font-bold text-blue-600 bg-blue-50" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateQueryParam({ category: c.slug })}
                  className={`w-full text-left py-1 px-2 rounded-md transition-colors flex justify-between ${
                    currentCategory === c.slug
                      ? "font-bold text-blue-600 bg-blue-50"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>{c.name}</span>
                  <span className="text-slate-400">{c._count?.products || 0}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Brand
            </span>
            <div className="space-y-1.5 text-xs">
              {[
                { name: "Zenith Tech", slug: "zenith-tech" },
                { name: "NovaAudio", slug: "novaaudio" },
                { name: "VoltGear", slug: "voltgear" },
                { name: "Aurelia Atelier", slug: "aurelia-atelier" },
                { name: "UrbanWeave", slug: "urbanweave" },
                { name: "CulinaryCraft", slug: "culinarycraft" },
                { name: "PulseFit", slug: "pulsefit" },
              ].map((brand) => {
                const checked = currentBrands.includes(brand.slug);
                return (
                  <label
                    key={brand.slug}
                    className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleBrandToggle(brand.slug)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>{brand.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Customer Rating
            </span>
            <div className="space-y-1.5 text-xs">
              {[4, 3, 2].map((r) => (
                <button
                  key={r}
                  onClick={() =>
                    updateQueryParam({ rating: currentRating === r.toString() ? null : r.toString() })
                  }
                  className={`w-full flex items-center justify-between p-1.5 rounded-lg transition-colors ${
                    currentRating === r.toString()
                      ? "bg-amber-50 text-amber-900 font-bold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span>{r}★ & above</span>
                  </div>
                  {currentRating === r.toString() && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Availability
            </span>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={currentInStock}
                onChange={(e) => updateQueryParam({ inStock: e.target.checked ? "true" : null })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-xs animate-pulse"
                >
                  <div className="aspect-square bg-slate-200 rounded-xl" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-5 bg-slate-200 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">No products match your filters</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Try clearing some filter tags or adjusting your search keywords to find what you&apos;re
                  looking for.
                </p>
              </div>
              <button
                onClick={clearAllFilters}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {products.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
          <div
            onClick={() => setMobileFiltersOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
          />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs bg-white shadow-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-slate-900">Filter Products</h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
                <div>
                  <span className="font-bold uppercase tracking-wider">Categories</span>
                  <div className="space-y-1 mt-2">
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          updateQueryParam({ category: c.slug });
                          setMobileFiltersOpen(false);
                        }}
                        className="w-full text-left py-1.5 px-2 rounded hover:bg-slate-100"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  clearAllFilters();
                  setMobileFiltersOpen(false);
                }}
                className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading catalog...</div>}>
      <ProductsCatalogContent />
    </Suspense>
  );
}
