"use client";

import React from "react";
import Link from "next/link";
import {
  Zap,
  Cpu,
  Shirt,
  Home as HomeIcon,
  Activity,
  Flame,
  Award,
  Sparkles,
  Tag,
} from "lucide-react";

interface CategoryShortcutsProps {
  categories: {
    id: string;
    name: string;
    slug: string;
    _count?: { products: number };
  }[];
}

export function CategoryShortcuts({ categories }: CategoryShortcutsProps) {
  const iconMap: Record<string, any> = {
    electronics: Cpu,
    fashion: Shirt,
    "home-kitchen": HomeIcon,
    "fitness-wellness": Activity,
  };

  const quickShortcuts = [
    {
      label: "Flash SuperDeals",
      href: "/products?sort=discount",
      icon: Flame,
      color: "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-600 hover:text-white",
      badge: "Up to 50% OFF",
    },
    {
      label: "Best Sellers",
      href: "#best-sellers",
      icon: Award,
      color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-500 hover:text-white",
      badge: "Top Rated",
    },
    {
      label: "New Arrivals",
      href: "#new-arrivals",
      icon: Sparkles,
      color: "bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-600 hover:text-white",
      badge: "Fresh Drops",
    },
    {
      label: "Under ₹999 Store",
      href: "/products?maxPrice=999",
      icon: Tag,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-600 hover:text-white",
      badge: "Budget Hub",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl p-4 sm:p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800">
              Instant Category Shortcuts
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Jump to top collections in 1-click
          </span>
        </div>

        {/* Scrollable / Responsive Pills Rail */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
          {/* Quick Filter Actions */}
          {quickShortcuts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={`quick-${idx}`}
                href={item.href}
                className={`group rounded-xl border p-2.5 sm:p-3 flex flex-col items-center justify-center text-center transition-all duration-200 hover:shadow-md cursor-pointer ${item.color}`}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold leading-tight line-clamp-1">
                  {item.label}
                </span>
                <span className="text-[9px] font-semibold mt-0.5 opacity-80">
                  {item.badge}
                </span>
              </Link>
            );
          })}

          {/* Database Categories */}
          {categories.map((cat) => {
            const Icon = iconMap[cat.slug] || Cpu;
            const count = cat._count?.products || 0;
            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-blue-600 hover:border-blue-600 text-slate-800 hover:text-white p-2.5 sm:p-3 flex flex-col items-center justify-center text-center transition-all duration-200 hover:shadow-md cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-white group-hover:bg-white/20 text-blue-600 group-hover:text-white flex items-center justify-center mb-1.5 shadow-xs transition-transform group-hover:scale-110">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold leading-tight line-clamp-1 group-hover:text-white">
                  {cat.name}
                </span>
                <span className="text-[9px] text-slate-500 group-hover:text-blue-100 font-medium mt-0.5">
                  {count > 0 ? `${count} Items` : "Explore"}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
