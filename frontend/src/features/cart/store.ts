import { create } from 'zustand';

import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import type { CartItem } from './types';
import type { Product } from '../products/types';
import { normalizeProductRecord } from '../products/utils';
import { useAuthStore } from '../auth/store';
import { useProductStore } from '../products/store';

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  currentUserId: string | null;
  addItem: (product: Product) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  loadUserCart: (userId: string) => Promise<void>;
  resetOnLogout: () => void;
}

const GUEST_STORAGE_KEY = 'techgear_guest_cart';
const BACKUP_STORAGE_KEY = 'tech-gear-cart';

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const syncCartToSupabase = async (userId: string, items: CartItem[]) => {
  if (!isSupabaseConfigured() || !userId) return;
  try {
    const payload = items.map((it) => ({
      product_id: it.product.id,
      quantity: it.quantity,
      product: it.product,
    }));

    await supabase
      .from('user_carts')
      .upsert({
        user_id: userId,
        items: payload,
        updated_at: new Date().toISOString(),
      });
  } catch (err) {
    console.warn('[TechGear Cart] Lỗi đồng bộ Supabase user_carts:', err);
  }
};

const triggerDebouncedSync = (userId: string | null, items: CartItem[]) => {
  if (!userId) return;
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    void syncCartToSupabase(userId, items);
  }, 300);
};

const getInitialItems = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  const savedItems =
    window.localStorage.getItem(GUEST_STORAGE_KEY) ||
    window.localStorage.getItem(BACKUP_STORAGE_KEY);
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

export const useCartStore = create<CartStore>((set, get) => ({
  items: getInitialItems(),
  isLoading: false,
  currentUserId: null,

  addItem: (product) =>
    set((state) => {
      const existingItem = state.items.find(
        (currentItem) => currentItem.product.id === product.id,
      );

      let nextItems: CartItem[];
      if (existingItem) {
        nextItems = state.items.map((currentItem) =>
          currentItem.product.id === product.id
            ? {
                ...currentItem,
                quantity: currentItem.quantity + 1,
              }
            : currentItem,
        );
      } else {
        nextItems = [...state.items, { product, quantity: 1 }];
      }

      const activeUserId = state.currentUserId || useAuthStore.getState().user?.id || null;
      if (activeUserId) {
        window.localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(nextItems));
        triggerDebouncedSync(activeUserId, nextItems);
      } else {
        window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(nextItems));
        window.localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(nextItems));
      }

      return { items: nextItems };
    }),

  removeItem: (id) =>
    set((state) => {
      const nextItems = state.items.filter((item) => item.product.id !== id);
      const activeUserId = state.currentUserId || useAuthStore.getState().user?.id || null;

      if (activeUserId) {
        window.localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(nextItems));
        triggerDebouncedSync(activeUserId, nextItems);
      } else {
        window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(nextItems));
        window.localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(nextItems));
      }

      return { items: nextItems };
    }),

  updateQuantity: (id, quantity) =>
    set((state) => {
      const nextItems =
        quantity > 0
          ? state.items.map((item) =>
              item.product.id === id ? { ...item, quantity } : item,
            )
          : state.items.filter((item) => item.product.id !== id);

      const activeUserId = state.currentUserId || useAuthStore.getState().user?.id || null;

      if (activeUserId) {
        window.localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(nextItems));
        triggerDebouncedSync(activeUserId, nextItems);
      } else {
        window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(nextItems));
        window.localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(nextItems));
      }

      return { items: nextItems };
    }),

  clearCart: () => {
    const activeUserId = get().currentUserId || useAuthStore.getState().user?.id || null;
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }

    window.localStorage.removeItem(GUEST_STORAGE_KEY);
    window.localStorage.removeItem(BACKUP_STORAGE_KEY);
    set({ items: [] });

    if (activeUserId && isSupabaseConfigured()) {
      void syncCartToSupabase(activeUserId, []);
    }
  },

  loadUserCart: async (userId: string) => {
    set({ isLoading: true, currentUserId: userId });

    // 1. Get guest items if any
    const guestCartRaw =
      window.localStorage.getItem(GUEST_STORAGE_KEY) ||
      window.localStorage.getItem(BACKUP_STORAGE_KEY);
    let guestItems: CartItem[] = [];
    if (guestCartRaw) {
      try {
        const parsed: unknown = JSON.parse(guestCartRaw);
        if (Array.isArray(parsed)) {
          for (const it of parsed) {
            if (!it || typeof it !== 'object') continue;
            const candidate = it as Record<string, unknown>;
            const product = normalizeProductRecord(candidate.product);
            if (product && typeof candidate.quantity === 'number' && candidate.quantity > 0) {
              guestItems.push({ product, quantity: candidate.quantity });
            }
          }
        }
      } catch {
        // ignore JSON parse error
      }
    }

    // 2. Fetch cloud cart from Supabase user_carts
    let cloudItems: CartItem[] = [];
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('user_carts')
          .select('items')
          .eq('user_id', userId)
          .maybeSingle();

        if (!error && data?.items && Array.isArray(data.items)) {
          for (const it of data.items) {
            if (!it || typeof it !== 'object') continue;
            const candidate = it as Record<string, unknown>;
            const product =
              normalizeProductRecord(candidate.product) ||
              useProductStore.getState().products.find((p) => p.id === candidate.product_id);
            const quantity = typeof candidate.quantity === 'number' ? candidate.quantity : 1;
            if (product && quantity > 0) {
              cloudItems.push({ product, quantity });
            }
          }
        }
      } catch (err) {
        console.warn('[TechGear Cart] Lỗi tải giỏ hàng từ Supabase:', err);
      }
    }

    // 3. Smart Merge: Cloud cart + Guest cart
    const mergedMap = new Map<number, CartItem>();

    for (const item of cloudItems) {
      mergedMap.set(item.product.id, { ...item });
    }

    for (const item of guestItems) {
      const existing = mergedMap.get(item.product.id);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        mergedMap.set(item.product.id, { ...item });
      }
    }

    // 4. Cross-check against latest catalog products
    const latestProducts = useProductStore.getState().products;
    const validatedItems: CartItem[] = [];

    for (const item of mergedMap.values()) {
      const catalogProduct = latestProducts.find((p) => p.id === item.product.id);
      if (catalogProduct) {
        const maxStock = catalogProduct.stockQuantity ?? (catalogProduct.inStock ? 99 : 0);
        const cappedQty = maxStock > 0 ? Math.min(item.quantity, maxStock) : item.quantity;
        validatedItems.push({
          product: catalogProduct,
          quantity: Math.max(1, cappedQty),
        });
      } else {
        validatedItems.push(item);
      }
    }

    // 5. Clean up guest local storage & set validated items
    window.localStorage.removeItem(GUEST_STORAGE_KEY);
    window.localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(validatedItems));

    set({ items: validatedItems, isLoading: false });

    // 6. Upsert merged state back to Supabase
    if (isSupabaseConfigured() && userId) {
      void syncCartToSupabase(userId, validatedItems);
    }
  },

  resetOnLogout: () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    window.localStorage.removeItem(GUEST_STORAGE_KEY);
    window.localStorage.removeItem(BACKUP_STORAGE_KEY);
    set({ items: [], currentUserId: null });
  },
}));
