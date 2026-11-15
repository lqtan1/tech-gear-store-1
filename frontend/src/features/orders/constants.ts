import type { OrderStatus, PaymentMethod } from './types';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang vận chuyển',
  completed: 'Đã giao hàng',
  cancelled: 'Đã hủy',
  return_requested: 'Yêu cầu hoàn trả',
  refunded: 'Đã hoàn tiền',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  vietqr: 'VietQR (Chuyển khoản)',
  cod: 'Thanh toán khi nhận hàng (COD)',
};

export const RETURN_REASONS = [
  'Sản phẩm bị lỗi kỹ thuật / không hoạt động',
  'Giao sai mẫu mã / màu sắc',
  'Hư hỏng trong quá trình vận chuyển',
  'Không còn nhu cầu sử dụng (còn nguyên seal)',
] as const;

