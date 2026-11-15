import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { MOCK_PRODUCTS } from './mock-data';
import { useProductStore } from './store';
import type { Product, ProductSegment } from './types';

export const DB_CATEGORY_TO_UI: Record<string, string> = {
  keyboards: 'Bàn phím',
  mice: 'Chuột',
  monitors: 'Màn hình',
  audio: 'Tai nghe',
};

export const UI_CATEGORY_TO_DB: Record<string, string> = {
  'bàn phím': 'keyboards',
  'chuột': 'mice',
  'màn hình': 'monitors',
  'tai nghe': 'audio',
};

export interface SupabaseProductRow {
  id: number;
  name: string;
  slug?: string | null;
  category: string;
  segment: string;
  price: number;
  original_price?: number | null;
  rating?: number | null;
  reviews_count?: number | null;
  sold_count?: number | null;
  specs?: string | null;
  description?: string | null;
  stock?: number | null;
  image_url: string;
  images?: string[] | null;
  is_flash_sale?: boolean | null;
  created_at?: string | null;
}

export function mapSupabaseRowToProduct(row: SupabaseProductRow): Product {
  const categoryUI = DB_CATEGORY_TO_UI[row.category.toLowerCase()] || row.category;
  const segment: ProductSegment = row.segment === 'gaming' ? 'gaming' : 'office';
  const price = Number(row.price);
  const originalPrice = row.original_price ? Number(row.original_price) : undefined;
  const discountPercent =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : undefined;

  let imageList: string[] = [];
  if (Array.isArray(row.images) && row.images.length > 0) {
    imageList = row.images.filter((img): img is string => typeof img === 'string' && img.trim().length > 0);
  }
  if (imageList.length === 0 && row.image_url) {
    imageList = [row.image_url];
  }

  const stock = typeof row.stock === 'number' ? row.stock : 50;

  return {
    id: Number(row.id),
    name: row.name,
    segment,
    category: categoryUI,
    price,
    originalPrice,
    discountPercent,
    images: imageList,
    specs: row.specs || '',
    desc: row.description || '',
    inStock: stock > 0,
    stockQuantity: stock,
    rating: typeof row.rating === 'number' ? row.rating : 5.0,
    reviewCount: typeof row.reviews_count === 'number' ? row.reviews_count : 0,
    soldCount: typeof row.sold_count === 'number' ? row.sold_count : 0,
    isFlashSale: Boolean(row.is_flash_sale),
    badge: row.is_flash_sale ? 'Flash Sale' : (row.sold_count && row.sold_count > 100 ? 'Bán chạy' : null),
  };
}

export async function fetchProductsFromSupabase(): Promise<{
  data: Product[];
  source: 'supabase' | 'fallback';
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return { data: MOCK_PRODUCTS, source: 'fallback' };
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn('[TechGear Supabase] Lỗi tải sản phẩm (fallback mock data):', error.message);
      return { data: MOCK_PRODUCTS, source: 'fallback', error: error.message };
    }

    if (!data || data.length === 0) {
      console.warn('[TechGear Supabase] Bảng products trống, sử dụng mock data.');
      return { data: MOCK_PRODUCTS, source: 'fallback' };
    }

    const mapped = (data as SupabaseProductRow[]).map(mapSupabaseRowToProduct);
    return { data: mapped, source: 'supabase' };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[TechGear Supabase] Lỗi kết nối Supabase (fallback mock data):', message);
    return { data: MOCK_PRODUCTS, source: 'fallback', error: message };
  }
}

export async function fetchProductByIdFromSupabase(id: number): Promise<Product | undefined> {
  if (!isSupabaseConfigured()) {
    return MOCK_PRODUCTS.find((p) => p.id === id);
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      return MOCK_PRODUCTS.find((p) => p.id === id);
    }

    return mapSupabaseRowToProduct(data as SupabaseProductRow);
  } catch {
    return MOCK_PRODUCTS.find((p) => p.id === id);
  }
}

export function listProducts(query?: string, category?: string): Product[] {
  const products = useProductStore.getState().products;
  const normalizedQuery = query?.trim().toLowerCase();
  const normalizedCategory = category?.trim().toLowerCase();

  return products.filter((product) => {
    const matchesQuery =
      !normalizedQuery ||
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.category.toLowerCase().includes(normalizedQuery);
    const matchesCategory =
      !normalizedCategory ||
      normalizedCategory === 'tất cả' ||
      product.category.toLowerCase() === normalizedCategory;

    return matchesQuery && matchesCategory;
  });
}

export function getProductById(id: number): Product | undefined {
  return useProductStore.getState().products.find((product) => product.id === id);
}
