import { create } from 'zustand';

import type { CartItem } from './types';
import type { Product } from '../products/types';
import { normalizeProductRecord } from '../products/utils';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
}

const getInitialItems = (): CartItem[] => {
  const savedItems = window.localStorage.getItem('tech-gear-cart');
  if (!savedItems) return [];

  try {
    const parsedItems: unknown = JSON.parse(savedItems);
    if (!Array.isArray(parsedItems)) return [];

    const normalized: CartItem[] = [];
    for (const item of parsedItems) {
      if (!item || typeof item !== 'object') continue;
      const candidate = item as Record<string, unknown>;
      const product = normalizeProductRecord(candidate.product);
      if (typeof candidate.quantity === 'number' && candidate.quantity > 0 && product) {
        normalized.push({ product, quantity: candidate.quantity });
      }
    }
    return normalized;
  } catch {
    return [];
  }
};

export const useCartStore = create<CartStore>((set) => ({
  items: getInitialItems(),
  addItem: (product) =>
    set((state) => {
      const existingItem = state.items.find(
        (currentItem) => currentItem.product.id === product.id,
      );

      if (existingItem) {
        const nextState = {
          items: state.items.map((currentItem) =>
            currentItem.product.id === product.id
              ? {
                  ...currentItem,
                  quantity: currentItem.quantity + 1,
                }
              : currentItem,
          ),
        };
        window.localStorage.setItem('tech-gear-cart', JSON.stringify(nextState.items));
        return nextState;
      }

      const nextState = {
        items: [...state.items, { product, quantity: 1 }],
      };
      window.localStorage.setItem('tech-gear-cart', JSON.stringify(nextState.items));
      return nextState;
    }),
  removeItem: (id) =>
    set((state) => {
      const items = state.items.filter((item) => item.product.id !== id);
      window.localStorage.setItem('tech-gear-cart', JSON.stringify(items));
      return { items };
    }),
  updateQuantity: (id, quantity) =>
    set((state) => {
      const items =
        quantity > 0
          ? state.items.map((item) =>
              item.product.id === id ? { ...item, quantity } : item,
            )
          : state.items.filter((item) => item.product.id !== id);
      window.localStorage.setItem('tech-gear-cart', JSON.stringify(items));
      return { items };
    }),
  clearCart: () => {
    window.localStorage.removeItem('tech-gear-cart');
    set({ items: [] });
  },
}));
