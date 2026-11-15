import { useState } from 'react';
import { Link } from 'react-router';

interface Voucher {
  code: string;
  title: string;
  discount: string;
  condition: string;
  expiry: string;
  badge: string;
}

const VOUCHERS: Voucher[] = [
  {
    code: 'TECHGEAR10',
    title: 'Giảm 10% Cho Đơn Hàng Đầu Tiên',
    discount: 'Giảm 10% (Tối đa 150.000đ)',
    condition: 'Áp dụng cho khách hàng mới mua đơn đầu tiên từ 500.000đ',
    expiry: 'Hạn dùng: 31/12/2026',
    badge: 'DÀNH CHO KHÁCH MỚI',
  },
  {
    code: 'GEAR200K',
    title: 'Voucher 200K Gaming Gear Cao Cấp',
    discount: 'Giảm trực tiếp 200.000đ',
    condition: 'Áp dụng cho các sản phẩm chuột, bàn phím cơ và tai nghe gaming từ 2.000.000đ',
    expiry: 'Hạn dùng: 31/12/2026',
    badge: 'GAMING GEAR DEAL',
  },
  {
    code: 'FREESHIP500',
    title: 'Miễn Phí Vận Chuyển Toàn Quốc',
    discount: 'Freeship 100% (Tối đa 40.000đ)',
    condition: 'Tự động áp dụng cho tất cả đơn hàng từ 500.000đ trên toàn quốc',
    expiry: 'Áp dụng liên tục',
    badge: 'FREESHIP TOÀN QUỐC',
  },
  {
    code: 'OFFICE50K',
    title: 'Voucher 50K Setup Công Thái Học',
    discount: 'Giảm trực tiếp 50.000đ',
    condition: 'Áp dụng cho dòng sản phẩm chuột công thái học & phụ kiện văn phòng từ 800.000đ',
    expiry: 'Hạn dùng: 31/12/2026',
    badge: 'ERGONOMIC PRO',
  },
];

export default function PromotionsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  return (
    <div className="promotions-page-wolf py-4">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb-nav mb-4">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <strong>Chương trình khuyến mãi & Mã giảm giá</strong>
        </div>

        {/* Hero Section */}
        <div className="promo-hero-header shadow-sm mb-5 text-center">
          <span className="promo-badge-hero">🔥 ƯU ĐÃI ĐẶC QUYỀN TECHGEAR</span>
          <h1 className="promo-title">Kho Voucher & Khuyến Mãi Độc Quyền 2026</h1>
          <p className="promo-subtitle">
            Nhập ngay các mã voucher dưới đây tại bước Thanh toán (Checkout) để nhận ưu đãi giảm giá và miễn phí vận chuyển siêu tốc từ TechGear Store.
          </p>
        </div>

        {/* Voucher Cards Grid */}
        <div className="vouchers-grid mb-5">
          {VOUCHERS.map((v) => (
            <div key={v.code} className="voucher-card shadow-sm">
              <div className="voucher-card-top">
                <span className="voucher-pill">{v.badge}</span>
                <span className="voucher-discount">{v.discount}</span>
              </div>
              <h3 className="voucher-title">{v.title}</h3>
              <p className="voucher-condition">📋 {v.condition}</p>
              <div className="voucher-bottom-row">
                <div className="voucher-code-box">
                  <span className="code-label">MÃ GIẢM:</span>
                  <strong className="code-text">{v.code}</strong>
                </div>
                <button
                  type="button"
                  className={`btn-copy-voucher ${copiedCode === v.code ? 'copied' : ''}`}
                  onClick={() => handleCopy(v.code)}
                >
                  {copiedCode === v.code ? '✓ Đã sao chép' : '📋 Sao chép mã'}
                </button>
              </div>
              <small className="voucher-expiry">{v.expiry}</small>
            </div>
          ))}
        </div>

        {/* Banner Section */}
        <div className="promo-banner-cta shadow-sm text-center py-5">
          <span className="promo-subheading">SẴN SÀNG NÂNG CẤP GÓC MÁY?</span>
          <h2 className="promo-banner-title">Áp dụng mã giảm giá ngay khi mua sắm</h2>
          <p className="promo-banner-desc">
            Hàng trăm mẫu chuột, bàn phím cơ custom, màn hình 4K và tai nghe chống ồn đang có giá cực ưu đãi.
          </p>
          <div className="promo-banner-actions">
            <Link to="/products" className="btn-wolf-primary">
              ⚡ Khám phá toàn bộ sản phẩm ngay
            </Link>
            <Link to="/cart" className="btn-wolf-secondary">
              🛒 Xem giỏ hàng của bạn
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
