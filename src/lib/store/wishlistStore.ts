"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItemLocal {
  productId: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  deliveryTime?: string;
  priceDropAlert?: boolean;
}

interface WishlistStore {
  items: WishlistItemLocal[];
  toggleItem: (item: WishlistItemLocal) => void;
  isInWishlist: (productId: string) => boolean;
  removeItem: (productId: string) => void;
  togglePriceAlert: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      toggleItem: (item) => {
        const exists = get().items.some((i) => i.productId === item.productId);
        if (exists) {
          set((state) => ({
            items: state.items.filter((i) => i.productId !== item.productId),
          }));
        } else {
          set((state) => ({
            items: [...state.items, { ...item, priceDropAlert: false }],
          }));
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((i) => i.productId === productId);
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      togglePriceAlert: (productId) => {
        let newState = false;
        set((state) => ({
          items: state.items.map((i) => {
            if (i.productId === productId) {
              newState = !i.priceDropAlert;
              return { ...i, priceDropAlert: newState };
            }
            return i;
          }),
        }));
        return newState;
      },

      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      name: "hubstore_wishlist_storage",
    }
  )
);
