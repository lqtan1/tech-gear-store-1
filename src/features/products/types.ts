export type ProductSegment = 'gaming' | 'office';

export interface Product {
  id: number;
  name: string;
  segment: ProductSegment;
  category: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  images: string[];
  specs: string;
  desc: string;
  inStock: boolean;
  stockQuantity: number;
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
  isFlashSale?: boolean;
  badge?: string | null;
  softwareId?: string;
}

export type ProductInput = Omit<Product, 'id'>;
