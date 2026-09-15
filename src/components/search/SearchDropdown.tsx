"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Clock,
  Flame,
  X,
  Sparkles,
  ArrowRight,
  Package,
  Cpu,
  Award,
  Hash,
  AlertCircle,
} from "lucide-react";

interface SearchDropdownProps {
  query: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectQuery: (query: string) => void;
  selectedCategory?: string;
}

export function SearchDropdown({
  query,
  isOpen,
  onClose,
  onSelectQuery,
  selectedCategory = "all",
}: SearchDropdownProps) {
  const router = useRouter();
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [data, setData] = useState<{
    suggestions: string[];
    products: any[];
    brand: any;
    category: any;
    skuMatch: any;
    didYouMean: string | null;
    isTypo: boolean;
  }>({
    suggestions: [],
    products: [],
    brand: null,
    category: null,
    skuMatch: null,
    didYouMean: null,
    isTypo: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Trending searches list
  const trendingSearches = [
    { label: "Wireless ANC Headphones", category: "electronics" },
    { label: "Zenith StudioBook Laptop", category: "electronics" },
    { label: "Barista Espresso Machine", category: "home-kitchen" },
    { label: "Oversized Cotton T-Shirt", category: "fashion" },
    { label: "AMOLED Smartwatch", category: "electronics" },
    { label: "Under ₹999 Store", href: "/products?maxPrice=999" },
  ];

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("hubstore_recent_searches");
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      // ignore
    }
  }, [isOpen]);

  const removeRecent = (itemToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter((item) => item !== itemToRemove);
    setRecentSearches(updated);
    try {
      localStorage.setItem("hubstore_recent_searches", JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  const clearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem("hubstore_recent_searches");
    } catch (e) {
      // ignore
    }
  };

  // Debounced fetch of suggestions
  useEffect(() => {
    if (!isOpen || !query.trim()) {
      setData({
        suggestions: [],
        products: [],
        brand: null,
        category: null,
        skuMatch: null,
        didYouMean: null,
        isTypo: false,
      });
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (err) {
        console.error("Failed to load suggestions:", err);
      } finally {
        setIsLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  const hasTyped = query.trim().length > 0;

  return (
    <div
      id="search-suggestions-dropdown"
      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 text-slate-900 max-h-[80vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* =======================================================
          STATE 1: EMPTY QUERY (Recent Searches + Trending)
          ======================================================= */}
      {!hasTyped && (
        <div className="p-4 sm:p-5 space-y-5">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Recent Searches
                </span>
                <button
                  type="button"
                  onClick={clearAllRecent}
                  className="text-[11px] font-bold text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {recentSearches.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      onSelectQuery(item);
                      router.push(`/search?q=${encodeURIComponent(item)}`);
                      onClose();
                    }}
                    className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 border border-slate-200/70 hover:border-blue-300 text-xs font-medium text-slate-700 hover:text-blue-600 transition-all cursor-pointer"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={(e) => removeRecent(item, e)}
                      className="text-slate-400 hover:text-rose-600 p-0.5 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <Flame className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Trending Searches
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {trendingSearches.map((trend, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (trend.href) {
                      router.push(trend.href);
                    } else {
                      onSelectQuery(trend.label);
                      router.push(`/search?q=${encodeURIComponent(trend.label)}`);
                    }
                    onClose();
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 text-left transition-colors text-xs font-medium text-slate-800 hover:text-blue-600 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{trend.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          STATE 2: TYPED QUERY (Instant Suggestions, Typo, SKU, Products)
          ======================================================= */}
      {hasTyped && (
        <div className="divide-y divide-slate-100">
          {/* Typo Correction Banner ("Did you mean: ...") */}
          {data.didYouMean && (
            <div className="p-3 bg-amber-50/80 border-b border-amber-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Did you mean:{" "}
                  <strong className="underline underline-offset-2 font-bold cursor-pointer">
                    {data.didYouMean}
                  </strong>
                  ?
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onSelectQuery(data.didYouMean!);
                  router.push(`/search?q=${encodeURIComponent(data.didYouMean!)}`);
                  onClose();
                }}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
              >
                Search Instead
              </button>
            </div>
          )}

          {/* SKU Direct Match Banner */}
          {data.skuMatch && (
            <div className="p-3 bg-blue-50/80 border-b border-blue-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-blue-900">
                <Hash className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="font-semibold text-[11px] uppercase tracking-wider text-blue-600">
                    Direct SKU Match
                  </span>
                  <p className="font-bold text-slate-900">
                    {data.skuMatch.name} (SKU: {data.skuMatch.sku})
                  </p>
                </div>
              </div>
              <Link
                href={`/products/${data.skuMatch.slug}`}
                onClick={onClose}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] transition-colors"
              >
                View SKU
              </Link>
            </div>
          )}

          {/* Quick Category & Brand Filter Jumpers */}
          {(data.category || data.brand) && (
            <div className="p-2.5 bg-slate-50/80 flex items-center gap-3 text-xs flex-wrap">
              {data.category && (
                <Link
                  href={`/category/${data.category.slug}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-blue-600 hover:border-blue-300 font-semibold hover:bg-blue-50 transition-all"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Search in Category: <strong>{data.category.name}</strong></span>
                </Link>
              )}
              {data.brand && (
                <Link
                  href={`/products?brands=${data.brand.slug}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-indigo-600 hover:border-indigo-300 font-semibold hover:bg-indigo-50 transition-all"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Official Brand Store: <strong>{data.brand.name}</strong></span>
                </Link>
              )}
            </div>
          )}

          {/* Autocomplete Text Suggestions */}
          {data.suggestions.length > 0 && (
            <div className="p-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2 px-1">
                Suggested Searches
              </span>
              <div className="space-y-1">
                {data.suggestions.map((sugg, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onSelectQuery(sugg);
                      router.push(`/search?q=${encodeURIComponent(sugg)}`);
                      onClose();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 text-left text-xs font-semibold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{sugg}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matching Products Area */}
          {data.products.length > 0 && (
            <div className="p-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2 px-1">
                Products Matching &ldquo;{query}&rdquo;
              </span>
              <div className="space-y-1.5">
                {data.products.map((item) => {
                  const stock = item.inventory?.quantity ?? 10;
                  return (
                    <Link
                      key={item.id}
                      href={`/products/${item.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-blue-50/70 transition-all group border border-transparent hover:border-blue-200"
                    >
                      <div className="w-11 h-11 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                        {item.images?.[0]?.url ? (
                          <img
                            src={item.images[0].url}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span>{item.category?.name || "Catalog"}</span>
                          {item.brand && <span>• {item.brand.name}</span>}
                          {item.sku && (
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              {item.sku}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs font-black text-slate-900">
                          ₹{item.price.toLocaleString("en-IN")}
                        </p>
                        {item.discountPercent > 0 && (
                          <span className="text-[10px] font-bold text-rose-600">
                            {Math.round(item.discountPercent)}% OFF
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {data.suggestions.length === 0 && data.products.length === 0 && !isLoading && (
            <div className="p-8 text-center">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800">
                No direct matches found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Try searching by broad category, brand (e.g. NovaAudio, Zenith), or check your spelling.
              </p>
            </div>
          )}

          {/* Bottom All Results Button */}
          <button
            type="button"
            onClick={() => {
              router.push(`/search?q=${encodeURIComponent(query.trim())}`);
              onClose();
            }}
            className="w-full py-3 px-4 bg-slate-50 hover:bg-blue-50 text-blue-600 hover:text-blue-700 font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>View All Search Results for &ldquo;{query}&rdquo;</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
