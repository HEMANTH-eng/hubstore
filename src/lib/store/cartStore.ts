"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { APP_CONFIG } from "../constants";

export interface CartItemLocal {
  productId: string;
  variantId?: string | null;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  quantity: number;
  maxStock: number;
  variantTitle?: string | null;
}

interface CartStore {
  items: CartItemLocal[];
  isOpen: boolean;
  couponCode: string | null;
  couponDiscount: number;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItemLocal, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string | null) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string | null) => void;
  applyCoupon: (code: string, discountAmount: number) => void;
  removeCoupon: () => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotalItems: () => number;
  getShippingFee: () => number;
  getTaxAmount: () => number;
  getGrandTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      couponCode: null,
      couponDiscount: 0,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (newItem, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.productId === newItem.productId && i.variantId === newItem.variantId
          );

          if (existingIndex > -1) {
            const currentItem = state.items[existingIndex];
            const newQty = Math.min(currentItem.quantity + quantity, currentItem.maxStock || 99);
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = { ...currentItem, quantity: newQty };
            return { items: updatedItems, isOpen: true };
          } else {
            const addQty = Math.min(quantity, newItem.maxStock || 99);
            return {
              items: [...state.items, { ...newItem, quantity: addQty }],
              isOpen: true,
            };
          }
        });
      },

      removeItem: (productId, variantId = null) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          ),
        }));
      },

      updateQuantity: (productId, quantity, variantId = null) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }

        set((state) => ({
          items: state.items.map((i) => {
            if (i.productId === productId && i.variantId === variantId) {
              const clampedQty = Math.min(quantity, i.maxStock || 99);
              return { ...i, quantity: clampedQty };
            }
            return i;
          }),
        }));
      },

      applyCoupon: (code, discountAmount) => {
        set({ couponCode: code, couponDiscount: discountAmount });
      },

      removeCoupon: () => {
        set({ couponCode: null, couponDiscount: 0 });
      },

      clearCart: () => {
        set({ items: [], couponCode: null, couponDiscount: 0 });
      },

      getSubtotal: () => {
        return get().items.reduce((total, i) => total + i.price * i.quantity, 0);
      },

      getTotalItems: () => {
        return get().items.reduce((total, i) => total + i.quantity, 0);
      },

      getShippingFee: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        return subtotal >= APP_CONFIG.freeShippingThreshold ? 0 : APP_CONFIG.standardShippingFee;
      },

      getTaxAmount: () => {
        const subtotal = get().getSubtotal();
        const discount = get().couponDiscount;
        const taxableAmount = Math.max(0, subtotal - discount);
        return Math.round((taxableAmount * (APP_CONFIG.taxRatePercent / 100)) * 100) / 100;
      },

      getGrandTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().couponDiscount;
        const shipping = get().getShippingFee();
        return Math.max(0, subtotal - discount) + shipping;
      },
    }),
    {
      name: "hubstore_cart_storage",
    }
  )
);
