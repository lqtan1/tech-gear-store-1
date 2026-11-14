import { useState } from 'react';
import { Link } from 'react-router';
import type { Product } from '../features/products/types';
import { getProductPrimaryImage } from '../features/products/utils';
import { useCartStore } from '../features/cart/store';

interface ProductQuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onSuccessToast?: (productName: string) => void;
}

const formatPrice = (price: number) => `${price.toLocaleString('vi-VN')} đ`;

export default function ProductQuickViewModal({
  product,
  onClose,
  onSuccessToast,
}: ProductQuickViewModalProps) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  if (!product) return null;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    if (onSuccessToast) {
      onSuccessToast(`${quantity}x ${product.name}`);
    }
    onClose();
  };

  const discount =
    product.discountPercent ??
    (product.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null);

  return (
    <div className="quickview-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="quickview-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="quickview-close-btn"
          onClick={onClose}
          aria-label="Đóng cửa sổ"
        >
          ✕
        </button>

        <div className="quickview-grid">
          <div className="quickview-media">
            <img src={getProductPrimaryImage(product)} alt={product.name} className="quickview-img" />
            {discount && discount > 0 && (
              <span className="badge-discount-modal">-{discount}%</span>
            )}
          </div>

          <div className="quickview-details">
            <div className="quickview-category-row" style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' }}>
              <span className="product-category-tag">{product.category}</span>
              <span className={`detail-segment-pill ${product.segment}`}>
                {product.segment === 'gaming' ? '🎮 Gaming Gear' : '💼 Văn phòng'}
              </span>
            </div>
            <h2 className="quickview-title">{product.name}</h2>

            <div className="product-rating-row">
              <div className="rating-stars">
                {'★'.repeat(Math.round(product.rating ?? 5))}
              </div>
              <span className="rating-score">{product.rating ? product.rating.toFixed(1) : '5.0'}</span>
              <span className="review-count">({product.reviewCount ?? 42} nhận xét)</span>
            </div>

            <div className="quickview-price-box">
              <span className="price-current large">{formatPrice(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <del className="price-original">{formatPrice(product.originalPrice)}</del>
              )}
            </div>

            <p className="quickview-desc">{product.desc}</p>

            <div className="quickview-specs-box">
              <strong className="specs-title">Thông số kỹ thuật:</strong>
              <p className="specs-content">{product.specs}</p>
            </div>

            <div className="quickview-perks">
              <div className="perk-item">✓ Bảo hành 24 tháng 1 đổi 1</div>
              <div className="perk-item">✓ Miễn phí giao hàng toàn quốc từ 500k</div>
              <div className="perk-item">✓ Đổi trả linh hoạt trong 30 ngày</div>
            </div>

            <div className="quickview-actions">
              <div className="quantity-selector">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className="btn-add-cart primary-lg"
                disabled={!product.inStock}
                onClick={handleAddToCart}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <span>{product.inStock ? 'Thêm vào giỏ hàng' : 'Hết hàng'}</span>
              </button>
            </div>

            <div className="quickview-footer-link">
              <Link to={`/products/${product.id}`} onClick={onClose}>
                Xem trang chi tiết sản phẩm →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
