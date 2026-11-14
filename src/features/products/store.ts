import { create } from 'zustand';

import { MOCK_PRODUCTS } from './mock-data';
import type { Product, ProductInput } from './types';
import { normalizeProductRecord } from './utils';

interface ProductState {
  products: Product[];
  addProduct: (input: ProductInput) => Product;
  updateProduct: (id: number, input: Partial<ProductInput>) => void;
  deleteProduct: (id: number) => void;
  resetProducts: () => void;
}

const STORAGE_KEY = 'tech-gear-products';

const getDefaultProducts = (): Product[] => {
  return [...MOCK_PRODUCTS];
};

const getInitialProducts = (): Product[] => {
  if (typeof window === 'undefined') return getDefaultProducts();

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return getDefaultProducts();

  try {
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return getDefaultProducts();
    }

    const validated: Product[] = [];
    for (const item of parsed) {
      const normalized = normalizeProductRecord(item);
      if (normalized) {
        validated.push(normalized);
      }
    }

    return validated.length > 0 ? validated : getDefaultProducts();
  } catch {
    return getDefaultProducts();
  }
};

const persistProducts = (products: Product[]) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }
};

export const useProductStore = create<ProductState>((set) => ({
  products: getInitialProducts(),

  addProduct: (input) => {
    let createdProduct: Product | null = null;
    set((state) => {
      const nextId = state.products.reduce((max, p) => (p.id > max ? p.id : max), 0) + 1;
      const stock = Math.max(0, input.stockQuantity);
      const newProduct: Product = {
        ...input,
        id: nextId,
        stockQuantity: stock,
        inStock: stock > 0,
        rating: input.rating ?? 5,
        reviewCount: input.reviewCount ?? 0,
        soldCount: input.soldCount ?? 0,
      };
      createdProduct = newProduct;
      const nextProducts = [newProduct, ...state.products];
      persistProducts(nextProducts);
      return { products: nextProducts };
    });
    return createdProduct!;
  },

  updateProduct: (id, input) => {
    set((state) => {
      const nextProducts = state.products.map((p) => {
        if (p.id !== id) return p;
        const nextStock = input.stockQuantity !== undefined ? Math.max(0, input.stockQuantity) : p.stockQuantity;
        return {
          ...p,
          ...input,
          stockQuantity: nextStock,
          inStock: nextStock > 0,
        };
      });
      persistProducts(nextProducts);
      return { products: nextProducts };
    });
  },

  deleteProduct: (id) => {
    set((state) => {
      const nextProducts = state.products.filter((p) => p.id !== id);
      persistProducts(nextProducts);
      return { products: nextProducts };
    });
  },

  resetProducts: () => {
    const defaults = getDefaultProducts();
    persistProducts(defaults);
    set({ products: defaults });
  },
}));

