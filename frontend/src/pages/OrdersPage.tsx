import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router';

import TrustBar from '../components/TrustBar';
import { useAuthStore } from '../features/auth/store';
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, RETURN_REASONS } from '../features/orders/constants';
import { useOrderStore } from '../features/orders/store';
import type { Order, OrderStatus } from '../features/orders/types';
import { getProductPrimaryImage } from '../features/products/utils';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const formatPrice = (price: number) => `${price.toLocaleString('vi-VN')} đ`;

interface OrdersLocationState {
  successBanner?: string;
}

const FILTER_OPTIONS: Array<{ value: 'all' | OrderStatus | 'returns'; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'shipping', label: '🚚 Đang vận chuyển' },
  { value: 'completed', label: 'Đã giao hàng' },
  { value: 'returns', label: '↩️ Hoàn trả / Hoàn tiền' },
  { value: 'cancelled', label: 'Đã hủy' },
];

export default function OrdersPage() {
  const user = useAuthStore((state) => state.user);
  const { orders, cancelOrder, requestReturn, syncFromStorage } = useOrderStore();
  const location = useLocation();
  const routeBanner = (location.state as OrdersLocationState | null)?.successBanner ?? null;

  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus | 'returns'>('all');
  const [actionBanner, setActionBanner] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [returnModalOrder, setReturnModalOrder] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState<string>(RETURN_REASONS[0]);
  const [returnNote, setReturnNote] = useState<string>('');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState<boolean>(false);

  useEffect(() => {
    syncFromStorage();
  }, [syncFromStorage]);

  const customerOrders = useMemo(() => {
    if (!user) {
      return orders.filter((order) => !order.userId);
    }
    if (user.role === 'admin') {
      return orders;
    }
    return orders.filter(
      (order) => order.userId === user.id || order.customerEmail === user.email || !order.userId,
    );
  }, [orders, user]);

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return customerOrders;
    if (statusFilter === 'pending') {
      return customerOrders.filter((order) => order.status === 'pending' || order.status === 'confirmed');
    }
    if (statusFilter === 'returns') {
      return customerOrders.filter((order) => order.status === 'return_requested' || order.status === 'refunded');
    }
    return customerOrders.filter((order) => order.status === statusFilter);
  }, [customerOrders, statusFilter]);

  const handleConfirmCancelOrder = (orderId: string) => {
    cancelOrder(orderId);
    setConfirmCancelId(null);
    setActionBanner(`Đã hủy đơn hàng ${orderId} thành công.`);
  };

  const handleOpenReturnModal = (order: Order) => {
    setReturnModalOrder(order);
    setReturnReason(RETURN_REASONS[0]);
    setReturnNote('');
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnModalOrder) return;

    if (!returnNote.trim()) {
      alert('Vui lòng nhập mô tả chi tiết lý do và thông tin số tài khoản nhận hoàn tiền.');
      return;
    }

    setIsSubmittingReturn(true);
    try {
      requestReturn(returnModalOrder.id, returnReason, returnNote.trim());

      if (isSupabaseConfigured()) {
        try {
          await supabase
            .from('orders')
            .update({
              status: 'return_requested',
              return_reason: returnReason,
              return_note: returnNote.trim(),
              returned_at: new Date().toISOString(),
            })
            .eq('id', returnModalOrder.id);
        } catch (err) {
          console.warn('Could not sync return request to Supabase:', err);
        }
      }

      setActionBanner(
        `Đã gửi yêu cầu hoàn trả cho đơn hàng ${returnModalOrder.id} thành công! TechGear sẽ liên hệ xử lý trong vòng 24h.`,
      );
      setReturnModalOrder(null);
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const renderOrderStepper = (order: Order) => {
    if (order.status === 'cancelled') {
      return (
        <div className="order-stepper-cancelled">
          <span className="stepper-cancelled-icon">✕</span>
          <span>Đơn hàng đã được hủy</span>
        </div>
      );
    }

    if (order.status === 'return_requested') {
      return (
        <div className="order-stepper-return-status requested">
          <span className="stepper-return-icon">↩️</span>
          <div className="stepper-return-text">
            <strong>Đang chờ xét duyệt yêu cầu hoàn trả</strong>
            <small>TechGear đã tiếp nhận yêu cầu và đang thẩm định hồ sơ đổi trả.</small>
          </div>
        </div>
      );
    }

    if (order.status === 'refunded') {
      return (
        <div className="order-stepper-return-status refunded">
          <span className="stepper-return-icon">💰</span>
          <div className="stepper-return-text">
            <strong>Đơn hàng đã hoàn tiền thành công</strong>
            <small>Số tiền {formatPrice(order.total)} đã được hoàn về tài khoản của bạn.</small>
          </div>
        </div>
      );
    }

    const currentStep =
      order.status === 'completed'
        ? 3
        : order.status === 'shipping'
          ? 2
          : 1;

    const trackingCode =
      order.trackingCode || (order.status === 'shipping' ? `TG-SHIP-${order.id.replace(/^TG-/, '')}` : null);
    const carrier = order.shippingCarrier || 'Giao Hàng Nhanh';

    return (
      <div className="order-delivery-stepper-wrap">
        <div className="order-stepper">
          {/* Step 1: Đặt hàng thành công */}
          <div className={`stepper-step ${currentStep >= 1 ? 'completed' : ''}`}>
            <div className="stepper-icon-circle">
              <span>✓</span>
            </div>
            <div className="stepper-text">
              <span className="stepper-title">Đặt hàng thành công</span>
              <small className="stepper-time">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</small>
            </div>
          </div>

          {/* Line 1-2 */}
          <div className={`stepper-line ${currentStep >= 2 ? 'active' : ''}`} />

          {/* Step 2: Đang vận chuyển */}
          <div className={`stepper-step ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}>
            <div className="stepper-icon-circle">
              <span>{currentStep > 2 ? '✓' : '🚚'}</span>
            </div>
            <div className="stepper-text">
              <span className="stepper-title">Đang vận chuyển</span>
              {currentStep >= 2 && <small className="stepper-time">Đang giao</small>}
            </div>
          </div>

          {/* Line 2-3 */}
          <div className={`stepper-line ${currentStep >= 3 ? 'active' : ''}`} />

          {/* Step 3: Giao hàng thành công */}
          <div className={`stepper-step ${currentStep >= 3 ? 'completed' : ''}`}>
            <div className="stepper-icon-circle">
              <span>{currentStep >= 3 ? '✓' : '📦'}</span>
            </div>
            <div className="stepper-text">
              <span className="stepper-title">Giao hàng thành công</span>
              {currentStep >= 3 && <small className="stepper-time">Đã nhận hàng</small>}
            </div>
          </div>
        </div>

        {order.status === 'shipping' && (
          <div className="order-shipping-badge-row">
            <div className="shipping-carrier-badge">
              <span className="carrier-icon">🚚</span>
              <span className="carrier-name">{carrier}</span>
            </div>
            {trackingCode && (
              <div className="tracking-code-pill">
                <span className="tracking-label">Mã vận đơn:</span>
                <strong className="tracking-val">{trackingCode}</strong>
              </div>
            )}
            <span className="shipping-live-hint">Kiện hàng đang trên đường giao đến bạn</span>
          </div>
        )}
      </div>
    );
  };

  const activeBanner = actionBanner ?? routeBanner;

  return (
    <div className="orders-page-wolf">
      <div className="container">
        <div className="breadcrumb-nav">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <strong>Lịch sử mua hàng</strong>
        </div>

        <div className="orders-header-card shadow-sm">
          <div>
            <span className="section-eyebrow">TÀI KHOẢN & ĐƠN HÀNG</span>
            <h1 className="orders-page-title">Lịch sử mua hàng</h1>
            <p className="orders-page-sub">
              {user
                ? `Xin chào ${user.name} (${user.email}) — trạng thái đơn hàng luôn được đồng bộ theo hệ thống quản trị.`
                : 'Theo dõi các đơn hàng bạn vừa đặt trên trình duyệt này hoặc đăng nhập tài khoản khách hàng để xem đầy đủ lịch sử.'}
            </p>
          </div>
          <div className="orders-header-actions">
            {!user && (
              <Link to="/login" className="btn-wolf-outline">
                Đăng nhập tài khoản
              </Link>
            )}
            <Link to="/products" className="btn-wolf-primary">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>

        {activeBanner && (
          <div className="orders-feedback-banner" role="status">
            <span>✅ {activeBanner}</span>
            <button
              type="button"
              className="banner-close-btn"
              onClick={() => setActionBanner(null)}
              aria-label="Đóng thông báo"
            >
              ✕
            </button>
          </div>
        )}

        <div className="orders-filter-bar">
          {FILTER_OPTIONS.map((option) => {
            const count =
              option.value === 'all'
                ? customerOrders.length
                : option.value === 'pending'
                  ? customerOrders.filter((o) => o.status === 'pending' || o.status === 'confirmed').length
                  : option.value === 'returns'
                    ? customerOrders.filter((o) => o.status === 'return_requested' || o.status === 'refunded').length
                    : customerOrders.filter((o) => o.status === option.value).length;
            return (
              <button
                key={option.value}
                type="button"
                className={`orders-filter-pill ${statusFilter === option.value ? 'active' : ''}`}
                onClick={() => setStatusFilter(option.value)}
              >
                {option.label} ({count})
              </button>
            );
          })}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="empty-cart-card shadow-sm">
            <div className="empty-cart-icon">📦</div>
            <h2>
              {customerOrders.length === 0
                ? 'Bạn chưa có đơn hàng nào'
                : 'Không có đơn hàng ở trạng thái này'}
            </h2>
            <p>
              {customerOrders.length === 0 && !user
                ? 'Hãy đăng nhập tài khoản khách hàng (customer@techgear.vn) để xem lịch sử đơn mẫu hoặc đặt sản phẩm mới.'
                : 'Khám phá ngay các sản phẩm gear chính hãng với ưu đãi hấp dẫn tại TechGear Store.'}
            </p>
            <div className="orders-empty-actions">
              {customerOrders.length === 0 && !user && (
                <Link className="btn-wolf-outline" to="/login">
                  Đăng nhập ngay
                </Link>
              )}
              <Link className="btn-wolf-primary" to="/products">
                Khám phá sản phẩm
              </Link>
            </div>
          </div>
        ) : (
          <div className="orders-history-list">
            {filteredOrders.map((order) => (
              <article key={order.id} className="order-history-card shadow-sm">
                <header className="order-card-top">
                  <div className="order-card-id-group">
                    <strong className="order-history-id">Mã đơn: {order.id}</strong>
                    <span className="order-history-date">
                      Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <div className="order-card-badges">
                    <span className={`payment-pill ${order.paymentMethod}`}>
                      {PAYMENT_METHOD_LABELS[order.paymentMethod]}
                    </span>
                    <span className={`order-status-pill ${order.status}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>
                </header>

                {/* Thanh tiến trình giao hàng 3 bước */}
                {renderOrderStepper(order)}

                <div className="order-card-items">
                  {order.items.map((item, idx) => (
                    <div key={`${order.id}-${item.product.id}-${idx}`} className="order-card-item-row">
                      <Link to={`/products/${item.product.id}`} className="order-card-thumb-link">
                        <img
                          src={getProductPrimaryImage(item.product)}
                          alt={item.product.name}
                          className="order-card-item-thumb"
                        />
                      </Link>
                      <div className="order-card-item-info">
                        <Link to={`/products/${item.product.id}`} className="order-card-item-name">
                          {item.product.name}
                        </Link>
                        <div className="order-card-item-meta">
                          <span>Đơn giá: {formatPrice(item.product.price)}</span>
                          <span>•</span>
                          <span>Số lượng: x{item.quantity}</span>
                        </div>
                      </div>
                      <strong className="order-card-item-price">
                        {formatPrice(item.product.price * item.quantity)}
                      </strong>
                    </div>
                  ))}
                </div>

                {/* Khối thông tin Trạng thái Hoàn trả & Phản hồi từ cửa hàng */}
                {order.status === 'return_requested' && (
                  <div className="order-return-info-box requested">
                    <div className="return-box-header">
                      <span className="return-status-tag">⏳ ĐANG CHỜ DUYỆT HOÀN TRẢ</span>
                      {order.returnedAt && (
                        <small className="return-date">
                          Gửi lúc: {new Date(order.returnedAt).toLocaleString('vi-VN')}
                        </small>
                      )}
                    </div>
                    <div className="return-box-body">
                      <p><strong>Lý do yêu cầu:</strong> {order.returnReason || 'Chưa cung cấp'}</p>
                      {order.returnNote && <p><strong>Mô tả & STK nhận tiền:</strong> {order.returnNote}</p>}
                    </div>
                    <small className="return-box-hint">
                      CSKH TechGear đang kiểm tra thông tin và sẽ liên hệ hỗ trợ thu hồi sản phẩm trong vòng 24 giờ.
                    </small>
                  </div>
                )}

                {order.status === 'refunded' && (
                  <div className="order-return-info-box refunded">
                    <div className="return-box-header">
                      <span className="return-status-tag success">✅ ĐÃ HOÀN TIỀN THÀNH CÔNG</span>
                      {order.returnedAt && (
                        <small className="return-date">
                          Xác nhận: {new Date(order.returnedAt).toLocaleString('vi-VN')}
                        </small>
                      )}
                    </div>
                    <div className="return-box-body">
                      <p><strong>Lý do hoàn trả:</strong> {order.returnReason || 'Đã kiểm tra và thu hồi sản phẩm'}</p>
                      {order.adminRefundNote && (
                        <p className="admin-refund-note">
                          <strong>Phản hồi từ TechGear:</strong> {order.adminRefundNote}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {order.status === 'completed' && order.adminRefundNote && (
                  <div className="order-return-info-box rejected">
                    <div className="return-box-header">
                      <span className="return-status-tag danger">❌ YÊU CẦU HOÀN TRẢ BỊ TỪ CHỐI</span>
                    </div>
                    <div className="return-box-body">
                      <p><strong>Phản hồi từ TechGear:</strong> {order.adminRefundNote}</p>
                    </div>
                  </div>
                )}

                <footer className="order-card-footer">
                  <div className="order-card-shipping">
                    <p>
                      <strong>Người nhận:</strong> {order.shipping.name} ({order.shipping.phone})
                    </p>
                    <p>
                      <strong>Địa chỉ:</strong> {order.shipping.address}
                    </p>
                    {order.shipping.note && (
                      <p className="order-card-note">
                        <strong>Ghi chú:</strong> {order.shipping.note}
                      </p>
                    )}
                  </div>

                  <div className="order-card-summary-actions">
                    <div className="order-card-total-wrap">
                      <span>Tổng tiền:</span>
                      <strong className="order-card-total-val">{formatPrice(order.total)}</strong>
                    </div>
                    {order.status === 'pending' ? (
                      confirmCancelId === order.id ? (
                        <div className="cancel-confirm-group">
                          <button
                            type="button"
                            className="btn-cancel-confirm"
                            onClick={() => handleConfirmCancelOrder(order.id)}
                          >
                            Xác nhận hủy
                          </button>
                          <button
                            type="button"
                            className="btn-cancel-keep"
                            onClick={() => setConfirmCancelId(null)}
                          >
                            Giữ lại
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn-cancel-order"
                          onClick={() => setConfirmCancelId(order.id)}
                        >
                          Hủy đơn hàng
                        </button>
                      )
                    ) : order.status === 'shipping' ? (
                      <span className="order-locked-badge" title="Đơn hàng đang trên đường giao, không thể hủy">
                        🔒 Đang vận chuyển
                      </span>
                    ) : order.status === 'completed' ? (
                      <button
                        type="button"
                        className="btn-request-return"
                        onClick={() => handleOpenReturnModal(order)}
                        title="Chính sách đổi trả trong vòng 30 ngày tại TechGear"
                      >
                        ↩️ Yêu cầu hoàn trả / hoàn tiền
                      </button>
                    ) : null}
                  </div>
                </footer>
              </article>
            ))}
          </div>
        )}

        {/* Modal Yêu cầu hoàn trả / hoàn tiền */}
        {returnModalOrder && (
          <div className="modal-backdrop-wolf" onClick={() => setReturnModalOrder(null)}>
            <div
              className="modal-content-wolf return-modal-box shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header-wolf">
                <div>
                  <h3 className="modal-title">↩️ Yêu Cầu Hoàn Trả / Hoàn Tiền</h3>
                  <span className="modal-subtitle">
                    Đơn hàng: <strong>{returnModalOrder.id}</strong> (Tổng tiền:{' '}
                    {formatPrice(returnModalOrder.total)})
                  </span>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setReturnModalOrder(null)}
                  aria-label="Đóng"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitReturn} className="return-modal-form">
                <div className="return-modal-items-summary">
                  <span className="summary-title">Sản phẩm yêu cầu hoàn trả:</span>
                  <div className="return-items-chips">
                    {returnModalOrder.items.map((it, idx) => (
                      <span key={idx} className="return-item-chip">
                        {it.product.name} (x{it.quantity})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="form-group-wolf mb-3">
                  <label htmlFor="return-reason-select" className="form-label-wolf">
                    Lý do hoàn trả / đổi trả <span className="text-red-500">(*)</span>
                  </label>
                  <select
                    id="return-reason-select"
                    className="form-select-wolf w-full"
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    required
                  >
                    {RETURN_REASONS.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group-wolf mb-4">
                  <label htmlFor="return-note-input" className="form-label-wolf">
                    Mô tả chi tiết & Thông tin tài khoản nhận tiền hoàn <span className="text-red-500">(*)</span>
                  </label>
                  <textarea
                    id="return-note-input"
                    className="form-textarea-wolf w-full"
                    rows={4}
                    placeholder="Vui lòng mô tả chi tiết tình trạng sản phẩm và ghi rõ: Số tài khoản ngân hàng, Tên ngân hàng, Tên chủ tài khoản để TechGear hoàn tiền nhanh nhất..."
                    value={returnNote}
                    onChange={(e) => setReturnNote(e.target.value)}
                    required
                  />
                  <small className="form-hint-wolf">
                    * TechGear cam kết bảo hành và đổi trả trong vòng 30 ngày cho các sản phẩm còn đầy đủ phụ kiện.
                  </small>
                </div>

                <div className="modal-footer-wolf">
                  <button
                    type="button"
                    className="btn-wolf-outline"
                    onClick={() => setReturnModalOrder(null)}
                    disabled={isSubmittingReturn}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="btn-wolf-primary btn-submit-return"
                    disabled={isSubmittingReturn || !returnNote.trim()}
                  >
                    {isSubmittingReturn ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu hoàn trả'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <TrustBar />
    </div>
  );
}
