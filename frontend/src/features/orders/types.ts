import type { CartItem } from '../cart/types';

export type PaymentMethod = 'vietqr' | 'cod';
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipping'
  | 'completed'
  | 'cancelled'
  | 'return_requested'
  | 'refunded';

export interface ShippingInformation {
  name: string;
  phone: string;
  address: string;
  note?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  items: CartItem[];
  shipping: ShippingInformation;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  total: number;
  userId?: string;
  customerEmail?: string;
  trackingCode?: string;
  shippingCarrier?: string;
  returnReason?: string;
  returnNote?: string;
  adminRefundNote?: string;
  returnedAt?: string;
}

export interface CreateOrderOptions {
  status?: OrderStatus;
  userId?: string;
  customerEmail?: string;
  trackingCode?: string;
  shippingCarrier?: string;
  returnReason?: string;
  returnNote?: string;
  adminRefundNote?: string;
  returnedAt?: string;
}
