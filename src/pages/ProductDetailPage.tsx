import { useState, useMemo, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router';

import ProductCard from '../components/ProductCard';
import Toast from '../components/Toast';
import TrustBar from '../components/TrustBar';
import { useCartStore } from '../features/cart/store';
import { useProductStore } from '../features/products/store';

const formatPrice = (price: number) => `${price.toLocaleString('vi-VN')} đ`;

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const productId = Number(id);
  const products = useProductStore((state) => state.products);
  const product = Number.isInteger(productId) ? products.find((p) => p.id === productId) : undefined;
  const addItem = useCartStore((state) => state.addItem);

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'policy'>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [galleryState, setGalleryState] = useState<{ productId: number; index: number }>({
    productId: product?.id ?? 0,
    index: 0,
  });
  const thumbsTrackRef = useRef<HTMLDivElement | null>(null);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  }, [products, product]);

  if (!product) {
    return (
      <section className="container empty-state-wolf my-5">
        <div className="empty-icon">⚠️</div>
        <h1>Không tìm thấy sản phẩm</h1>
        <p>Sản phẩm không tồn tại hoặc đã ngừng kinh doanh.</p>
        <Link className="btn-wolf-primary mt-3" to="/products">
          Quay lại danh sách sản phẩm
        </Link>
      </section>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    setToastMessage(`${quantity}x ${product.name}`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    navigate('/cart');
  };

  const discount =
    product.discountPercent ??
    (product.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null);

  const galleryImages = product.images.filter((url) => url.trim().length > 0);
  const activeImageIndex =
    galleryState.productId === product.id &&
    galleryState.index >= 0 &&
    galleryState.index < galleryImages.length
      ? galleryState.index
      : 0;
  const activeImageUrl = galleryImages[activeImageIndex] ?? '';

  const selectGalleryImage = (index: number) => {
    if (galleryImages.length === 0) return;
    const safeIndex = Math.max(0, Math.min(index, galleryImages.length - 1));
    setGalleryState({ productId: product.id, index: safeIndex });

    const track = thumbsTrackRef.current;
    const targetButton = track?.children.item(safeIndex);
    if (targetButton instanceof HTMLElement) {
      targetButton.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
    }
  };

  return (
    <div className="product-detail-page-wolf">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb-nav">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <Link to="/products">Sản phẩm</Link>
          <span>/</span>
          <Link to={`/products?category=${encodeURIComponent(product.category)}`}>
            {product.category}
          </Link>
          <span>/</span>
          <strong>{product.name}</strong>
        </div>

        {/* Product Detail Main Block */}
        <div className="product-detail-card shadow-sm">
          <div className="detail-media-col">
            <div className="detail-image-wrapper">
              <img
                src={activeImageUrl}
                alt={`${product.name} - ảnh ${activeImageIndex + 1}`}
                className="detail-main-img"
              />
              {discount && discount > 0 && (
                <span className="badge-discount-detail">-{discount}%</span>
              )}
              <span className="badge-warranty-detail">BẢO HÀNH 24 THÁNG</span>
              {galleryImages.length > 1 && (
                <span className="detail-image-counter">
                  {activeImageIndex + 1} / {galleryImages.length}
                </span>
              )}
            </div>

            {galleryImages.length > 0 && (
              <div className="detail-gallery-slider" role="region" aria-label="Thư viện ảnh sản phẩm">
                {galleryImages.length > 1 && (
                  <button
                    type="button"
                    className="detail-slider-arrow"
                    aria-label="Ảnh trước"
                    disabled={activeImageIndex === 0}
                    onClick={() => selectGalleryImage(activeImageIndex - 1)}
                  >
                    ‹
                  </button>
                )}
                <div className="detail-thumbnails-track" ref={thumbsTrackRef}>
                  {galleryImages.map((imgUrl, idx) => (
                    <button
                      key={`${product.id}-thumb-${idx}`}
                      type="button"
                      className={`detail-thumb-btn ${idx === activeImageIndex ? 'active' : ''}`}
                      onClick={() => selectGalleryImage(idx)}
                      aria-label={`Chọn ảnh ${idx + 1} của ${product.name}`}
                      aria-pressed={idx === activeImageIndex}
                    >
                      <img
                        src={imgUrl}
                        alt={`${product.name} góc nhìn ${idx + 1}`}
                        className="detail-thumb-img"
                      />
                    </button>
                  ))}
                </div>
                {galleryImages.length > 1 && (
                  <button
                    type="button"
                    className="detail-slider-arrow"
                    aria-label="Ảnh tiếp theo"
                    disabled={activeImageIndex === galleryImages.length - 1}
                    onClick={() => selectGalleryImage(activeImageIndex + 1)}
                  >
                    ›
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="detail-info-col">
            <div className="detail-category-row">
              <span className="product-category-tag">{product.category}</span>
              <span className={`detail-segment-pill ${product.segment}`}>
                {product.segment === 'gaming' ? '🎮 Gaming Gear' : '💼 Văn phòng & Công thái học'}
              </span>
            </div>
            <h1 className="detail-title">{product.name}</h1>

            <div className="product-rating-row mb-3">
              <div className="rating-stars">
                {'★'.repeat(Math.round(product.rating ?? 5))}
              </div>
              <span className="rating-score">{product.rating ? product.rating.toFixed(1) : '5.0'}</span>
              <span className="review-count">({product.reviewCount ?? 86} đánh giá chính hãng)</span>
              <span className="stock-status-pill in-stock">
                {product.inStock ? '✓ Còn hàng' : '✕ Tạm hết hàng'}
              </span>
            </div>

            <div className="detail-price-box">
              <span className="price-current large">{formatPrice(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <del className="price-original">{formatPrice(product.originalPrice)}</del>
                  <span className="saving-pill">
                    Tiết kiệm {formatPrice(product.originalPrice - product.price)}
                  </span>
                </>
              )}
            </div>

            <p className="detail-desc">{product.desc}</p>

            <div className="detail-specs-box">
              <h3 className="specs-heading">Thông số kỹ thuật nổi bật:</h3>
              <p className="specs-detail">{product.specs}</p>
            </div>

            {/* Software Driver Box */}
            {product.softwareId && (
              <div className="detail-software-banner">
                <span className="software-banner-icon">⚡</span>
                <div className="software-banner-info">
                  <strong>Tương thích phần mềm điều khiển & Driver chính thức</strong>
                  <p>Tùy biến LED RGB, độ nhạy DPI, gán phím Macro và cập nhật Firmware tại Trung tâm phần mềm.</p>
                </div>
                <Link to="/software" className="software-banner-btn">
                  Tải Driver →
                </Link>
              </div>
            )}

            {/* Store Perks */}
            <div className="detail-perks-grid">
              <div className="perk-box">
                <span className="perk-icon">🛡️</span>
                <div>
                  <strong>Bảo hành chính hãng 24 tháng</strong>
                  <small>1 đổi 1 tận nơi trong 30 ngày</small>
                </div>
              </div>
              <div className="perk-box">
                <span className="perk-icon">🚚</span>
                <div>
                  <strong>Miễn phí vận chuyển</strong>
                  <small>Áp dụng cho mọi đơn từ 500k</small>
                </div>
              </div>
              <div className="perk-box">
                <span className="perk-icon">⚡</span>
                <div>
                  <strong>Giao hàng siêu tốc 2H</strong>
                  <small>Khu vực nội thành Hà Nội & TP.HCM</small>
                </div>
              </div>
              <div className="perk-box">
                <span className="perk-icon">🎧</span>
                <div>
                  <strong>Hỗ trợ kỹ thuật 24/7</strong>
                  <small>Hotline trực ban 1900 6750</small>
                </div>
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="detail-actions-row">
              <div className="quantity-control-group">
                <label className="qty-label">Số lượng:</label>
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
              </div>

              <div className="cta-buttons-group">
                <button
                  type="button"
                  className="btn-add-cart-detail"
                  disabled={!product.inStock}
                  onClick={handleAddToCart}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  <span>Thêm vào giỏ</span>
                </button>

                <button
                  type="button"
                  className="btn-buy-now-detail"
                  disabled={!product.inStock}
                  onClick={handleBuyNow}
                >
                  Mua ngay
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Information Tabs (GearVN & Razer style) */}
        <div className="product-detail-tabs-section shadow-sm mt-4">
          <div className="detail-tabs-header">
            <button
              type="button"
              className={`detail-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📝 Đặc điểm nổi bật
            </button>
            <button
              type="button"
              className={`detail-tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
              onClick={() => setActiveTab('specs')}
            >
              ⚙️ Thông số kỹ thuật
            </button>
            <button
              type="button"
              className={`detail-tab-btn ${activeTab === 'policy' ? 'active' : ''}`}
              onClick={() => setActiveTab('policy')}
            >
              🛡️ Chính sách bảo hành & Đổi trả
            </button>
          </div>

          <div className="detail-tab-body">
            {activeTab === 'overview' && (
              <div className="tab-pane-overview">
                <h3>Trải nghiệm đỉnh cao với {product.name}</h3>
                <p>{product.desc}</p>
                <div className="overview-highlights-grid">
                  <div className="highlight-item">
                    <span className="h-icon">⚡</span>
                    <div>
                      <strong>Độ trễ siêu thấp</strong>
                      <small>Tối ưu hóa phản hồi chuyển động cho công việc và gaming</small>
                    </div>
                  </div>
                  <div className="highlight-item">
                    <span className="h-icon">🖐️</span>
                    <div>
                      <strong>Công thái học chuẩn xác</strong>
                      <small>Giảm áp lực cổ tay khi sử dụng thời gian dài liên tục</small>
                    </div>
                  </div>
                  <div className="highlight-item">
                    <span className="h-icon">🔋</span>
                    <div>
                      <strong>Thời lượng pin bền bỉ</strong>
                      <small>Sạc nhanh qua cổng USB-C thế hệ mới tiện lợi</small>
                    </div>
                  </div>
                  <div className="highlight-item">
                    <span className="h-icon">✨</span>
                    <div>
                      <strong>Hoàn thiện cao cấp</strong>
                      <small>Vật liệu bền bỉ chống bám vân tay và bụi bẩn</small>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="tab-pane-specs">
                <table className="specs-table">
                  <tbody>
                    <tr>
                      <td className="spec-label">Tên sản phẩm</td>
                      <td className="spec-val">{product.name}</td>
                    </tr>
                    <tr>
                      <td className="spec-label">Danh mục thiết bị</td>
                      <td className="spec-val">{product.category}</td>
                    </tr>
                    <tr>
                      <td className="spec-label">Thông số cốt lõi</td>
                      <td className="spec-val">{product.specs}</td>
                    </tr>
                    <tr>
                      <td className="spec-label">Tình trạng kho hàng</td>
                      <td className="spec-val">
                        {product.inStock ? `Còn hàng (Sẵn sàng giao ngay)` : 'Tạm hết hàng'}
                      </td>
                    </tr>
                    <tr>
                      <td className="spec-label">Bảo hành</td>
                      <td className="spec-val">24 tháng chính hãng (1 đổi 1 trong 30 ngày)</td>
                    </tr>
                    <tr>
                      <td className="spec-label">Phụ kiện đi kèm</td>
                      <td className="spec-val">Hộp đựng, cáp sạc USB-C bọc dù, USB receiver (nếu có), HDSD</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'policy' && (
              <div className="tab-pane-policy">
                <div className="policy-cards-grid">
                  <div className="policy-card">
                    <span className="pol-icon">🛡️</span>
                    <h4>Bảo hành chính hãng 24T</h4>
                    <p>Cam kết 100% sản phẩm phân phối chính hãng. Bảo hành điện tử theo số serial trên thân máy.</p>
                  </div>
                  <div className="policy-card">
                    <span className="pol-icon">🔄</span>
                    <h4>1 đổi 1 trong 30 ngày</h4>
                    <p>Đổi mới sản phẩm ngay lập tức nếu phát sinh lỗi từ nhà sản xuất trong vòng 30 ngày đầu tiên.</p>
                  </div>
                  <div className="policy-card">
                    <span className="pol-icon">🚚</span>
                    <h4>Giao hàng siêu tốc 2H</h4>
                    <p>Miễn phí giao hàng toàn quốc cho đơn từ 500k. Hỗ trợ giao 2 giờ tại nội thành Hà Nội & TP.HCM.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sticky Action Bar */}
        <div className="mobile-sticky-action-bar">
          <div className="sticky-bar-info">
            <span className="sticky-bar-price">{formatPrice(product.price)}</span>
            <small className="sticky-bar-status">{product.inStock ? 'Còn hàng' : 'Hết hàng'}</small>
          </div>
          <button
            type="button"
            className="btn-wolf-primary sticky-buy-btn"
            disabled={!product.inStock}
            onClick={handleAddToCart}
          >
            Thêm vào giỏ
          </button>
        </div>
        {relatedProducts.length > 0 && (
          <div className="related-products-section mt-5">
            <div className="section-head-between mb-4">
              <div>
                <span className="section-eyebrow">CÓ THỂ BẠN THÍCH</span>
                <h2 className="section-main-heading">Sản phẩm cùng danh mục</h2>
              </div>
              <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="link-view-all">
                Xem thêm {product.category} →
              </Link>
            </div>

            <div className="products-grid-wolf">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </div>
        )}
      </div>

      <TrustBar />
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
