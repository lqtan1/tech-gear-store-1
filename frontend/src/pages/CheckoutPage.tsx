import { useRef, useState, useEffect, useMemo, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';

import TrustBar from '../components/TrustBar';
import { useAuth } from '../app/AuthContext';
import { useAuthStore } from '../features/auth/store';
import { useCartStore } from '../features/cart/store';
import { useNotificationStore } from '../features/notifications/store';
import { useOrderStore } from '../features/orders/store';
import type { PaymentMethod, ShippingInformation } from '../features/orders/types';
import { getProductPrimaryImage } from '../features/products/utils';
import { getProvinces, getDistrictsByProvince } from '../data/vietnamLocations';

const formatPrice = (price: number) => `${price.toLocaleString('vi-VN')} đ`;

export default function CheckoutPage() {
  const { profile } = useAuth();
  const user = useAuthStore((state) => state.user);
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const createOrder = useOrderStore((state) => state.createOrder);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement | null>(null);

  const [submitted, setSubmitted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('vietqr');
  const [orderId, setOrderId] = useState('');

  // Administrative Address Dropdowns
  const provinces = useMemo(() => getProvinces(), []);
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Available districts for chosen city
  const availableDistricts = useMemo(() => {
    return getDistrictsByProvince(city);
  }, [city]);

  // Pre-fill from profile or user state
  useEffect(() => {
    const savedName = profile?.full_name || user?.name || '';
    const savedPhone = profile?.phone || user?.phone || '';
    const savedCity = profile?.city || user?.city || 'TP. Hồ Chí Minh';
    const savedDistrict = profile?.district || user?.district || '';
    const savedAddress = profile?.address || user?.address || '';

    if (savedName) setFullName(savedName);
    if (savedPhone) setPhone(savedPhone);
    if (savedCity) {
      setCity(savedCity);
      const districtsForCity = getDistrictsByProvince(savedCity);
      if (savedDistrict && districtsForCity.includes(savedDistrict)) {
        setDistrict(savedDistrict);
      } else if (districtsForCity.length > 0) {
        setDistrict(districtsForCity[0]);
      }
    }
    if (savedAddress) setAddressDetail(savedAddress);
  }, [profile, user]);

  // Sync preferred payment when profile loads
  useEffect(() => {
    const preferred = profile?.preferred_payment || user?.preferred_payment;
    if (preferred === 'cod' || preferred === 'vietqr') {
      setPaymentMethod(preferred);
    }
  }, [profile?.preferred_payment, user?.preferred_payment]);

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const transferNote = 'TECHGEAR THANH TOAN';
  const dynamicVietQrUrl = `https://img.vietqr.io/image/VCB-0161001693924-qr_only.png?amount=${total}&addInfo=${encodeURIComponent(transferNote)}`;

  const buildFullAddress = (): string => {
    const parts = [addressDetail.trim(), district, city].filter(Boolean);
    return parts.join(', ');
  };

  const readShippingFromForm = (useFallbackDefaults: boolean): ShippingInformation => {
    const formEl = formRef.current;
    const formData = formEl ? new FormData(formEl) : null;
    const resolvedName = fullName.trim() || String(formData?.get('name') ?? '').trim();
    const resolvedPhone = phone.trim() || String(formData?.get('phone') ?? '').trim();
    const resolvedAddress = buildFullAddress();
    const noteValue = String(formData?.get('note') ?? '').trim();

    return {
      name: resolvedName || (useFallbackDefaults ? user?.name || 'Khách hàng TechGear' : ''),
      phone: resolvedPhone || (useFallbackDefaults ? '0335744258' : ''),
      address:
        resolvedAddress || (useFallbackDefaults ? 'Thanh toán chuyển khoản nhanh VietQR - TechGear Store' : ''),
      note: noteValue.length > 0 ? noteValue : undefined,
    };
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const shipping = readShippingFromForm(false);
    const order = createOrder(items, shipping, paymentMethod, {
      status: 'pending',
      userId: user?.id,
      customerEmail: user?.email,
    });
    setOrderId(order.id);
    setSubmitted(true);
    clearCart();

    // 1. Notify Customer
    void addNotification({
      userId: user?.id,
      recipientRole: 'customer',
      title: `Đặt hàng thành công #${order.id}`,
      message: `Đơn hàng của bạn trị giá ${formatPrice(order.total)} đã được tạo và đang chờ xác nhận.`,
      type: 'order',
      link: '/orders',
    });

    // 2. Notify Admin
    void addNotification({
      recipientRole: 'admin',
      title: `Đơn hàng mới #${order.id}`,
      message: `Khách hàng ${shipping.name} vừa đặt đơn mới (${formatPrice(order.total)}).`,
      type: 'order',
      link: '/admin?tab=orders',
    });
  };

  const handleSimulateTransferSuccess = () => {
    if (items.length === 0) return;
    const shipping = readShippingFromForm(true);
    const order = createOrder(items, shipping, 'vietqr', {
      status: 'confirmed',
      userId: user?.id,
      customerEmail: user?.email,
    });
    clearCart();

    // Notify Customer
    void addNotification({
      userId: user?.id,
      recipientRole: 'customer',
      title: `Thanh toán VietQR thành công #${order.id}`,
      message: `Đơn hàng ${order.id} (${formatPrice(order.total)}) đã hoàn tất thanh toán và chuyển trạng thái Chờ giao hàng.`,
      type: 'order',
      link: '/orders',
    });

    // Notify Admin
    void addNotification({
      recipientRole: 'admin',
      title: `Đơn hàng đã thanh toán #${order.id}`,
      message: `Khách hàng ${shipping.name} đã quét mã VietQR thanh toán ${formatPrice(order.total)}.`,
      type: 'order',
      link: '/admin?tab=orders',
    });

    navigate('/orders', {
      state: {
        successBanner: `Thanh toán VietQR thành công! Đơn hàng ${order.id} (${formatPrice(order.total)}) đã được ghi nhận trạng thái "Đã thanh toán".`,
      },
    });
  };

  if (submitted) {
    return (
      <div className="checkout-page-wolf">
        <div className="container">
          <div className="order-success-card shadow-sm">
            <div className="success-icon-wrap">✓</div>
            <span className="success-eyebrow">ĐẶT HÀNG THÀNH CÔNG</span>
            <h1 className="success-title">Cảm ơn bạn đã tin tưởng TechGear!</h1>
            <p className="success-desc">
              Mã đơn hàng của bạn là <strong className="order-id-highlight">{orderId}</strong>.
              Đội ngũ kỹ thuật viên sẽ liên hệ xác nhận và giao hàng sớm nhất.
            </p>

            <div className="order-details-box">
              <div className="info-row">
                <span>Phương thức thanh toán:</span>
                <strong>{paymentMethod === 'vietqr' ? 'VietQR (Quét mã chuyển khoản)' : 'Thanh toán khi nhận hàng (COD)'}</strong>
              </div>
              <div className="info-row">
                <span>Trạng thái đơn hàng:</span>
                <span className="badge-status-pending">Chờ xử lý</span>
              </div>
              <div className="info-row">
                <span>Bảo hành:</span>
                <span>24 tháng chính hãng 1 đổi 1 tận nơi</span>
              </div>
            </div>

            <div className="success-actions">
              <Link className="btn-wolf-primary" to="/orders">
                Xem lịch sử đơn hàng
              </Link>
              <Link className="btn-wolf-outline" to="/products">
                Tiếp tục mua sắm
              </Link>
              <Link className="btn-wolf-secondary" to="/">
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>
        <TrustBar />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="checkout-page-wolf">
        <div className="container">
          <div className="empty-cart-card shadow-sm">
            <div className="empty-cart-icon">🛒</div>
            <h2>Chưa có sản phẩm nào để thanh toán</h2>
            <p>Vui lòng chọn sản phẩm vào giỏ hàng trước khi tiến hành thanh toán.</p>
            <Link className="btn-wolf-primary mt-3" to="/products">
              Đến trang sản phẩm
            </Link>
          </div>
        </div>
        <TrustBar />
      </div>
    );
  }

  return (
    <div className="checkout-page-wolf">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb-nav">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <Link to="/cart">Giỏ hàng</Link>
          <span>/</span>
          <strong>Thanh toán đơn hàng</strong>
        </div>

        <div className="checkout-layout-grid">
          {/* Left: Customer Info Form */}
          <form ref={formRef} className="checkout-form-card shadow-sm" onSubmit={handleSubmit}>
            <div className="form-section-title">
              <span className="section-step-num">1</span>
              <div>
                <h2>Thông tin nhận hàng</h2>
                <p>Vui lòng điền địa chỉ để nhận hàng nhanh nhất</p>
              </div>
            </div>

            <div className="form-fields-grid">
              <div className="form-group">
                <label htmlFor="checkout-name">Họ và tên người nhận *</label>
                <input
                  id="checkout-name"
                  required
                  name="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="wolf-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="checkout-phone">Số điện thoại liên hệ *</label>
                <input
                  id="checkout-phone"
                  required
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  minLength={9}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ví dụ: 0987654321"
                  className="wolf-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="checkout-city">Tỉnh / Thành phố *</label>
                <select
                  id="checkout-city"
                  required
                  name="city"
                  value={city}
                  onChange={(e) => {
                    const newCity = e.target.value;
                    setCity(newCity);
                    const newDistricts = getDistrictsByProvince(newCity);
                    setDistrict(newDistricts.length > 0 ? newDistricts[0] : '');
                  }}
                  className="wolf-input"
                >
                  <option value="">-- Chọn Tỉnh / Thành phố --</option>
                  {provinces.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="checkout-district">Quận / Huyện *</label>
                <select
                  id="checkout-district"
                  required
                  name="district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="wolf-input"
                  disabled={!city}
                >
                  <option value="">-- Chọn Quận / Huyện --</option>
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group full-width">
                <label htmlFor="checkout-address-detail">Địa chỉ chi tiết (Số nhà, tên đường, ngõ/xóm) *</label>
                <input
                  id="checkout-address-detail"
                  required
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                  placeholder="Ví dụ: 123 Nguyễn Thị Minh Khai, Phường Bến Nghé"
                  className="wolf-input"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="checkout-note">Ghi chú giao hàng (Tùy chọn)</label>
                <input
                  id="checkout-note"
                  name="note"
                  placeholder="Giao trong giờ hành chính, gọi trước khi đến..."
                  className="wolf-input"
                />
              </div>
            </div>

            <div className="form-section-title mt-4">
              <span className="section-step-num">2</span>
              <div>
                <h2>Phương thức thanh toán</h2>
                <p>Lựa chọn hình thức thanh toán an toàn, bảo mật</p>
              </div>
            </div>

            <div className="payment-methods-selector">
              <label className={`payment-option-card ${paymentMethod === 'vietqr' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'vietqr'}
                  onChange={() => setPaymentMethod('vietqr')}
                />
                <div className="option-content">
                  <div className="option-title-row">
                    <strong>Chuyển khoản VietQR tức thì (Khuyên dùng)</strong>
                    <span className="fast-badge">Nhanh & Tiện</span>
                  </div>
                  <p className="option-desc">
                    Quét mã QR qua ứng dụng ngân hàng hoặc ví điện tử (MoMo, ZaloPay). Miễn phí giao dịch.
                  </p>
                </div>
              </label>

              <label className={`payment-option-card ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                />
                <div className="option-content">
                  <div className="option-title-row">
                    <strong>Thanh toán tiền mặt khi nhận hàng (COD)</strong>
                  </div>
                  <p className="option-desc">
                    Kiểm tra hàng trước khi thanh toán. Đồng kiểm chính hãng cùng shipper.
                  </p>
                </div>
              </label>
            </div>

            <button className="btn-wolf-primary full-width mt-4 submit-order-btn" type="submit">
              Xác nhận đặt hàng ({formatPrice(total)})
            </button>
          </form>

          {/* Right: Order Summary & VietQR preview */}
          <aside className="checkout-summary-column">
            <div className="checkout-summary-box shadow-sm">
              <h3 className="summary-title">Đơn hàng của bạn ({items.length})</h3>

              <div className="checkout-items-list">
                {items.map(({ product, quantity }) => (
                  <div className="checkout-item-row" key={product.id}>
                    <img src={getProductPrimaryImage(product)} alt={product.name} className="checkout-item-img" />
                    <div className="checkout-item-details">
                      <h4 className="item-title">{product.name}</h4>
                      <div className="item-meta">
                        <span>Số lượng: {quantity}</span>
                        <strong className="item-subtotal">{formatPrice(product.price * quantity)}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="checkout-divider" />

              <div className="checkout-price-row">
                <span>Tạm tính</span>
                <strong>{formatPrice(total)}</strong>
              </div>
              <div className="checkout-price-row">
                <span>Vận chuyển toàn quốc</span>
                <span className="free-shipping-tag">Miễn phí</span>
              </div>

              <div className="checkout-divider" />

              <div className="checkout-price-row total-row">
                <span>Tổng cộng</span>
                <strong className="checkout-total-val">{formatPrice(total)}</strong>
              </div>
            </div>

            {/* VietQR Panel */}
            {paymentMethod === 'vietqr' && (
              <div className="vietqr-box shadow-sm">
                <div className="qr-header">
                  <span className="qr-tag">VIETQR PRO</span>
                  <h4>Mã QR thanh toán đơn hàng</h4>
                </div>
                <div className="qr-code-mockup">
                  <div className="qr-image-frame">
                    <img
                      key={dynamicVietQrUrl}
                      src={dynamicVietQrUrl}
                      alt="Mã QR thanh toán Vietcombank LE QUANG TAN"
                      className="real-qr-img"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = '/images/payment-qr.png';
                      }}
                    />
                  </div>
                  <strong className="qr-amount-text">{formatPrice(total)}</strong>
                  <p className="qr-account-info">
                    Ngân hàng: <strong>Vietcombank (Napas 247)</strong><br />
                    Số TK: <strong>0161001693924</strong><br />
                    Chủ TK: <strong>LE QUANG TAN</strong><br />
                    Nội dung CK: <strong>{transferNote}</strong>
                  </p>
                </div>
                <p className="qr-instruction">
                  Mở ứng dụng ngân hàng và quét mã để thanh toán tự động xác nhận trong 1 phút.
                </p>
                <button
                  type="button"
                  className="btn-simulate-vietqr"
                  onClick={handleSimulateTransferSuccess}
                >
                  ✅ Giả lập đã chuyển khoản thành công
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>

      <TrustBar />
    </div>
  );
}
