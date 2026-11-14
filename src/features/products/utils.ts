import { MOCK_PRODUCTS } from './mock-data';
import type { Product } from './types';

const MOCK_PRODUCTS_BY_ID = new Map<number, Product>(
  MOCK_PRODUCTS.map((product) => [product.id, product]),
);

const LEGACY_PLACEHOLDER_HOST = 'images.unsplash.com';

export const getProductPrimaryImage = (product: Pick<Product, 'images'>): string =>
  product.images[0] ?? '';

export const getMockProductImages = (productId: number): string[] => {
  const matched = MOCK_PRODUCTS_BY_ID.get(productId);
  return matched ? [...matched.images] : [];
};

const extractValidImageList = (rawImages: unknown, rawLegacyImage: unknown): string[] => {
  if (Array.isArray(rawImages)) {
    const valid = rawImages
      .filter((entry): entry is string => typeof entry === 'string')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
    if (valid.length > 0) return valid;
  }

  if (typeof rawLegacyImage === 'string' && rawLegacyImage.trim().length > 0) {
    return [rawLegacyImage.trim()];
  }

  return [];
};

export const normalizeProductImages = (
  productId: number,
  rawImages: unknown,
  rawLegacyImage?: unknown,
): string[] => {
  const extracted = extractValidImageList(rawImages, rawLegacyImage);
  const catalogMatch = MOCK_PRODUCTS_BY_ID.get(productId);

  if (!catalogMatch) {
    return extracted;
  }

  const hasValidGallery = Array.isArray(rawImages) && extracted.length > 0;
  const usesLegacyPlaceholder = extracted.some((url) => url.includes(LEGACY_PLACEHOLDER_HOST));

  // Automatically upgrade built-in catalog items cached under legacy schema or wrong placeholder URLs.
  if (!hasValidGallery || usesLegacyPlaceholder) {
    return [...catalogMatch.images];
  }

  return extracted;
};

export const normalizeProductRecord = (item: unknown): Product | null => {
  if (!item || typeof item !== 'object') return null;

  const candidate = item as Record<string, unknown>;
  if (
    typeof candidate.id !== 'number' ||
    typeof candidate.name !== 'string' ||
    typeof candidate.category !== 'string' ||
    typeof candidate.price !== 'number'
  ) {
    return null;
  }

  const stock = typeof candidate.stockQuantity === 'number' ? candidate.stockQuantity : 10;
  const seg = candidate.segment;

  return {
    id: candidate.id,
    name: candidate.name,
    segment: seg === 'gaming' || seg === 'office' ? seg : 'gaming',
    category: candidate.category,
    price: candidate.price,
    originalPrice: typeof candidate.originalPrice === 'number' ? candidate.originalPrice : undefined,
    discountPercent: typeof candidate.discountPercent === 'number' ? candidate.discountPercent : undefined,
    images: normalizeProductImages(candidate.id, candidate.images, candidate.image),
    specs: typeof candidate.specs === 'string' ? candidate.specs : '',
    desc: typeof candidate.desc === 'string' ? candidate.desc : '',
    inStock: typeof candidate.inStock === 'boolean' ? candidate.inStock : stock > 0,
    stockQuantity: stock,
    rating: typeof candidate.rating === 'number' ? candidate.rating : 5,
    reviewCount: typeof candidate.reviewCount === 'number' ? candidate.reviewCount : 0,
    soldCount: typeof candidate.soldCount === 'number' ? candidate.soldCount : 0,
    isFlashSale: Boolean(candidate.isFlashSale),
    badge: typeof candidate.badge === 'string' ? candidate.badge : undefined,
    softwareId: typeof candidate.softwareId === 'string' ? candidate.softwareId : undefined,
  };
};

