import type { CartItem } from '../cart/types';

export type PaymentMethod = 'vietqr' | 'cod';
export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled';

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
}

export interface CreateOrderOptions {
  status?: OrderStatus;
  userId?: string;
  customerEmail?: string;
}
