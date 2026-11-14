import { useProductStore } from './store';
import type { Product } from './types';

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
