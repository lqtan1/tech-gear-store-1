import { useState } from 'react';
import { Link } from 'react-router';

import TrustBar from '../components/TrustBar';
import { useCartStore } from '../features/cart/store';
import { getProductPrimaryImage } from '../features/products/utils';

const formatPrice = (price: number) => `${price.toLocaleString('vi-VN')} đ`;

const FREE_SHIPPING_THRESHOLD = 500000;

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const [voucherCode, setVoucherCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [voucherMessage, setVoucherMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const code = voucherCode.trim().toUpperCase();
    if (code === 'TECHGEAR200') {
      if (subtotal >= 1000000) {
        setDiscountAmount(200000);
        setVoucherMessage({ text: 'Áp dụng mã TECHGEAR200 thành công: Giảm 200.000 đ!', isError: false });
      } else {
        setVoucherMessage({ text: 'Mã TECHGEAR200 chỉ áp dụng cho đơn từ 1.000.000 đ', isError: true });
      }
    } else if (code === 'GIAM10') {
      const discount = Math.round(subtotal * 0.1);
      setDiscountAmount(discount);
      setVoucherMessage({ text: `Áp dụng mã GIAM10 thành công: Giảm ${formatPrice(discount)}!`, isError: false });
    } else {
      setVoucherMessage({ text: 'Mã giảm giá không hợp lệ hoặc đã hết lượt.', isError: true });
    }
  };

  const finalTotal = Math.max(0, subtotal - discountAmount);
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  if (items.length === 0) {
    return (
      <div className="cart-page-wolf">
        <div className="container">
          <div className="empty-cart-card shadow-sm">
            <div className="empty-cart-icon">🛒</div>
            <h2>Giỏ hàng của bạn đang trống</h2>
            <p>Hãy khám phá các thiết bị công nghệ và gaming gear đỉnh cao từ TechGear.</p>
            <Link to="/products" className="btn-wolf-primary mt-3">
              Khám phá sản phẩm ngay
            </Link>
          </div>
        </div>
        <TrustBar />
      </div>
    );
  }

  return (
    <div className="cart-page-wolf">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb-nav">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <strong>Giỏ hàng của bạn</strong>
        </div>

        {/* Free Shipping Progress Alert */}
        <div className="free-shipping-progress-box">
          <div className="progress-info">
            <span className="truck-icon">🚚</span>
            {subtotal >= FREE_SHIPPING_THRESHOLD ? (
              <span className="progress-text-success">
                Chúc mừng! Bạn đã đủ điều kiện được <strong>MIỄN PHÍ VẬN CHUYỂN TOÀN QUỐC</strong>.
              </span>
            ) : (
              <span className="progress-text">
                Mua thêm <strong>{formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)}</strong> để được <strong>MIỄN PHÍ VẬN CHUYỂN</strong>!
              </span>
            )}
          </div>
          <div className="progress-bar-track">
            <div
              className={`progress-bar-fill ${subtotal >= FREE_SHIPPING_THRESHOLD ? 'full' : ''}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Main Layout */}
        <div className="cart-main-grid">
          {/* Items Table List */}
          <div className="cart-items-column">
            <div className="cart-card-header">
              <h2>Sản phẩm trong giỏ ({items.length})</h2>
              <button
                type="button"
                className="clear-cart-link"
                onClick={clearCart}
              >
                Xóa toàn bộ
              </button>
            </div>

            <div className="cart-items-list">
              {items.map(({ product, quantity }) => (
                <div className="cart-item-row" key={product.id}>
                  <Link to={`/products/${product.id}`} className="item-thumbnail-link">
                    <img src={getProductPrimaryImage(product)} alt={product.name} className="item-thumbnail" />
                  </Link>

                  <div className="item-main-details">
                    <span className="item-category">{product.category}</span>
                    <h3 className="item-title">
                      <Link to={`/products/${product.id}`}>{product.name}</Link>
                    </h3>
                    <div className="item-price-unit">
                      <span className="unit-price">{formatPrice(product.price)}</span>
                      {product.originalPrice && (
                        <del className="unit-old-price">{formatPrice(product.originalPrice)}</del>
                      )}
                    </div>
                  </div>

                  <div className="item-qty-actions">
                    <div className="quantity-selector">
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        aria-label="Giảm"
                      >
                        −
                      </button>
                      <span>{quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        aria-label="Tăng"
                      >
                        +
                      </button>
                    </div>

                    <div className="item-subtotal">
                      {formatPrice(product.price * quantity)}
                    </div>

                    <button
                      type="button"
                      className="item-remove-btn"
                      onClick={() => removeItem(product.id)}
                      title="Xóa khỏi giỏ"
                      aria-label="Xóa"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer-nav">
              <Link to="/products" className="continue-shopping-link">
                ← Tiếp tục xem sản phẩm
              </Link>
            </div>
          </div>

          {/* Cart Summary & Voucher Column */}
          <div className="cart-summary-column">
            {/* Voucher Box */}
            <div className="cart-box voucher-box shadow-sm">
              <h3 className="box-title">Mã giảm giá / Voucher</h3>
              <form onSubmit={handleApplyVoucher} className="voucher-input-group">
                <input
                  type="text"
                  placeholder="Nhập TECHGEAR200 hoặc GIAM10"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  className="voucher-input"
                />
                <button type="submit" className="voucher-apply-btn">
                  Áp dụng
                </button>
              </form>
              {voucherMessage && (
                <p className={`voucher-msg ${voucherMessage.isError ? 'error' : 'success'}`}>
                  {voucherMessage.text}
                </p>
              )}
              <div className="voucher-hints">
                <span>Gợi ý mã:</span>
                <button
                  type="button"
                  className="hint-code"
                  onClick={() => setVoucherCode('TECHGEAR200')}
                >
                  TECHGEAR200 (-200k)
                </button>
                <button
                  type="button"
                  className="hint-code"
                  onClick={() => setVoucherCode('GIAM10')}
                >
                  GIAM10 (-10%)
                </button>
              </div>
            </div>

            {/* Order Summary Box */}
            <div className="cart-box summary-box shadow-sm">
              <h3 className="box-title">Tóm tắt đơn hàng</h3>

              <div className="summary-row">
                <span>Tạm tính ({items.length} món)</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>

              {discountAmount > 0 && (
                <div className="summary-row discount-row">
                  <span>Mã giảm giá</span>
                  <strong>-{formatPrice(discountAmount)}</strong>
                </div>
              )}

              <div className="summary-row">
                <span>Phí vận chuyển</span>
                <span className="free-shipping-tag">
                  {subtotal >= FREE_SHIPPING_THRESHOLD ? 'Miễn phí' : '30.000 đ'}
                </span>
              </div>

              <div className="summary-divider" />

              <div className="summary-row total-row">
                <span>Tổng thanh toán</span>
                <strong className="final-price">{formatPrice(finalTotal)}</strong>
              </div>
              <small className="vat-note">(Đã bao gồm VAT và bảo hành chính hãng 24 tháng)</small>

              <Link to="/checkout" className="btn-wolf-primary full-width mt-4">
                Tiến hành thanh toán →
              </Link>

              <div className="cart-trust-badges">
                <div className="trust-badge-item">🛡️ Bảo hành 24 tháng 1 đổi 1</div>
                <div className="trust-badge-item">🔒 Thanh toán VietQR bảo mật</div>
                <div className="trust-badge-item">📞 Hỗ trợ trực tuyến 24/7</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TrustBar />
    </div>
  );
}
