"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, X, Scale, Trash2 } from "lucide-react";
import { useCompareStore } from "@/lib/store/compareStore";
import { useCartStore } from "@/lib/store/cartStore";

export function ComparisonDock() {
  const pathname = usePathname();
  const { items, removeFromCompare, clearCompare } = useCompareStore();
  const isCartOpen = useCartStore((s) => s.isOpen);

  // Hide dock on comparison page itself or when cart is open or when no items
  if (items.length === 0 || pathname === "/compare" || isCartOpen) {
    return null;
  }

  return (
    <div
      id="comparison-floating-dock"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[calc(100vw-2rem)] bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-3 sm:px-4 shadow-2xl border border-slate-700/80 animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Thumbnail Preview Strip */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 pr-1 shrink-0">
            <Scale className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Compare</span>
            <span className="bg-indigo-600 text-white px-1.5 py-0.5 rounded-full text-[10px]">
              {items.length}/4
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {items.map((item) => (
              <div
                key={item.id}
                className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-700 bg-white shrink-0 group"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeFromCompare(item.id)}
                  title={`Remove ${item.name}`}
                  className="absolute inset-0 bg-slate-950/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5 text-rose-400" />
                </button>
              </div>
            ))}

            {/* Empty slots placeholders */}
            {Array.from({ length: 4 - items.length }).map((_, idx) => (
              <div
                key={idx}
                className="w-10 h-10 rounded-xl border border-dashed border-slate-700/80 flex items-center justify-center text-slate-600 text-[10px] shrink-0"
              >
                +
              </div>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clearCompare}
            title="Clear comparison list"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors text-xs"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <Link
            href="/compare"
            id="compare-dock-cta-btn"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
          >
            <span>Compare Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
