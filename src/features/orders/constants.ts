import type { OrderStatus, PaymentMethod } from './types';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã thanh toán',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  vietqr: 'VietQR (Chuyển khoản)',
  cod: 'Thanh toán khi nhận hàng (COD)',
};

