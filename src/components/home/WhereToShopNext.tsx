import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Tag, Headphones, Shirt, Coffee } from "lucide-react";

export function WhereToShopNext() {
  const collections = [
    {
      title: "The Under ₹999 Store",
      subtitle: "Daily essentials, charging docks & fast accessories",
      tag: "Budget Hub",
      href: "/products?maxPrice=999",
      icon: Tag,
      gradient: "from-emerald-600 to-teal-800",
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop",
      badge: "Over 40+ Items",
    },
    {
      title: "Audiophile & Flagship Audio",
      subtitle: "ANC noise cancelling, spatial sound & studio monitors",
      tag: "Top Tech",
      href: "/category/electronics",
      icon: Headphones,
      gradient: "from-blue-600 to-indigo-900",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop",
      badge: "Brand Direct",
    },
    {
      title: "Everyday Luxury Wardrobe",
      subtitle: "Tailored hoodies, premium heavyweight tees & sneakers",
      tag: "Trending Apparel",
      href: "/category/fashion",
      icon: Shirt,
      gradient: "from-amber-600 to-rose-900",
      image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop",
      badge: "Fresh Collection",
    },
    {
      title: "Artisan Coffee & Smart Living",
      subtitle: "Precision espresso makers, cookware & aesthetic living",
      tag: "Home & Kitchen",
      href: "/category/home-kitchen",
      icon: Coffee,
      gradient: "from-stone-700 to-stone-900",
      image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop",
      badge: "Curated Living",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">
              Curated Shopping Portals
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Where to Shop Next
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Targeted collections built around your immediate shopping mission
          </p>
        </div>

        <Link
          href="/products"
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Explore All 32+ Handpicked Products</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {collections.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              href={item.href}
              className="group relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[280px] p-6 text-white"
            >
              {/* Background Image with Dark Gradient Overlay */}
              <div className="absolute inset-0 z-0">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${item.gradient} opacity-85 group-hover:opacity-90 transition-opacity`}
                />
              </div>

              {/* Top Header info */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-md">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/20">
                  {item.badge}
                </span>
              </div>

              {/* Bottom Content */}
              <div className="relative z-10 mt-auto pt-8">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
                  {item.tag}
                </span>
                <h3 className="text-lg font-black text-white leading-tight mt-0.5 mb-1.5 group-hover:text-amber-200 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                  {item.subtitle}
                </p>

                <div className="mt-4 inline-flex items-center gap-1 text-xs font-extrabold text-white group-hover:translate-x-1 transition-transform">
                  <span>Shop Collection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
