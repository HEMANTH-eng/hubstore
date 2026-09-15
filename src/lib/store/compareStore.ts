"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CompareProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  rating: number;
  reviewCount: number;
  category?: string | null;
  brand?: string | null;
  inStock: boolean;
  stockCount?: number;
  deliveryTime?: string;
  dispatchDays?: number;
  shortDescription?: string | null;
}

interface CompareStore {
  items: CompareProduct[];
  addToCompare: (product: CompareProduct) => boolean;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      items: [],

      addToCompare: (product) => {
        const { items } = get();
        if (items.some((i) => i.id === product.id)) {
          return false;
        }
        if (items.length >= 4) {
          return false;
        }
        set({ items: [...items, product] });
        return true;
      },

      removeFromCompare: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== productId),
        }));
      },

      clearCompare: () => {
        set({ items: [] });
      },

      isInCompare: (productId) => {
        return get().items.some((i) => i.id === productId);
      },
    }),
    {
      name: "hubstore-compare-storage",
    }
  )
);
