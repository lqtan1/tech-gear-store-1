import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';

import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import ProductQuickViewModal from '../components/ProductQuickViewModal';
import Toast from '../components/Toast';
import TrustBar from '../components/TrustBar';
import { useArticleStore } from '../features/news/store';
import { useProductStore } from '../features/products/store';
import type { Product } from '../features/products/types';
import { getMockProductImages } from '../features/products/utils';

const categoriesList = ['Tất cả', 'Bàn phím', 'Chuột', 'Màn hình', 'Tai nghe'];

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function HomePage() {
  const allProducts = useProductStore((state) => state.products);
  const isLoading = useProductStore((state) => state.isLoading);
  const { articles: allArticles, fetchArticles } = useArticleStore();

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const flashSaleProducts = useMemo(
    () => allProducts.filter((p) => p.isFlashSale || (p.discountPercent && p.discountPercent >= 18)),
    [allProducts],
  );

  const homeNews = useMemo(() => allArticles.slice(0, 3), [allArticles]);

  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [activeSegment, setActiveSegment] = useState<'all' | 'gaming' | 'office'>('all');
  const [selectedQuickViewProduct, setSelectedQuickViewProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real-time Countdown Timer (Days, Hours, Minutes, Seconds)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 3,
    hours: 14,
    minutes: 42,
    seconds: 58,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        }
        if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        }
        if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredProducts = useMemo(() => {
    let list = allProducts;
    if (activeSegment !== 'all') {
      list = list.filter((p) => p.segment === activeSegment);
    }
    if (activeCategory !== 'Tất cả') {
      list = list.filter(
        (p) => p.category.toLowerCase() === activeCategory.toLowerCase(),
      );
    }
    return list;
  }, [allProducts, activeCategory, activeSegment]);

  const handleQuickView = (product: Product) => {
    setSelectedQuickViewProduct(product);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 3500);
  };

  return (
    <div className="home-page-wolf">
      {/* 1. HERO SLIDER SECTION */}
      <section className="wolf-hero-section">
        <div className="container hero-container">
          <div className="hero-content-col">
            <div className="hero-badge-pill">
              <span className="sparkle-icon">✨</span>
              <span>BỘ SƯU TẬP GEAR 2026</span>
            </div>
            <h1 className="hero-main-title">
              Không Gian Công Nghệ<br />
              <span className="gradient-highlight">Tiện Nghi & Đỉnh Cao</span>
            </h1>
            <p className="hero-subtitle">
              Khám phá bộ sưu tập thiết bị ngoại vi chọn lọc: bàn phím cơ custom, chuột công thái học và màn hình chuyên nghiệp với độ chính xác tuyệt đối.
            </p>

            <div className="hero-cta-group">
              <Link to="/products" className="btn-wolf-primary">
                Khám phá ngay
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <a href="#flash-sale" className="btn-wolf-outline">
                ⚡ Săn Flash Sale
              </a>
            </div>

            <div className="hero-features-chips">
              <span className="feature-chip">✓ Hot-swap 5-pin Switch</span>
              <span className="feature-chip">✓ Cảm biến 30.000 DPI</span>
              <span className="feature-chip">✓ Chuẩn màu 100% sRGB</span>
              <span className="feature-chip">✓ Bảo hành 24T 1 đổi 1</span>
            </div>
          </div>

          <div className="hero-visual-col">
            <div className="hero-showcase-card">
              <div className="showcase-glow" />
              <img
                src={getMockProductImages(2)[0]}
                alt="Keychron K2 Pro"
                className="showcase-image"
              />
              <div className="showcase-floating-card">
                <span className="floating-badge">HOT TRENDING</span>
                <strong className="floating-title">Keychron K2 Pro QMK</strong>
                <span className="floating-price">2.290.000 đ</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FLASH SALE SECTION */}
      <section className="wolf-flash-sale-section" id="flash-sale">
        <div className="container">
          <div className="flash-sale-module shadow-sm">
            <div className="flash-sale-header">
              <div className="flash-sale-brand-info">
                <div className="flash-title-wrap">
                  <span className="flash-bolt-icon">⚡</span>
                  <h2 className="flash-heading">
                    FLASH <span>SALE</span>
                  </h2>
                </div>
                <p className="flash-subheading">DEAL CHỚP NHOÁNG – GIÁ CỰC SỐC</p>
                <span className="flash-tag-today">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  ƯU ĐÃI HÔM NAY
                </span>
              </div>

              <div className="flash-countdown-wrap">
                <span className="countdown-title">KẾT THÚC SAU</span>
                <div className="countdown-timer-boxes">
                  <div className="timer-box">
                    <span className="timer-value">{String(timeLeft.days).padStart(2, '0')}</span>
                    <span className="timer-unit">NGÀY</span>
                  </div>
                  <span className="timer-colon">:</span>
                  <div className="timer-box">
                    <span className="timer-value">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="timer-unit">GIỜ</span>
                  </div>
                  <span className="timer-colon">:</span>
                  <div className="timer-box">
                    <span className="timer-value">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="timer-unit">PHÚT</span>
                  </div>
                  <span className="timer-colon">:</span>
                  <div className="timer-box">
                    <span className="timer-value">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="timer-unit">GIÂY</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flash-sale-body">
              <div className="flash-products-grid">
                {isLoading && flashSaleProducts.length === 0
                  ? Array.from({ length: 4 }).map((_, idx) => (
                      <ProductCardSkeleton key={`flash-skel-${idx}`} />
                    ))
                  : flashSaleProducts.slice(0, 4).map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onQuickView={handleQuickView}
                        onAddToCartToast={showToast}
                        showFlashSaleProgress={true}
                      />
                    ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORY ICONS SECTION */}
      <section className="wolf-category-section">
        <div className="container">
          <div className="section-head-centered">
            <span className="section-eyebrow">DANH MỤC THIẾT BỊ</span>
            <h2 className="section-main-heading">Lựa chọn theo nhu cầu góc máy</h2>
            <p className="section-sub-desc">
              Từ làm việc văn phòng công thái học đến các trận đấu game Esports đỉnh cao
            </p>
          </div>

          <div className="category-icons-grid">
            <Link to="/products?segment=gaming" className="category-tile-card gaming-tile">
              <div className="cat-icon-circle">🎮</div>
              <strong className="cat-name">Gaming Gear</strong>
              <span className="cat-count">Esports Pro</span>
            </Link>

            <Link to="/products?segment=office" className="category-tile-card office-tile">
              <div className="cat-icon-circle">💼</div>
              <strong className="cat-name">Văn phòng Ergonomic</strong>
              <span className="cat-count">Công thái học</span>
            </Link>

            <Link to="/products?category=Bàn phím" className="category-tile-card">
              <div className="cat-icon-circle">⌨️</div>
              <strong className="cat-name">Bàn phím cơ Custom</strong>
              <span className="cat-count">{allProducts.filter((p) => p.category === 'Bàn phím').length} sản phẩm</span>
            </Link>

            <Link to="/products?category=Chuột" className="category-tile-card">
              <div className="cat-icon-circle">🖱️</div>
              <strong className="cat-name">Chuột công thái học</strong>
              <span className="cat-count">{allProducts.filter((p) => p.category === 'Chuột').length} sản phẩm</span>
            </Link>

            <Link to="/products?category=Màn hình" className="category-tile-card">
              <div className="cat-icon-circle">🖥️</div>
              <strong className="cat-name">Màn hình đồ họa</strong>
              <span className="cat-count">{allProducts.filter((p) => p.category === 'Màn hình').length} sản phẩm</span>
            </Link>

            <Link to="/products?category=Tai nghe" className="category-tile-card">
              <div className="cat-icon-circle">🎧</div>
              <strong className="cat-name">Tai nghe Hi-Fi</strong>
              <span className="cat-count">{allProducts.filter((p) => p.category === 'Tai nghe').length} sản phẩm</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. COLLECTION SHOWCASE */}
      <section className="wolf-collection-showcase">
        <div className="container">
          <div className="showcase-banner-card">
            <div className="showcase-content">
              <span className="showcase-badge">BỘ SƯU TẬP GÓC MÁY</span>
              <h2 className="showcase-title">
                Không Gian Tối Giản<br />
                <span className="gradient-highlight">Cho Năng Suất Tối Đa</span>
              </h2>
              <p className="showcase-desc">
                Sắp xếp bàn làm việc ngăn nắp với các thiết bị kết nối không dây đa thiết bị, phím cơ gõ êm mượt và màn hình hiển thị sắc nét chuẩn 4K.
              </p>
              <div className="showcase-specs-list">
                <div className="spec-item">
                  <span className="spec-bullet">✓</span>
                  <span>Kết nối đồng thời 3 thiết bị qua Bluetooth & 2.4GHz</span>
                </div>
                <div className="spec-item">
                  <span className="spec-bullet">✓</span>
                  <span>Thiết kế công thái học bảo vệ cổ tay và cột sống</span>
                </div>
                <div className="spec-item">
                  <span className="spec-bullet">✓</span>
                  <span>Thời lượng pin lên tới 70 ngày cho một lần sạc</span>
                </div>
              </div>
              <Link to="/products" className="btn-wolf-primary mt-4">
                Xem tất cả bộ sưu tập →
              </Link>
            </div>

            <div className="showcase-media">
              <img
                src={getMockProductImages(1)[0]}
                alt="Logitech MX Master 3S"
                className="showcase-main-img"
              />
              <div className="product-quick-tag">
                <small>Bán chạy nhất</small>
                <strong>Logitech MX Master 3S</strong>
                <span>1.890.000 đ</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURED CATEGORY TABS & PRODUCTS */}
      <section className="wolf-featured-products-section">
        <div className="container">
          <div className="section-head-between">
            <div>
              <span className="section-eyebrow">SẢN PHẨM NỔI BẬT</span>
              <h2 className="section-main-heading">Khám phá các thiết bị cao cấp</h2>
            </div>
            <Link to="/products" className="link-view-all">
              Xem tất cả sản phẩm
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>

          {/* Segment & Category Tabs */}
          <div className="home-segment-tabs-row" style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`segment-pill ${activeSegment === 'all' ? 'active' : ''}`}
              onClick={() => setActiveSegment('all')}
            >
              Tất cả phân khúc
            </button>
            <button
              type="button"
              className={`segment-pill gaming ${activeSegment === 'gaming' ? 'active' : ''}`}
              onClick={() => setActiveSegment('gaming')}
            >
              🎮 Gaming Gear Esports
            </button>
            <button
              type="button"
              className={`segment-pill office ${activeSegment === 'office' ? 'active' : ''}`}
              onClick={() => setActiveSegment('office')}
            >
              💼 Thiết bị văn phòng & Công thái học
            </button>
          </div>

          <div className="category-filter-tabs">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-tab-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="featured-products-grid">
            {isLoading && filteredProducts.length === 0
              ? Array.from({ length: 8 }).map((_, idx) => (
                  <ProductCardSkeleton key={`featured-skel-${idx}`} />
                ))
              : filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={handleQuickView}
                    onAddToCartToast={showToast}
                  />
                ))}
          </div>
        </div>
      </section>

      {/* 6. DUAL PROMO BANNERS */}
      <section className="wolf-dual-banners">
        <div className="container">
          <div className="banners-grid">
            <div className="promo-banner-card card-keyboard">
              <div className="banner-badge">COMBO TIẾT KIỆM</div>
              <h3 className="banner-title">Góc Máy Pro 2026</h3>
              <p className="banner-subtitle">
                Giảm thêm 15% khi mua kèm Bàn phím cơ & Chuột không dây
              </p>
              <Link to="/promotions" className="btn-banner-link">
                Nhận ưu đãi ngay →
              </Link>
            </div>

            <div className="promo-banner-card card-audio">
              <div className="banner-badge">ƯU ĐÃI ĐỘC QUYỀN</div>
              <h3 className="banner-title">Âm Thanh Đắm Chìm</h3>
              <p className="banner-subtitle">
                Tặng giá treo tai nghe kim loại cao cấp cho mọi đơn Sony WH-1000XM5
              </p>
              <Link to="/products/4" className="btn-banner-link">
                Khám phá ngay →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TECH NEWS & REVIEWS */}
      <section className="wolf-news-section" id="tech-news">
        <div className="container">
          <div className="section-head-between mb-4">
            <div>
              <span className="section-eyebrow">TIN TỨC CÔNG NGHỆ</span>
              <h2 className="section-main-heading">Cập nhật tin tức & đánh giá mới nhất</h2>
            </div>
            <Link to="/news" className="link-view-all">
              Xem tất cả bài viết →
            </Link>
          </div>

          <div className="news-cards-grid">
            {homeNews.map((article) => (
              <article key={article.id} className="news-card">
                <Link to={`/news/${article.slug || article.id}`} className="news-img-wrap">
                  <img
                    src={article.image_url || article.coverImage}
                    alt={article.title}
                    className="news-img"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/akko-5075b-plus-dracula-castle-001-1000x1000.webp';
                    }}
                  />
                  <span className="news-tag">{article.category}</span>
                </Link>
                <div className="news-body">
                  <span className="news-date">📅 {article.date || article.published_at}</span>
                  <h3 className="news-title">
                    <Link to={`/news/${article.slug || article.id}`}>{article.title}</Link>
                  </h3>
                  <p className="news-excerpt">{article.excerpt}</p>
                  <Link to={`/news/${article.slug || article.id}`} className="news-read-more">
                    Đọc tiếp →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 8. TRUST BAR (5 CAM KẾT VÀNG) */}
      <TrustBar />

      {/* Quick View Modal */}
      {selectedQuickViewProduct && (
        <ProductQuickViewModal
          product={selectedQuickViewProduct}
          onClose={() => setSelectedQuickViewProduct(null)}
          onSuccessToast={showToast}
        />
      )}

      {/* Toast Feedback */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
