import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Award,
  Zap,
  Clock,
  TrendingUp,
  Flame,
  ShieldCheck,
  Package,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/product/ProductCard";
import { HeroQuickSearch } from "@/components/home/HeroQuickSearch";
import { CategoryShortcuts } from "@/components/home/CategoryShortcuts";
import { TrustGuarantees } from "@/components/home/TrustGuarantees";
import { FlashSaleCountdown } from "@/components/home/FlashSaleCountdown";
import { WhereToShopNext } from "@/components/home/WhereToShopNext";

export const revalidate = 60; // ISR cache revalidation

export default async function HomePage() {
  // Parallel database queries for all high-velocity sections
  const [
    flashDeals,
    bestSellers,
    newArrivals,
    trendingProducts,
    categories,
    brands,
  ] = await Promise.all([
    // 1. Flash Deals (highest discount percentage)
    prisma.product.findMany({
      where: { status: "PUBLISHED", discountPercent: { gte: 20 } },
      include: {
        images: { orderBy: { order: "asc" } },
        brand: true,
        category: true,
        inventory: true,
      },
      orderBy: { discountPercent: "desc" },
      take: 4,
    }),

    // 2. Best Sellers (highest review counts & ratings)
    prisma.product.findMany({
      where: { status: "PUBLISHED" },
      include: {
        images: { orderBy: { order: "asc" } },
        brand: true,
        category: true,
        inventory: true,
      },
      orderBy: [{ reviewCount: "desc" }, { rating: "desc" }],
      take: 4,
    }),

    // 3. New Arrivals (latest created)
    prisma.product.findMany({
      where: { status: "PUBLISHED" },
      include: {
        images: { orderBy: { order: "asc" } },
        brand: true,
        category: true,
        inventory: true,
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),

    // 4. Trending & Featured Products
    prisma.product.findMany({
      where: { status: "PUBLISHED", featured: true },
      include: {
        images: { orderBy: { order: "asc" } },
        brand: true,
        category: true,
        inventory: true,
      },
      take: 4,
    }),

    // 5. Featured Categories
    prisma.category.findMany({
      where: { featured: true },
      include: {
        _count: { select: { products: true } },
      },
    }),

    // 6. Featured Brands
    prisma.brand.findMany({
      where: { featured: true },
      take: 6,
    }),
  ]);

  return (
    <div className="space-y-16 pb-20">
      {/* ============================================================
          1. LARGE HERO BANNER with TOP SEARCH BAR & VALUE PROPOSITIONS
          ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent opacity-70" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 md:pt-20 md:pb-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Pitch & Search */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 px-3.5 py-1.5 rounded-full text-xs font-semibold text-blue-300 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>India&apos;s Next-Gen Marketplace • Same-Day Dispatch</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08]">
                Uncompromising Quality. <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
                  Exceptional Value.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Discover flagship tech, tailored fashion, barista espresso machines, and high-performance
                athletics. Sourced directly from verified creators with GST tax invoicing and 7-day replacement.
              </p>

              {/* Top Integrated Search Bar with Trending Chips */}
              <div className="pt-1">
                <HeroQuickSearch />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/products"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/products?sort=discount"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-amber-300 hover:text-white text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Flash Deals (Up to 50% Off)</span>
                </Link>
              </div>

              {/* Quick Trust Badges Strip */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-left">
                <div>
                  <div className="text-base sm:text-lg font-extrabold text-white">100% Genuine</div>
                  <div className="text-[11px] text-slate-400">Brand-direct warranty</div>
                </div>
                <div>
                  <div className="text-base sm:text-lg font-extrabold text-white">Free Express</div>
                  <div className="text-[11px] text-slate-400">On orders over ₹999</div>
                </div>
                <div>
                  <div className="text-base sm:text-lg font-extrabold text-white">7-Day Return</div>
                  <div className="text-[11px] text-slate-400">Instant UPI refund</div>
                </div>
              </div>
            </div>

            {/* Right Hero Featured Showcase Card */}
            <div className="lg:col-span-5 relative mx-auto max-w-md lg:max-w-none w-full">
              <div className="relative rounded-3xl overflow-hidden border border-slate-700/60 shadow-2xl bg-slate-900/70 backdrop-blur-md p-6 sm:p-7">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                  <span className="flex items-center gap-1 text-emerald-400 font-extrabold">
                    <Zap className="w-4 h-4" /> Deal of the Day
                  </span>
                  <span className="font-mono bg-slate-800 px-2.5 py-0.5 rounded-md text-[11px] text-amber-400 font-bold border border-amber-400/20">
                    Ending Soon
                  </span>
                </div>

                <div className="aspect-square rounded-2xl overflow-hidden bg-slate-800 mb-5 group relative">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop"
                    alt="NovaAudio Apex Pro ANC"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    fetchPriority="high"
                    loading="eager"
                    decoding="async"
                  />
                  <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-md shadow-md">
                    25% OFF
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] uppercase font-black text-blue-400 tracking-wider">
                    NovaAudio Flagship
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                    NovaAudio Apex Pro ANC Wireless Headphones
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2">
                    Studio-grade 40mm drivers with 98% active noise cancellation and 45-hour battery life.
                  </p>

                  <div className="flex items-baseline gap-3 pt-2">
                    <span className="text-2xl font-black text-white">₹14,999</span>
                    <span className="text-sm text-slate-400 line-through">₹19,999</span>
                    <span className="text-xs text-emerald-400 font-bold">Save ₹5,000</span>
                  </div>

                  <Link
                    href="/products/novaaudio-apex-pro-anc-headphones"
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/30 text-center"
                  >
                    <span>View Deal & Instant Buy</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          2. CATEGORY SHORTCUTS (Instant 1-Tap Navigation)
          ============================================================ */}
      <CategoryShortcuts categories={categories} />

      {/* ============================================================
          3. WHY THEY SHOULD TRUST YOU (5-Pillar Conversion Guarantees)
          ============================================================ */}
      <TrustGuarantees />

      {/* ============================================================
          4. WHAT'S ON SALE: FLASH SUPERDEALS with LIVE COUNTDOWN
          ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
          {/* Live countdown timer bar */}
          <FlashSaleCountdown />

          {/* Flash Deal Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {flashDeals.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                customBadge={{
                  text: `🔥 ${Math.round(prod.discountPercent || 25)}% OFF`,
                  variant: "rose",
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          5. BEST SELLERS SHOWCASE (Rank Badges #1 to #4)
          ============================================================ */}
      <section id="best-sellers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center">
              <Award className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                  Most Loved by Buyers
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                Best Sellers
              </h2>
            </div>
          </div>

          <Link
            href="/products?sort=rating"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Top Rated</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {bestSellers.map((prod, idx) => (
            <ProductCard
              key={prod.id}
              product={prod}
              customBadge={{
                text: `🏆 #${idx + 1} Best Seller`,
                variant: "gold",
              }}
            />
          ))}
        </div>
      </section>

      {/* ============================================================
          6. WHERE TO SHOP NEXT (Curated Shopping Portals)
          ============================================================ */}
      <WhereToShopNext />

      {/* ============================================================
          7. NEW ARRIVALS (Fresh Releases)
          ============================================================ */}
      <section id="new-arrivals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Just Dropped
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                New Arrivals
              </h2>
            </div>
          </div>

          <Link
            href="/products?sort=newest"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Fresh Releases</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {newArrivals.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              customBadge={{
                text: "✨ NEW DROP",
                variant: "emerald",
              }}
            />
          ))}
        </div>
      </section>

      {/* ============================================================
          8. TRENDING PRODUCTS (High Engagement & Community Hits)
          ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                Popular Now
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                Trending Right Now
              </h2>
            </div>
          </div>

          <Link
            href="/products"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {trendingProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              customBadge={{
                text: "🔥 TRENDING",
                variant: "indigo",
              }}
            />
          ))}
        </div>
      </section>

      {/* ============================================================
          9. FEATURED BRANDS SHOWCASE (Official Stores & Authenticity)
          ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
            <span className="text-xs uppercase tracking-widest font-extrabold text-blue-600">
              Verified Brand Partners
            </span>
            <h2 className="text-2xl font-black text-slate-900">Official Brand Stores</h2>
            <p className="text-xs text-slate-500">
              Direct brand channels guaranteeing 100% authentic merchandise and manufacturer warranty
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {brands.map((b) => (
              <Link
                key={b.id}
                href={`/products?brands=${b.slug}`}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200/70 hover:border-blue-300 text-center transition-all group flex flex-col items-center justify-center h-28 shadow-2xs hover:shadow-md cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-white text-slate-500 group-hover:text-blue-600 group-hover:scale-110 flex items-center justify-center mb-2 shadow-xs transition-all">
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-slate-800 group-hover:text-blue-600 transition-colors">
                  {b.name}
                </span>
                <span className="text-[10px] text-slate-400 group-hover:text-blue-500 font-medium">
                  Official Store
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
