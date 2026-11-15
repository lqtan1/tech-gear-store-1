import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';

import { useTheme } from '../app/theme-context';
import { useAuthStore } from '../features/auth/store';
import Header from '../components/Header';
import ChatWidget from '../components/ChatWidget';

export default function RootLayout() {
  const { theme, toggleTheme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Auto close mobile drawer when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
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

  return (
    <div className="app-shell wolf-theme">
      {/* 1. HEADER (NATURAL VERTICAL FLEX FLOW & Z-INDEX HIERARCHY) */}
      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* 2. MAIN PAGE CONTENT */}
      <main className="page-content">
        <Outlet />
      </main>

      {/* 3. WOLF FAN COMPREHENSIVE FOOTER */}
      <footer className="wolf-footer" id="store-info">
        <div className="container">
          <div className="footer-top py-5">
            <div className="footer-row">
              {/* Brand Col */}
              <div className="footer-col brand-col">
                <Link to="/" className="footer-logo" aria-label="TechGear Store - Trang chủ">
                  <div className="brand-icon-box small">
                    <img src="/images/logo-transparent.png" alt="TechGear Logo" className="brand-logo-img" />
                  </div>
                  <span className="footer-brand-title">TECH<span>GEAR</span></span>
                </Link>
                <p className="footer-desc">
                  TechGear mang đến những sản phẩm thiết bị ngoại vi và phụ kiện công nghệ chất lượng cao với thiết kế tinh xảo, giúp góc làm việc và giải trí của bạn luôn gọn gàng, tiện nghi và tràn đầy cảm hứng.
                </p>
                <div className="footer-social-links">
                  <a href="https://facebook.com" target="_blank" rel="noreferrer" title="Facebook TechGear Store" className="social-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noreferrer" title="YouTube TechGear Store" className="social-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                    </svg>
                  </a>
                  <a href="https://tiktok.com" target="_blank" rel="noreferrer" title="TikTok TechGear Store" className="social-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                    </svg>
                  </a>
                </div>
                <div className="bo-cong-thuong-badge mt-3">
                  <span className="badge-bct">✓ ĐÃ ĐĂNG KÝ BỘ CÔNG THƯƠNG</span>
                </div>
              </div>

              {/* Col 2: About us */}
              <div className="footer-col">
                <h4 className="footer-heading">Về chúng tôi</h4>
                <ul className="footer-links">
                  <li><Link to="/about">Giới thiệu TechGear</Link></li>
                  <li><Link to="/software">Phần mềm TechGear Hub</Link></li>
                  <li><Link to="/news">Tin tức & Đánh giá công nghệ</Link></li>
                  <li><Link to="/promotions">Chương trình khuyến mãi</Link></li>
                  <li><Link to="/stores">Hệ thống showroom</Link></li>
                  <li><Link to="/b2b">Bán hàng doanh nghiệp</Link></li>
                </ul>
              </div>

              {/* Col 3: Policy */}
              <div className="footer-col">
                <h4 className="footer-heading">Chính sách cửa hàng</h4>
                <ul className="footer-links">
                  <li><Link to="/policy/bao-hanh">Chính sách bảo hành 24T</Link></li>
                  <li><Link to="/policy/van-chuyen">Chính sách vận chuyển siêu tốc</Link></li>
                  <li><Link to="/policy/doi-tra">Chính sách đổi trả trong 30 ngày</Link></li>
                  <li><Link to="/policy/bao-mat">Bảo mật thông tin khách hàng</Link></li>
                  <li><Link to="/policy/dieu-khoan">Quy định và điều khoản</Link></li>
                  <li><Link to="/policy/thanh-toan-vietqr">Chính sách thanh toán VietQR</Link></li>
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
            </div>
          </div>

          {/* Footer Bottom copyright */}
          <div className="footer-bottom py-4">
            <div className="copyright-text">
              © 2026 TechGear Store. All rights reserved.
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
                  <img src="/images/logo-transparent.png" alt="TechGear Logo" className="brand-logo-img" />
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
                    <div className="user-avatar-circle">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <strong>{user.name}</strong>
                    <span className="user-role-badge">{user.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                    <Link to="/profile" className="drawer-admin-pill" onClick={() => setIsMobileMenuOpen(false)}>
                      👤 Hồ sơ
                    </Link>
                    <Link to="/orders" className="drawer-admin-pill" onClick={() => setIsMobileMenuOpen(false)}>
                      📋 Đơn hàng
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="drawer-admin-pill" onClick={() => setIsMobileMenuOpen(false)}>
                        ⚙️ Quản trị
                      </Link>
                    )}
                  </div>
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

              <Link
                to="/stores"
                className="drawer-nav-item"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>📍 Hệ thống cửa hàng</span>
              </Link>
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

      {/* Floating Action Buttons - Tech Minimalist Compact */}
      <div className="floating-widgets-group" aria-label="Phím tắt hỗ trợ">
        {/* AI Sales Assistant Chat Widget */}
        <ChatWidget />

        <a
          href="https://zalo.me/0335744258"
          target="_blank"
          rel="noreferrer"
          className="floating-widget-btn zalo-fab"
          title="Tư vấn Zalo 24/7"
          aria-label="Tư vấn Zalo"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span className="fab-tooltip">Chat Zalo</span>
        </a>
        <a
          href="tel:19006750"
          className="floating-widget-btn hotline-fab"
          title="Hotline: 1900 6750"
          aria-label="Gọi hotline hỗ trợ"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span className="fab-tooltip">1900 6750</span>
        </a>
        {showBackToTop && (
          <button
            type="button"
            className="floating-widget-btn top-fab"
            onClick={scrollToTop}
            aria-label="Cuộn lên đầu trang"
            title="Lên đầu trang"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
            <span className="fab-tooltip">Lên đầu trang</span>
          </button>
        )}
      </div>
    </div>
  );
}
