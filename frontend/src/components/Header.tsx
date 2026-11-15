import { useState, useRef, useEffect, useMemo, type FormEvent } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router';

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

export interface HeaderProps {
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean | ((prev: boolean) => boolean)) => void;
}

export default function Header({
  isMobileMenuOpen = false,
  setIsMobileMenuOpen,
}: HeaderProps) {
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
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const productMenuRef = useRef<HTMLLIElement>(null);

  const allProducts = useProductStore((state) => state.products);
  const fetchProducts = useProductStore((state) => state.fetchProducts);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Auto close menus when route changes
  useEffect(() => {
    setIsProductMenuOpen(false);
    setIsCartHovered(false);
    setIsSearchOpen(false);
    setIsAccountOpen(false);
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [location.pathname, location.search, setIsMobileMenuOpen]);

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

  const toggleMobileNav = () => {
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen((prev) => !prev);
    }
  };

  return (
    <header className="wolf-master-header flex flex-col w-full sticky top-0 z-50">
      {/* 1. HÀNG 1: TOP BAR KHUYẾN MÃI (z-10) */}
      <div className="wolf-topbar relative z-10">
        <div className="container topbar-content">
          <div className="topbar-items">
            <span className="topbar-badge">ƯU ĐÃI</span>
            <span className="topbar-line">
              ✨ <strong>GIẢM 10%</strong> đơn đầu tiên • <strong>VOUCHER 200K</strong> Gaming Gear • <strong>FREESHIP</strong> từ 500k
            </span>
          </div>
          <Link to="/promotions" className="topbar-cta">
            Khám phá ngay →
          </Link>
        </div>
      </div>

      {/* 2. HÀNG 2: MAIN HEADER CHỨA LOGO, TÌM KIẾM, HOTLINE, TÀI KHOẢN, GIỎ HÀNG (relative z-50) */}
      <div className="wolf-midbar relative z-50">
        <div className="container midbar-container">
          {/* Mobile hamburger */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={toggleMobileNav}
            aria-label="Mở menu điều hướng"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Brand Logo */}
          <Link to="/" className="wolf-brand" aria-label="TechGear Store - Trang chủ">
            <div className="brand-icon-box">
              <img src="/images/logo-transparent.png" alt="TechGear Logo" className="brand-logo-img" />
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
                placeholder="Tìm bàn phím cơ, chuột, màn hình..."
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

            {/* Smart Search Dropdown (z-[60]) */}
            {isSearchOpen && (
              <div className="smart-search-dropdown shadow-lg z-[60]">
                {liveResults.length > 0 ? (
                  <div className="live-search-results">
                    <div className="search-section-label">Sản phẩm gợi ý</div>
                    <div className="search-items-list">
                      {liveResults.map((p) => (
                        <Link
                          key={p.id}
                          to={`/products/${p.id}`}
                          className="search-item-row"
                          onClick={() => setIsSearchOpen(false)}
                        >
                          <img src={getProductPrimaryImage(p)} alt={p.name} className="search-item-thumb" />
                          <div className="search-item-meta">
                            <span className="search-item-name">{p.name}</span>
                            <div className="search-item-prices">
                              <span className="search-item-price">{formatPrice(p.price)}</span>
                              {p.originalPrice && (
                                <del className="search-item-original">{formatPrice(p.originalPrice)}</del>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : searchQuery.trim() ? (
                  <div className="search-no-result">
                    Không tìm thấy sản phẩm nào khớp với "<strong>{searchQuery}</strong>"
                  </div>
                ) : null}

                <div className="search-trending-section">
                  <div className="search-section-label">🔥 Từ khóa tìm kiếm phổ biến</div>
                  <div className="trending-tags">
                    {trendingKeywords.map((kw) => (
                      <button
                        key={kw}
                        type="button"
                        className="trending-tag-btn"
                        onClick={() => handleKeywordClick(kw)}
                      >
                        {kw}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action cluster: Hotline, Account, Theme, Cart */}
          <div className="wolf-header-actions">
            {/* Hotline Desk */}
            <a href="tel:19006750" className="hotline-box" title="Hotline tư vấn kỹ thuật">
              <span className="hotline-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </span>
              <div
                className="hotline-info"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  lineHeight: '1.2',
                  minWidth: 0,
                }}
              >
                <div
                  className="hotline-num"
                  style={{
                    display: 'block',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    letterSpacing: '0.02em',
                    lineHeight: '1.2',
                    whiteSpace: 'nowrap',
                  }}
                >
                  1900 6750
                </div>
                <div
                  className="hotline-sub"
                  style={{
                    display: 'block',
                    fontSize: '0.68rem',
                    lineHeight: '1.1',
                    marginTop: '2px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Hỗ trợ 24/7
                </div>
              </div>
            </a>

            {/* Account Popover Trigger */}
            <div
              className="account-dropdown-wrapper"
              ref={accountRef}
              onMouseEnter={() => setIsAccountOpen(true)}
              onMouseLeave={() => setIsAccountOpen(false)}
            >
              <button
                type="button"
                className="action-icon-btn account-trigger-btn"
                onClick={() => setIsAccountOpen((prev) => !prev)}
                aria-label="Tài khoản người dùng"
              >
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1.5px solid var(--main-color)',
                      flexShrink: 0,
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : user ? (
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'var(--main-color)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
                <div
                  className="action-text-info"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    lineHeight: '1.15',
                    textAlign: 'left',
                    minWidth: 0,
                    gap: '1px',
                  }}
                >
                  <span
                    className="action-subtext"
                    style={{
                      display: 'block',
                      fontSize: '0.65rem',
                      fontWeight: 500,
                      lineHeight: '1.1',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user ? 'Tài khoản' : 'Xin chào'}
                  </span>
                  <span
                    className="action-maintext"
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      lineHeight: '1.25',
                      maxWidth: '130px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={user ? user.name : 'Đăng nhập'}
                  >
                    {user ? user.name : 'Đăng nhập'}
                  </span>
                </div>
              </button>

              {/* Account Menu Dropdown (z-[60]) */}
              {isAccountOpen && (
                <div className="account-popover shadow-lg z-[60]">
                  {user ? (
                    <div className="account-user-card">
                      <div className="user-greeting">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.name}
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '2px solid var(--main-color)',
                                flexShrink: 0,
                              }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '50%',
                                background: 'var(--main-color)',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '14px',
                                flexShrink: 0,
                              }}
                            >
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div style={{ overflow: 'hidden' }}>
                            <strong style={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {user.name}
                            </strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {user.email}
                            </span>
                          </div>
                        </div>
                        <span className="user-badge" style={{ marginTop: '8px', display: 'inline-block' }}>
                          {user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                        </span>
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
                          to="/profile"
                          className="account-popover-item"
                          onClick={() => setIsAccountOpen(false)}
                        >
                          👤 Hồ sơ & Địa chỉ của tôi
                        </Link>
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

              {/* Mini Cart Dropdown (z-[60]) */}
              {isCartHovered && (
                <div className="mini-cart-popover shadow-lg z-[60]">
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
      </div>

      {/* 3. HÀNG 3: THANH ĐIỀU HƯỚNG DANH MỤC (relative z-30) */}
      <nav className={`wolf-bottombar relative z-30 ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="container bottombar-container">
          <ul className="nav-menu-list">
            <li className="nav-menu-item">
              <NavLink
                to="/"
                end
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
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
                          if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
                        }}
                      >
                        ⚡ Tất cả sản phẩm
                      </Link>
                      <Link
                        to="/products?category=Bàn phím"
                        onClick={() => {
                          setIsProductMenuOpen(false);
                          if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
                        }}
                      >
                        ⌨️ Bàn phím cơ Custom
                      </Link>
                      <Link
                        to="/products?category=Chuột"
                        onClick={() => {
                          setIsProductMenuOpen(false);
                          if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
                        }}
                      >
                        🖱️ Chuột công thái học & Esports
                      </Link>
                      <Link
                        to="/products?category=Màn hình"
                        onClick={() => {
                          setIsProductMenuOpen(false);
                          if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
                        }}
                      >
                        🖥️ Màn hình đồ họa IPS
                      </Link>
                      <Link
                        to="/products?category=Tai nghe"
                        onClick={() => {
                          setIsProductMenuOpen(false);
                          if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
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
                          if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
                        }}
                      >
                        🎮 Gaming Gear Esports
                      </Link>
                      <Link
                        to="/products?segment=office"
                        onClick={() => {
                          setIsProductMenuOpen(false);
                          if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
                        }}
                      >
                        💼 Thiết bị văn phòng & Ergonomic
                      </Link>

                      <strong className="dropdown-heading" style={{ marginTop: '10px' }}>
                        Bộ sưu tập nổi bật
                      </strong>
                      <Link
                        to="/products?segment=office"
                        onClick={() => {
                          setIsProductMenuOpen(false);
                          if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
                        }}
                      >
                        🌟 Góc làm việc tối giản Minimalist
                      </Link>
                      <Link
                        to="/products?category=Chuột"
                        onClick={() => {
                          setIsProductMenuOpen(false);
                          if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
                        }}
                      >
                        🚀 Setup không dây Wireless Pro
                      </Link>
                    </div>

                    <div className="dropdown-col promo-col">
                      <div className="menu-promo-box">
                        <span className="promo-badge">HOT DEAL TUẦN NÀY</span>
                        <h4>Giảm 25% Keychron K2 Pro</h4>
                        <p>Tặng kèm cáp custom và bộ lube switch</p>
                        <Link
                          to="/products/2"
                          className="menu-promo-link"
                          onClick={() => {
                            setIsProductMenuOpen(false);
                            if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
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
                onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
              >
                Phần mềm
              </NavLink>
            </li>

            {/* News Page Link */}
            <li className="nav-menu-item">
              <NavLink
                to="/news"
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
              >
                Tin tức
              </NavLink>
            </li>

            {/* Flash Sale Link */}
            <li className="nav-menu-item flash-nav">
              <a
                href="/#flash-sale"
                className="flash-link"
                onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
              >
                ⚡ Flash Sale
              </a>
            </li>

            {/* Store Info Link */}
            <li className="nav-menu-item">
              <Link
                to="/stores"
                onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
              >
                Hệ thống cửa hàng
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
