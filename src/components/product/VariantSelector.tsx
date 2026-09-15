"use client";

import React from "react";
import { Check } from "lucide-react";
import { ProductVariantItem } from "@/types";
import { formatCurrency } from "@/lib/currency";

interface VariantSelectorProps {
  variants: ProductVariantItem[];
  selectedVariantId: string | null;
  onSelectVariant: (variant: ProductVariantItem) => void;
}

export function VariantSelector({
  variants,
  selectedVariantId,
  onSelectVariant,
}: VariantSelectorProps) {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="space-y-3 py-3 border-y border-slate-200">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-900 uppercase tracking-wide">
          Select Option / Configuration:
        </span>
        <span className="text-slate-500">{variants.length} available</span>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {variants.map((v) => {
          const isSelected = selectedVariantId === v.id;
          const isOutOfStock = v.stock <= 0;

          return (
            <button
              key={v.id}
              type="button"
              disabled={isOutOfStock}
              onClick={() => onSelectVariant(v)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isSelected
                  ? "border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20 shadow-xs"
                  : isOutOfStock
                  ? "border-slate-200 bg-slate-50 text-slate-400 opacity-60 cursor-not-allowed line-through"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
              <span>{v.title}</span>
              <span className="text-slate-400 font-normal">|</span>
              <span className="font-bold text-slate-900">{formatCurrency(v.price)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
