import { useState, useRef, useEffect, useMemo, type FormEvent } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router';

import { useTheme } from '../app/theme-context';
import { useAuthStore } from '../features/auth/store';
import { useCartStore } from '../features/cart/store';
import { useProductStore } from '../features/products/store';
import { getProductPrimaryImage } from '../features/products/utils';

const formatPrice = (price: number) => `${price.toLocaleString('vi-VN')} đ`;

const trendingKeywords = [
  'Chuột Logitech',
  'Bàn phím cơ',
  'Màn hình 4K',
  'Tai nghe chống ồn',
  'NuPhy Air75',
  'Keychron K2 Pro',
];

export default function RootLayout() {
  const { theme, toggleTheme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const cartItems = useCartStore((state) => state.items);
  const itemCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );
  const totalAmount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  );

  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isCartHovered, setIsCartHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const productMenuRef = useRef<HTMLLIElement>(null);

  const allProducts = useProductStore((state) => state.products);

  // Auto close menus when route changes
  useEffect(() => {
    setIsProductMenuOpen(false);
    setIsMobileMenuOpen(false);
    setIsCartHovered(false);
  }, [location.pathname, location.search]);

  // Back to top scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Live search products
  const liveResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.trim().toLowerCase();
    return allProducts
      .filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      .slice(0, 4);
  }, [searchQuery, allProducts]);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setIsAccountOpen(false);
      }
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        setIsCartHovered(false);
      }
      if (productMenuRef.current && !productMenuRef.current.contains(e.target as Node)) {
        setIsProductMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeywordClick = (keyword: string) => {
    setSearchQuery(keyword);
    setIsSearchOpen(false);
    navigate(`/products?q=${encodeURIComponent(keyword)}`);
  };

  return (
    <div className="app-shell wolf-theme">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="wolf-topbar">
        <div className="container topbar-content">
          <div className="topbar-items">
            <span className="topbar-badge">
              <span>ƯU ĐÃI</span>
              <span>ĐẶC BIỆT</span>
            </span>
            <div className="topbar-text">
              <span className="topbar-line">
                ✨ <strong>GIẢM NGAY 10%</strong> cho đơn hàng đầu tiên • <strong>VOUCHER 200K</strong> cho Gaming Gear
              </span>
              <span className="topbar-line">
                • <strong>MIỄN PHÍ GIAO HÀNG</strong> đơn từ 500k
              </span>
            </div>
          </div>
          <Link to="/products" className="topbar-cta">
            Khám phá ngay →
          </Link>
        </div>
      </div>

      {/* 2. MIDBAR / MAIN HEADER */}
      <header className="wolf-midbar">
        <div className="container midbar-container">
          {/* Mobile hamburger */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Mở menu điều hướng"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Brand Logo */}
          <Link to="/" className="wolf-brand">
            <div className="brand-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <div className="brand-text-box">
              <div className="brand-title">
                TECH<span>GEAR</span>
              </div>
              <span className="brand-tagline">ĐẲNG CẤP NGOẠI VI & GAMING</span>
            </div>
          </Link>

          {/* Smart Search Bar */}
          <div className="wolf-search-block" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="wolf-search-form">
              <span className="search-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                className="search-input"
                placeholder="Bạn cần tìm bàn phím cơ, chuột hay màn hình gì?..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                aria-label="Tìm kiếm sản phẩm"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Xóa từ khóa"
                >
                  ✕
                </button>
              )}
              <button type="submit" className="search-submit-btn">
                <span>Tìm kiếm</span>
              </button>
            </form>

            {/* Smart Search Popover */}
            {isSearchOpen && (
              <div className="smart-search-dropdown shadow-lg">
                {!searchQuery.trim() ? (
                  <div className="search-default-state">
                    <div className="search-section-label">Xu hướng tìm kiếm hôm nay</div>
                    <div className="trending-tags">
                      {trendingKeywords.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          className="trending-tag-btn"
                          onClick={() => handleKeywordClick(tag)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          </svg>
                          <span>{tag}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="search-live-state">
                    <div className="search-section-label">
                      Kết quả cho "{searchQuery}" ({liveResults.length})
                    </div>
                    {liveResults.length === 0 ? (
                      <p className="no-live-results">Không tìm thấy sản phẩm phù hợp.</p>
                    ) : (
                      <div className="live-results-list">
                        {liveResults.map((product) => (
                          <Link
                            key={product.id}
                            to={`/products/${product.id}`}
                            className="live-product-item"
                            onClick={() => setIsSearchOpen(false)}
                          >
                            <img src={getProductPrimaryImage(product)} alt={product.name} className="live-product-img" />
                            <div className="live-product-details">
                              <span className="live-product-name">{product.name}</span>
                              <div className="live-product-price">
                                <span className="price-val">{formatPrice(product.price)}</span>
                                {product.originalPrice && (
                                  <del className="price-old">{formatPrice(product.originalPrice)}</del>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                        <Link
                          to={`/products?q=${encodeURIComponent(searchQuery)}`}
                          className="view-all-search-btn"
                          onClick={() => setIsSearchOpen(false)}
                        >
                          Xem tất cả kết quả →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Header Block */}
          <div className="wolf-header-actions">
            {/* 24/7 Hotline Box */}
            <div className="hotline-box">
              <div className="hotline-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div className="hotline-info">
                <a href="tel:19006750" className="hotline-number">1900 6750</a>
                <span className="hotline-sub">Hỗ trợ 24/7</span>
              </div>
            </div>

            {/* Account Dropdown */}
            <div
              className="account-dropdown-wrapper"
              ref={accountRef}
              onMouseEnter={() => setIsAccountOpen(true)}
              onMouseLeave={() => setIsAccountOpen(false)}
            >
              <button
                type="button"
                className="action-icon-btn"
                onClick={() => setIsAccountOpen((prev) => !prev)}
                aria-label="Tài khoản cá nhân"
                aria-expanded={isAccountOpen}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <div className="action-text-info">
                  <span className="action-subtext">Xin chào</span>
                  <strong className="action-maintext">
                    {user ? user.name : 'Tài khoản'}
                  </strong>
                </div>
              </button>

              {isAccountOpen && (
                <div className="account-popover shadow-lg">
                  {user ? (
                    <div className="account-user-card">
                      <div className="user-greeting">
                        <strong>{user.name}</strong>
                        <span className="user-badge">{user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng VIP'}</span>
                      </div>
                      <div className="account-links-list">
                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            className="account-popover-item"
                            onClick={() => setIsAccountOpen(false)}
                          >
                            ⚙️ Quản trị cửa hàng (Dashboard)
                          </Link>
                        )}
                        <Link
                          to="/orders"
                          className="account-popover-item"
                          onClick={() => setIsAccountOpen(false)}
                        >
                          📋 Đơn hàng của tôi
                        </Link>
                        <Link
                          to="/cart"
                          className="account-popover-item"
                          onClick={() => setIsAccountOpen(false)}
                        >
                          📦 Giỏ hàng của tôi
                        </Link>
                        <Link
                          to="/logout"
                          className="account-popover-item logout"
                          onClick={() => setIsAccountOpen(false)}
                        >
                          🚪 Đăng xuất
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="account-guest-card">
                      <p className="guest-note">Đăng nhập để nhận ưu đãi thành viên TechGear</p>
                      <div className="account-guest-actions">
                        <Link
                          to="/login"
                          className="account-guest-btn primary"
                          onClick={() => setIsAccountOpen(false)}
                        >
                          Đăng nhập
                        </Link>
                        <Link
                          to="/login"
                          className="account-guest-btn secondary"
                          onClick={() => setIsAccountOpen(false)}
                        >
                          Đăng ký tài khoản
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              className="theme-toggle-btn"
              type="button"
              onClick={toggleTheme}
              title={`Chuyển sang chế độ ${theme === 'light' ? 'Tối' : 'Sáng'}`}
              aria-label="Đổi theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            {/* Shopping Cart Button with Mini-Cart Popover */}
            <div
              className="cart-dropdown-wrapper"
              ref={cartRef}
              onMouseEnter={() => setIsCartHovered(true)}
              onMouseLeave={() => setIsCartHovered(false)}
            >
              <Link
                to="/cart"
                className="wolf-cart-btn-compact"
                title="Giỏ hàng của bạn"
                aria-label="Giỏ hàng"
              >
                <div className="cart-icon-wrapper">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  {itemCount > 0 && <span className="cart-badge-count">{itemCount}</span>}
                </div>
              </Link>

              {/* Mini Cart Popover on Hover */}
              {isCartHovered && (
                <div className="mini-cart-popover shadow-lg">
                  <div className="mini-cart-header">
                    <strong>Giỏ hàng ({itemCount})</strong>
                    <Link
                      to="/cart"
                      className="mini-cart-view-all"
                      onClick={() => setIsCartHovered(false)}
                    >
                      Xem tất cả →
                    </Link>
                  </div>

                  {cartItems.length === 0 ? (
                    <div className="mini-cart-empty">
                      <span className="empty-cart-mini-icon">🛒</span>
                      <p>Giỏ hàng của bạn đang trống</p>
                      <Link
                        to="/products"
                        className="btn-wolf-primary small mt-2"
                        onClick={() => setIsCartHovered(false)}
                      >
                        Khám phá sản phẩm
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="mini-cart-items-list">
                        {cartItems.slice(0, 4).map(({ product, quantity }) => (
                          <div key={product.id} className="mini-cart-item">
                            <img src={getProductPrimaryImage(product)} alt={product.name} className="mini-cart-item-img" />
                            <div className="mini-cart-item-info">
                              <Link
                                to={`/products/${product.id}`}
                                className="mini-cart-item-title"
                                onClick={() => setIsCartHovered(false)}
                              >
                                {product.name}
                              </Link>
                              <div className="mini-cart-item-calc">
                                <span className="mini-cart-item-qty">x{quantity}</span>
                                <span className="mini-cart-item-price">{formatPrice(product.price)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {cartItems.length > 4 && (
                          <div className="mini-cart-more-hint">
                            + {cartItems.length - 4} sản phẩm khác trong giỏ
                          </div>
                        )}
                      </div>

                      <div className="mini-cart-footer">
                        <div className="mini-cart-total-row">
                          <span className="total-label">Tổng cộng:</span>
                          <strong className="total-val">{formatPrice(totalAmount)}</strong>
                        </div>
                        <div className="mini-cart-buttons-row">
                          <Link
                            to="/cart"
                            className="btn-mini-cart secondary"
                            onClick={() => setIsCartHovered(false)}
                          >
                            Xem giỏ
                          </Link>
                          <Link
                            to="/checkout"
                            className="btn-mini-cart primary"
                            onClick={() => setIsCartHovered(false)}
                          >
                            Thanh toán
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 3. BOTTOMBAR / HORIZONTAL NAVIGATION */}
      <nav className={`wolf-bottombar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="container bottombar-container">
          <ul className="nav-menu-list">
            <li className="nav-menu-item">
              <NavLink
                to="/"
                end
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Trang chủ
              </NavLink>
            </li>

            {/* Mega Dropdown: Sản phẩm */}
            <li
              ref={productMenuRef}
              className={`nav-menu-item has-dropdown ${isProductMenuOpen ? 'dropdown-active' : ''}`}
              onMouseEnter={() => setIsProductMenuOpen(true)}
              onMouseLeave={() => setIsProductMenuOpen(false)}
            >
              <button
                type="button"
                className={`nav-menu-btn ${isProductMenuOpen ? 'active' : ''} ${
                  location.pathname.startsWith('/products') ? 'page-active' : ''
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  setIsProductMenuOpen((prev) => !prev);
                }}
                aria-expanded={isProductMenuOpen}
                aria-label="Danh mục sản phẩm"
              >
                <span>Sản phẩm</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`chevron-icon ${isProductMenuOpen ? 'open' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isProductMenuOpen && (
                <div className="mega-dropdown shadow-lg">
                  <div className="dropdown-grid">
                    <div className="dropdown-col">
                      <strong className="dropdown-heading">Danh mục thiết bị</strong>
                      <Link
                        to="/products"
                        onClick={() => {
                          setIsProductMenuOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        ⚡ Tất cả sản phẩm
                      </Link>
                      <Link
                        to="/products?category=Bàn phím"
                        onClick={() => {
                          setIsProductMenuOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        ⌨️ Bàn phím cơ Custom
                      </Link>
                      <Link
                        to="/products?category=Chuột"
                        onClick={() => {
                          setIsProductMenuOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        🖱️ Chuột công thái học & Esports
                      </Link>
                      <Link
                        to="/products?category=Màn hình"
                        onClick={() => {
                          setIsProductMenuOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        🖥️ Màn hình đồ họa IPS
                      </Link>
                      <Link
                        to="/products?category=Tai nghe"
                        onClick={() => {
                          setIsProductMenuOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        🎧 Tai nghe chống ồn Hi-Fi
                      </Link>
                    </div>

                    <div className="dropdown-col">
                      <strong className="dropdown-heading">Phân khúc sản phẩm</strong>
                      <Link
                        to="/products?segment=gaming"
                        onClick={() => {
                          setIsProductMenuOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        🎮 Gaming Gear Esports
                      </Link>
                      <Link
                        to="/products?segment=office"
                        onClick={() => {
                          setIsProductMenuOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        💼 Thiết bị văn phòng & Ergonomic
                      </Link>

                      <strong className="dropdown-heading" style={{ marginTop: '10px' }}>
                        Bộ sưu tập nổi bật
                      </strong>
                      <Link
                        to="/products"
                        onClick={() => {
                          setIsProductMenuOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        🌟 Góc làm việc tối giản Minimalist
                      </Link>
                      <Link
                        to="/products"
                        onClick={() => {
                          setIsProductMenuOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        💼 Doanh nhân & Lập trình viên
                      </Link>
                    </div>

                    <div className="dropdown-col promo-col">
                      <div className="menu-promo-box">
                        <span className="promo-badge">HOT DEAL</span>
                        <h4>Giảm 25% Keychron K2 Pro</h4>
                        <p>Tặng kèm cáp custom và bộ lube switch</p>
                        <Link
                          to="/products/2"
                          className="menu-promo-link"
                          onClick={() => {
                            setIsProductMenuOpen(false);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          Mua ngay →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </li>

            {/* Software Page Link */}
            <li className="nav-menu-item">
              <NavLink
                to="/software"
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Phần mềm
              </NavLink>
            </li>

            {/* News Page Link */}
            <li className="nav-menu-item">
              <NavLink
                to="/news"
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Tin tức
              </NavLink>
            </li>

            {/* Flash Sale Link */}
            <li className="nav-menu-item flash-nav">
              <a
                href="/#flash-sale"
                className="flash-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ⚡ Flash Sale
              </a>
            </li>

            {/* Store Info Link */}
            <li className="nav-menu-item">
              <a
                href="#store-info"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Hệ thống cửa hàng
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* 4. MAIN PAGE CONTENT */}
      <main className="page-content">
        <Outlet />
      </main>

      {/* 5. WOLF FAN COMPREHENSIVE FOOTER */}
      <footer className="wolf-footer" id="store-info">
        <div className="container">
          <div className="footer-top py-5">
            <div className="footer-row">
              {/* Brand Col */}
              <div className="footer-col brand-col">
                <Link to="/" className="footer-logo">
                  <div className="brand-icon-box small">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 2 7 12 12 22 7 12 2" />
                      <polyline points="2 17 12 22 22 17" />
                      <polyline points="2 12 12 17 22 12" />
                    </svg>
                  </div>
                  <span className="footer-brand-title">TECH<span>GEAR</span></span>
                </Link>
                <p className="footer-desc">
                  TechGear mang đến những sản phẩm thiết bị ngoại vi và phụ kiện công nghệ chất lượng cao với thiết kế tinh xảo, giúp góc làm việc và giải trí của bạn luôn gọn gàng, tiện nghi và tràn đầy cảm hứng.
                </p>
                <div className="footer-social-links">
                  <a href="https://facebook.com" target="_blank" rel="noreferrer" title="Facebook" className="social-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noreferrer" title="YouTube" className="social-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#063a27" />
                    </svg>
                  </a>
                  <a href="https://tiktok.com" target="_blank" rel="noreferrer" title="TikTok" className="social-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Col 2: About us */}
              <div className="footer-col">
                <h4 className="footer-heading">Về chúng tôi</h4>
                <ul className="footer-links">
                  <li><Link to="/products">Giới thiệu TechGear</Link></li>
                  <li><Link to="/software">Phần mềm TechGear Hub</Link></li>
                  <li><Link to="/news">Tin tức & Đánh giá công nghệ</Link></li>
                  <li><Link to="/products">Chương trình khuyến mãi</Link></li>
                  <li><Link to="/products">Hệ thống showroom</Link></li>
                  <li><Link to="/products">Bán hàng doanh nghiệp</Link></li>
                </ul>
              </div>

              {/* Col 3: Policy */}
              <div className="footer-col">
                <h4 className="footer-heading">Chính sách cửa hàng</h4>
                <ul className="footer-links">
                  <li><Link to="/products">Chính sách bảo hành 24T</Link></li>
                  <li><Link to="/products">Chính sách vận chuyển siêu tốc</Link></li>
                  <li><Link to="/products">Chính sách đổi trả trong 30 ngày</Link></li>
                  <li><Link to="/products">Bảo mật thông tin khách hàng</Link></li>
                  <li><Link to="/products">Quy định và điều khoản</Link></li>
                  <li><Link to="/products">Chính sách thanh toán VietQR</Link></li>
                </ul>
              </div>

              {/* Col 4: Support */}
              <div className="footer-col contact-col">
                <h4 className="footer-heading">Hỗ trợ khách hàng</h4>
                <div className="contact-list">
                  <div className="contact-item">
                    <span className="contact-icon">📞</span>
                    <div>
                      <span>Tư vấn kỹ thuật 24/7:</span>
                      <strong>1900 6750</strong>
                    </div>
                  </div>
                  <div className="contact-item">
                    <span className="contact-icon">✉️</span>
                    <div>
                      <span>Email liên hệ:</span>
                      <strong>support@techgear.vn</strong>
                    </div>
                  </div>
                  <div className="contact-item">
                    <span className="contact-icon">📍</span>
                    <div>
                      <span>Showroom chính:</span>
                      <span>70 Lữ Gia, P. Phú Thọ, TP. Hồ Chí Minh</span>
                    </div>
                  </div>
                  <div className="contact-item">
                    <span className="contact-icon">🕒</span>
                    <div>
                      <span>Giờ làm việc:</span>
                      <span>Thứ 2 - Chủ nhật: 8:00 - 22:00</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Col 5: QR & Certification */}
              <div className="footer-col qr-col">
                <h4 className="footer-heading">Zalo Mini App</h4>
                <a
                  href="https://zalo.me/0335744258"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-qr-card"
                  title="Quét mã hoặc bấm để mở Zalo TechGear (0335744258)"
                >
                  <div className="qr-box-inner">
                    <img
                      src="/images/zalo-qr.jpg"
                      alt="Mã QR Zalo TechGear 0335744258"
                      className="footer-zalo-qr-img"
                    />
                  </div>
                  <div className="qr-desc">
                    Quét mã QR<br />để mua hàng<br />nhanh chóng
                  </div>
                </a>
                <div className="bo-cong-thuong-badge">
                  <span className="badge-bct">✓ ĐÃ ĐĂNG KÝ BỘ CÔNG THƯƠNG</span>
                  <p className="bct-note">Mã số DN: 0314314314 cấp bởi Sở KH&ĐT TP.HCM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Trust Bar */}
          <div className="footer-trust-divider" />
          <div className="footer-trust-strip">
            <div className="trust-strip-item">
              <span className="strip-icon">🚚</span>
              <div>
                <strong>FREESHIP TOÀN QUỐC</strong>
                <small>Đơn hàng từ 500k</small>
              </div>
            </div>
            <div className="trust-strip-item">
              <span className="strip-icon">🛡️</span>
              <div>
                <strong>BẢO HÀNH CHÍNH HÃNG</strong>
                <small>24 tháng tận nơi</small>
              </div>
            </div>
            <div className="trust-strip-item">
              <span className="strip-icon">🔄</span>
              <div>
                <strong>ĐỔI TRẢ DỄ DÀNG</strong>
                <small>Trong vòng 30 ngày</small>
              </div>
            </div>
            <div className="trust-strip-item">
              <span className="strip-icon">🎧</span>
              <div>
                <strong>HỖ TRỢ KỸ THUẬT</strong>
                <small>1900 6750 (24/7)</small>
              </div>
            </div>
            <div className="trust-strip-item">
              <span className="strip-icon">🔒</span>
              <div>
                <strong>THANH TOÁN AN TOÀN</strong>
                <small>Bảo mật tuyệt đối</small>
              </div>
            </div>
          </div>

          {/* Footer Bottom copyright */}
          <div className="footer-bottom py-4">
            <div className="copyright-text">
              © 2026 Bản quyền thuộc về <strong>TechGear Store</strong>. Giao diện thiết kế cao cấp theo phong cách Wolf Fan Sapo.
            </div>
            <div className="payment-badges-row">
              <span className="pay-pill">VietQR</span>
              <span className="pay-pill">MoMo</span>
              <span className="pay-pill">Visa / Master</span>
              <span className="pay-pill">Apple Pay</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Slide-in Drawer */}
      {isMobileMenuOpen && (
        <div
          className="mobile-drawer-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="mobile-drawer-panel shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="mobile-drawer-header">
              <Link to="/" className="mobile-drawer-logo" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="brand-icon-box small">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                </div>
                <div className="brand-title">TECH<span>GEAR</span></div>
              </Link>
              <button
                type="button"
                className="mobile-drawer-close-btn"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Đóng menu"
              >
                ✕
              </button>
            </div>

            {/* User status card in drawer */}
            <div className="mobile-drawer-user-card">
              {user ? (
                <div className="drawer-user-info">
                  <div className="user-avatar-circle">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <strong>{user.name}</strong>
                    <span className="user-role-badge">{user.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}</span>
                  </div>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="drawer-admin-pill" onClick={() => setIsMobileMenuOpen(false)}>
                      ⚙️ Quản trị
                    </Link>
                  )}
                </div>
              ) : (
                <div className="drawer-login-prompt">
                  <span>Chào mừng bạn đến TechGear!</span>
                  <Link to="/login" className="btn-wolf-primary full-width mt-2" onClick={() => setIsMobileMenuOpen(false)}>
                    Đăng nhập / Đăng ký
                  </Link>
                </div>
              )}
            </div>

            {/* Drawer Navigation List */}
            <nav className="mobile-drawer-nav">
              <NavLink
                to="/"
                end
                className={({ isActive }) => `drawer-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>🏠 Trang chủ</span>
              </NavLink>

              {/* Products Accordion */}
              <div className="drawer-accordion-block">
                <button
                  type="button"
                  className={`drawer-accordion-btn ${isMobileCategoryOpen ? 'expanded' : ''}`}
                  onClick={() => setIsMobileCategoryOpen(!isMobileCategoryOpen)}
                >
                  <span>📦 Sản phẩm</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`chevron-icon ${isMobileCategoryOpen ? 'open' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {isMobileCategoryOpen && (
                  <div className="drawer-subcategories-list">
                    <Link to="/products" onClick={() => setIsMobileMenuOpen(false)}>
                      ⚡ Tất cả sản phẩm
                    </Link>
                    <Link to="/products?segment=gaming" onClick={() => setIsMobileMenuOpen(false)}>
                      🎮 Gaming Gear Esports
                    </Link>
                    <Link to="/products?segment=office" onClick={() => setIsMobileMenuOpen(false)}>
                      💼 Thiết bị văn phòng
                    </Link>
                    <Link to="/products?category=Bàn phím" onClick={() => setIsMobileMenuOpen(false)}>
                      ⌨️ Bàn phím cơ Custom
                    </Link>
                    <Link to="/products?category=Chuột" onClick={() => setIsMobileMenuOpen(false)}>
                      🖱️ Chuột công thái học & Esports
                    </Link>
                    <Link to="/products?category=Màn hình" onClick={() => setIsMobileMenuOpen(false)}>
                      🖥️ Màn hình đồ họa IPS
                    </Link>
                    <Link to="/products?category=Tai nghe" onClick={() => setIsMobileMenuOpen(false)}>
                      🎧 Tai nghe chống ồn Hi-Fi
                    </Link>
                  </div>
                )}
              </div>

              <NavLink
                to="/software"
                className={({ isActive }) => `drawer-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>💻 Phần mềm TechGear Hub</span>
              </NavLink>

              <NavLink
                to="/news"
                className={({ isActive }) => `drawer-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>📰 Tin tức & Đánh giá</span>
              </NavLink>

              <a
                href="/#flash-sale"
                className="drawer-nav-item flash"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>⚡ Flash Sale hôm nay</span>
              </a>

              <a
                href="#store-info"
                className="drawer-nav-item"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>📍 Hệ thống cửa hàng</span>
              </a>
            </nav>

            {/* Drawer Footer Actions */}
            <div className="mobile-drawer-footer">
              <div className="drawer-hotline-box">
                <span>Tư vấn kỹ thuật:</span>
                <a href="tel:19006750">📞 1900 6750</a>
              </div>
              <div className="drawer-theme-row">
                <span>Giao diện:</span>
                <button
                  type="button"
                  className="theme-toggle-btn small"
                  onClick={toggleTheme}
                >
                  {theme === 'light' ? '🌙 Chế độ tối' : '☀️ Chế độ sáng'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Buttons (APShop, GearVN, MemoryZone style) */}
      <div className="floating-widgets-group">
        <a
          href="https://zalo.me/0335744258"
          target="_blank"
          rel="noreferrer"
          className="floating-widget-btn zalo-btn"
          title="Tư vấn Zalo 24/7: 0335744258"
        >
          <span className="widget-icon">💬</span>
          <span className="widget-label">Zalo</span>
        </a>
        <a
          href="tel:19006750"
          className="floating-widget-btn hotline-btn"
          title="Hotline: 1900 6750"
        >
          <span className="widget-icon">📞</span>
          <span className="widget-label">Hotline</span>
        </a>
        {showBackToTop && (
          <button
            type="button"
            className="floating-widget-btn top-btn"
            onClick={scrollToTop}
            aria-label="Cuộn lên đầu trang"
            title="Lên đầu trang"
          >
            <span className="widget-icon">↑</span>
          </button>
        )}
      </div>
    </div>
  );
}
