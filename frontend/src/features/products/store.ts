import { create } from 'zustand';

import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { MOCK_PRODUCTS } from './mock-data';
import { fetchProductsFromSupabase, mapSupabaseRowToProduct, UI_CATEGORY_TO_DB, type SupabaseProductRow } from './service';
import type { Product, ProductInput } from './types';
import { normalizeProductRecord } from './utils';

interface ProductState {
  products: Product[];
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  dataSource: 'supabase' | 'local';
  fetchProducts: (force?: boolean) => Promise<void>;
  addProduct: (input: ProductInput) => Promise<Product>;
  updateProduct: (id: number, input: Partial<ProductInput>) => Promise<void>;
  restockProducts: (items: Array<{ productId: number; quantity: number }>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
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

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const useProductStore = create<ProductState>((set, get) => ({
  products: getInitialProducts(),
  isLoading: false,
  isInitialized: false,
  error: null,
  dataSource: 'local',

  fetchProducts: async (force = false) => {
    const { isInitialized, isLoading } = get();
    if (isInitialized && !force && !isLoading) return;

    set({ isLoading: true, error: null });
    try {
      const result = await fetchProductsFromSupabase();
      persistProducts(result.data);
      set({
        products: result.data,
        isLoading: false,
        isInitialized: true,
        dataSource: result.source === 'supabase' ? 'supabase' : 'local',
        error: result.error ?? null,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi tải danh sách sản phẩm';
      set({
        isLoading: false,
        isInitialized: true,
        error: msg,
      });
    }
  },

  addProduct: async (input: ProductInput): Promise<Product> => {
    const stock = Math.max(0, input.stockQuantity);
    const primaryImg = input.images && input.images.length > 0 ? input.images[0] : '';
    const categoryDb = UI_CATEGORY_TO_DB[input.category.toLowerCase()] || 'mice';
    const baseSlug = slugify(input.name);
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;

    let createdProduct: Product | null = null;

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('products')
          .insert({
            name: input.name,
            slug: uniqueSlug,
            category: categoryDb,
            segment: input.segment,
            price: input.price,
            original_price: input.originalPrice ?? null,
            rating: input.rating ?? 5.0,
            reviews_count: input.reviewCount ?? 0,
            sold_count: input.soldCount ?? 0,
            specs: input.specs,
            description: input.desc,
            stock,
            image_url: primaryImg,
            images: input.images,
            is_flash_sale: Boolean(input.isFlashSale),
          })
          .select()
          .single();

        if (error) {
          console.error('[TechGear] Lỗi thêm sản phẩm vào Supabase:', error.message);
        } else if (data) {
          createdProduct = mapSupabaseRowToProduct(data as SupabaseProductRow);
          console.log('[TechGear] Đã đẩy sản phẩm trực tiếp vào Supabase thành công! ID:', createdProduct.id);
        }
      } catch (err) {
        console.error('[TechGear] Ngoại lệ khi thêm sản phẩm vào Supabase:', err);
      }
    }

    // Fallback if Supabase call failed or unconfigured
    if (!createdProduct) {
      const nextId = get().products.reduce((max, p) => (p.id > max ? p.id : max), 0) + 1;
      createdProduct = {
        ...input,
        id: nextId,
        stockQuantity: stock,
        inStock: stock > 0,
        rating: input.rating ?? 5,
        reviewCount: input.reviewCount ?? 0,
        soldCount: input.soldCount ?? 0,
      };
    }

    const nextProducts = [createdProduct, ...get().products.filter((p) => p.id !== createdProduct!.id)];
    persistProducts(nextProducts);
    set({ products: nextProducts });

    return createdProduct;
  },

  updateProduct: async (id: number, input: Partial<ProductInput>): Promise<void> => {
    if (isSupabaseConfigured()) {
      try {
        const updates: Record<string, unknown> = {};
        if (input.name !== undefined) {
          updates.name = input.name;
          updates.slug = `${slugify(input.name)}-${Date.now().toString(36)}`;
        }
        if (input.price !== undefined) updates.price = input.price;
        if (input.originalPrice !== undefined) updates.original_price = input.originalPrice;
        if (input.category !== undefined) {
          updates.category = UI_CATEGORY_TO_DB[input.category.toLowerCase()] || 'mice';
        }
        if (input.segment !== undefined) updates.segment = input.segment;
        if (input.stockQuantity !== undefined) updates.stock = input.stockQuantity;
        if (input.specs !== undefined) updates.specs = input.specs;
        if (input.desc !== undefined) updates.description = input.desc;
        if (input.images !== undefined) {
          updates.images = input.images;
          updates.image_url = input.images[0] || '';
        }
        if (input.isFlashSale !== undefined) updates.is_flash_sale = input.isFlashSale;

        if (Object.keys(updates).length > 0) {
          const { error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id);

          if (error) {
            console.error('[TechGear] Lỗi cập nhật sản phẩm trên Supabase:', error.message);
          } else {
            console.log('[TechGear] Đã cập nhật sản phẩm trên Supabase thành công! ID:', id);
          }
        }
      } catch (err) {
        console.error('[TechGear] Ngoại lệ khi cập nhật sản phẩm trên Supabase:', err);
      }
    }

    const nextProducts = get().products.map((p) => {
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
    set({ products: nextProducts });
  },

  restockProducts: async (items: Array<{ productId: number; quantity: number }>): Promise<void> => {
    for (const item of items) {
      const prod = get().products.find((p) => p.id === item.productId);
      if (prod) {
        const nextStock = prod.stockQuantity + item.quantity;
        await get().updateProduct(item.productId, { stockQuantity: nextStock });
      }
    }
  },

  deleteProduct: async (id: number): Promise<void> => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('[TechGear] Lỗi xóa sản phẩm trên Supabase:', error.message);
        } else {
          console.log('[TechGear] Đã xóa sản phẩm trên Supabase thành công! ID:', id);
        }
      } catch (err) {
        console.error('[TechGear] Ngoại lệ khi xóa sản phẩm trên Supabase:', err);
      }
    }

    const nextProducts = get().products.filter((p) => p.id !== id);
    persistProducts(nextProducts);
    set({ products: nextProducts });
  },

  resetProducts: () => {
    const defaults = getDefaultProducts();
    persistProducts(defaults);
    set({ products: defaults });
  },
}));
