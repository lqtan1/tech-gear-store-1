import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router';

import TrustBar from '../components/TrustBar';
import { useAuthStore } from '../features/auth/store';
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '../features/orders/constants';
import { useOrderStore } from '../features/orders/store';
import type { OrderStatus } from '../features/orders/types';
import { getProductPrimaryImage } from '../features/products/utils';

const formatPrice = (price: number) => `${price.toLocaleString('vi-VN')} đ`;

interface OrdersLocationState {
  successBanner?: string;
}

const FILTER_OPTIONS: Array<{ value: 'all' | OrderStatus; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: ORDER_STATUS_LABELS.pending },
  { value: 'confirmed', label: ORDER_STATUS_LABELS.confirmed },
  { value: 'shipping', label: ORDER_STATUS_LABELS.shipping },
  { value: 'completed', label: ORDER_STATUS_LABELS.completed },
  { value: 'cancelled', label: ORDER_STATUS_LABELS.cancelled },
];

export default function OrdersPage() {
  const user = useAuthStore((state) => state.user);
  const { orders, cancelOrder, syncFromStorage } = useOrderStore();
  const location = useLocation();
  const routeBanner = (location.state as OrdersLocationState | null)?.successBanner ?? null;

  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [actionBanner, setActionBanner] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

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
    return customerOrders.filter((order) => order.status === statusFilter);
  }, [customerOrders, statusFilter]);

  const handleConfirmCancelOrder = (orderId: string) => {
    cancelOrder(orderId);
    setConfirmCancelId(null);
    setActionBanner(`Đã hủy đơn hàng ${orderId} thành công.`);
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
                    {order.status === 'pending' &&
                      (confirmCancelId === order.id ? (
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
                      ))}
                  </div>
                </footer>
              </article>
            ))}
          </div>
        )}
      </div>

      <TrustBar />
    </div>
  );
}
