import { Link } from 'react-router';
import type { Product } from '../features/products/types';
import { getProductPrimaryImage } from '../features/products/utils';
import { useCartStore } from '../features/cart/store';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  onAddToCartToast?: (productName: string) => void;
  showFlashSaleProgress?: boolean;
}

const formatPrice = (price: number) => `${price.toLocaleString('vi-VN')} đ`;

export default function ProductCard({
  product,
  onQuickView,
  onAddToCartToast,
  showFlashSaleProgress = false,
}: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    addItem(product);
    if (onAddToCartToast) {
      onAddToCartToast(product.name);
    }
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const discount =
    product.discountPercent ??
    (product.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null);

  // Short concise spec line (e.g. "Cảm biến MagSpeed 8.000 DPI • Không dây")
  const cleanSpec = product.specs
    ? product.specs
        .split(',')
        .slice(0, 2)
        .map((s) => s.trim())
        .join(' • ')
    : `${product.category} • ${product.segment === 'gaming' ? 'Gaming' : 'Công thái học'}`;

  return (
    <article className="wolf-product-card">
      {discount && discount > 0 && (
        <span className="badge-discount">-{discount}%</span>
      )}

      <div className="product-image-container">
        <Link to={`/products/${product.id}`} className="product-image-link">
          <img
            src={getProductPrimaryImage(product)}
            alt={product.name}
            loading="lazy"
            className="product-card-img"
          />
        </Link>
        <div className="product-overlay-actions">
          {onQuickView && (
            <button
              type="button"
              className="quickview-btn"
              onClick={handleQuickViewClick}
              title="Xem nhanh sản phẩm"
              style={{
                background: '#0f172a',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>Xem nhanh</span>
            </button>
          )}
        </div>
      </div>

      <div className="product-card-info">
        {cleanSpec && (
          <p className="product-spec-line" title={product.specs || cleanSpec}>
            {cleanSpec}
          </p>
        )}

        <h3 className="product-title">
          <Link to={`/products/${product.id}`} title={product.name}>
            {product.name}
          </Link>
        </h3>

        <div className="product-rating-row">
          <div className="rating-stars">
            {'★'.repeat(Math.round(product.rating ?? 5))}
          </div>
          <span className="rating-score">{product.rating ? product.rating.toFixed(1) : '5.0'}</span>
          <span className="review-count">({product.reviewCount ?? 42})</span>
        </div>

        <div className="product-price-row">
          <span className="price-current">{formatPrice(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <del className="price-original">{formatPrice(product.originalPrice)}</del>
          )}
        </div>

        {showFlashSaleProgress && (
          <div className="flash-progress-wrap">
            <div className="flash-progress-bar">
              <div
                className="flash-progress-fill"
                style={{ width: `${Math.min(95, ((product.soldCount ?? 20) / 30) * 100)}%` }}
              />
            </div>
            <span className="flash-sold-label">
              🔥 Đã bán {product.soldCount ?? 18} sản phẩm
            </span>
          </div>
        )}

        <div className="product-action-row">
          <button
            type="button"
            className="btn-add-cart"
            disabled={!product.inStock}
            onClick={handleAddToCart}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span>{product.inStock ? 'Thêm vào giỏ' : 'Hết hàng'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
