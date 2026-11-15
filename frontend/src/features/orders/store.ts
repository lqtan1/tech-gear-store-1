import { create } from 'zustand';

import type { CreateOrderOptions, Order, OrderStatus, PaymentMethod, ShippingInformation } from './types';
import type { CartItem } from '../cart/types';
import type { Product } from '../products/types';
import { getMockProductImages, normalizeProductRecord } from '../products/utils';

interface OrderState {
  orders: Order[];
  createOrder: (
    items: CartItem[],
    shipping: ShippingInformation,
    paymentMethod: PaymentMethod,
    options?: CreateOrderOptions,
  ) => Order;
  updateStatus: (
    id: string,
    status: OrderStatus,
    trackingCode?: string,
    shippingCarrier?: string,
  ) => void;
  requestReturn: (id: string, reason: string, note?: string) => void;
  approveRefund: (id: string, adminNote?: string) => void;
  rejectRefund: (id: string, adminNote: string) => void;
  cancelOrder: (id: string) => void;
  syncFromStorage: () => void;
  resetOrders: () => void;
}

const STORAGE_KEY = 'tech-gear-orders';

const sampleProducts: Product[] = [
  {
    id: 1,
    name: 'Chuột không dây Logitech MX Master 3S',
    segment: 'office',
    category: 'Chuột',
    price: 1890000,
    originalPrice: 2490000,
    images: getMockProductImages(1),
    specs: 'Cảm biến 8.000 DPI, pin 70 ngày',
    desc: 'Chuột công thái học cao cấp.',
    inStock: true,
    stockQuantity: 28,
  },
  {
    id: 2,
    name: 'Bàn phím cơ Keychron K2 Pro QMK/VIA',
    segment: 'office',
    category: 'Bàn phím',
    price: 2290000,
    originalPrice: 2850000,
    images: getMockProductImages(2),
    specs: 'Layout 75%, switch Gateron, Bluetooth 5.1',
    desc: 'Bàn phím cơ nhỏ gọn tùy biến VIA.',
    inStock: true,
    stockQuantity: 15,
  },
  {
    id: 3,
    name: 'Màn hình Dell UltraSharp 27 inch 4K IPS',
    segment: 'office',
    category: 'Màn hình',
    price: 7490000,
    originalPrice: 9200000,
    images: getMockProductImages(3),
    specs: '27 inch 4K UHD, IPS Black, Type-C 90W',
    desc: 'Màn hình chuẩn đồ họa.',
    inStock: true,
    stockQuantity: 4,
  },
  {
    id: 4,
    name: 'Tai nghe chống ồn Sony WH-1000XM5',
    segment: 'office',
    category: 'Tai nghe',
    price: 6990000,
    originalPrice: 8490000,
    images: getMockProductImages(4),
    specs: 'Chống ồn kép Auto NC Optimizer, pin 30h',
    desc: 'Tai nghe chống ồn đầu bảng.',
    inStock: true,
    stockQuantity: 12,
  },
  {
    id: 6,
    name: 'Bàn phím cơ nhôm MonsGeek M1W V3',
    segment: 'gaming',
    category: 'Bàn phím',
    price: 2790000,
    originalPrice: 3290000,
    images: getMockProductImages(6),
    specs: 'Vỏ nhôm CNC, hot-swap 5-pin, 3 chế độ',
    desc: 'Bàn phím nhôm đầm chắc âm thocky.',
    inStock: true,
    stockQuantity: 9,
  },
  {
    id: 8,
    name: 'Chuột không dây Logitech G Pro X Superlight 2',
    segment: 'gaming',
    category: 'Chuột',
    price: 3190000,
    originalPrice: 3790000,
    images: getMockProductImages(8),
    specs: 'HERO 2 32K DPI, nặng 60g, 4000Hz',
    desc: 'Chuột thi đấu thể thao điện tử.',
    inStock: true,
    stockQuantity: 22,
  },
];

const defaultOrders: Order[] = [
  {
    id: 'TG-2026-081',
    createdAt: '2026-10-25T09:30:00.000Z',
    items: [
      {
        product: sampleProducts[1], // Keychron K2 Pro (Bàn phím)
        quantity: 1,
      },
    ],
    shipping: {
      name: 'Nguyễn Văn An',
      phone: '0912 345 678',
      address: '123 Cầu Giấy, Hà Nội',
    },
    paymentMethod: 'vietqr',
    status: 'completed',
    total: 2290000,
    userId: 'customer-1',
    customerEmail: 'customer@techgear.vn',
  },
  {
    id: 'TG-2026-082',
    createdAt: '2026-10-26T14:15:00.000Z',
    items: [
      {
        product: sampleProducts[0], // Logitech MX Master 3S (Chuột)
        quantity: 1,
      },
    ],
    shipping: {
      name: 'Trần Thị Mai',
      phone: '0988 765 432',
      address: '45 Lê Duẩn, Quận 1, TP. Hồ Chí Minh',
    },
    paymentMethod: 'vietqr',
    status: 'confirmed',
    total: 1890000,
    userId: 'customer-1',
    customerEmail: 'customer@techgear.vn',
  },
  {
    id: 'TG-2026-083',
    createdAt: '2026-10-27T10:45:00.000Z',
    items: [
      {
        product: sampleProducts[2], // Dell UltraSharp 4K (Màn hình)
        quantity: 1,
      },
    ],
    shipping: {
      name: 'Lê Hoàng Nam',
      phone: '0903 112 233',
      address: '88 Nguyễn Trãi, Thanh Xuân, Hà Nội',
    },
    paymentMethod: 'vietqr',
    status: 'completed',
    total: 7490000,
    userId: 'customer-2',
  },
  {
    id: 'TG-2026-084',
    createdAt: '2026-10-28T16:20:00.000Z',
    items: [
      {
        product: sampleProducts[3], // Sony WH-1000XM5 (Tai nghe)
        quantity: 1,
      },
    ],
    shipping: {
      name: 'Phạm Đức Minh',
      phone: '0977 445 566',
      address: '70 Lữ Gia, P. 15, Quận 11, TP. Hồ Chí Minh',
    },
    paymentMethod: 'cod',
    status: 'shipping',
    trackingCode: 'GHN892341',
    shippingCarrier: 'Giao Hàng Nhanh',
    total: 6990000,
    userId: 'customer-1',
    customerEmail: 'customer@techgear.vn',
  },
  {
    id: 'TG-2026-085',
    createdAt: '2026-10-29T11:05:00.000Z',
    items: [
      {
        product: sampleProducts[5], // Superlight 2 (Chuột)
        quantity: 1,
      },
      {
        product: sampleProducts[4], // MonsGeek M1W (Bàn phím)
        quantity: 1,
      },
    ],
    shipping: {
      name: 'Hoàng Quốc Bảo',
      phone: '0934 889 900',
      address: '15 Trần Phú, Hải Châu, Đà Nẵng',
    },
    paymentMethod: 'cod',
    status: 'pending',
    total: 5980000,
    userId: 'customer-1',
    customerEmail: 'customer@techgear.vn',
  },
  {
    id: 'TG-2026-086',
    createdAt: '2026-10-30T08:00:00.000Z',
    items: [
      {
        product: sampleProducts[4], // MonsGeek M1W (Bàn phím)
        quantity: 1,
      },
    ],
    shipping: {
      name: 'Đỗ Thùy Trang',
      phone: '0918 667 788',
      address: '22 Hùng Vương, TP. Huế',
    },
    paymentMethod: 'vietqr',
    status: 'completed',
    total: 2790000,
    userId: 'customer-2',
  },
  {
    id: 'TG-2026-087',
    createdAt: '2026-10-31T15:00:00.000Z',
    items: [
      {
        product: sampleProducts[0], // Logitech MX Master 3S
        quantity: 1,
      },
    ],
    shipping: {
      name: 'Võ Minh Khang',
      phone: '0905 123 456',
      address: '102 Hải Phòng, Đà Nẵng',
    },
    paymentMethod: 'vietqr',
    status: 'return_requested',
    total: 1890000,
    userId: 'customer-1',
    customerEmail: 'customer@techgear.vn',
    trackingCode: 'GHN552109',
    shippingCarrier: 'Giao Hàng Nhanh',
    returnReason: 'Sản phẩm bị lỗi kỹ thuật / không hoạt động',
    returnNote: 'Con lăn MagSpeed không nhận tín hiệu. STK nhận hoàn tiền: 0123456789 - Techcombank (Vo Minh Khang)',
    returnedAt: '2026-11-01T08:30:00.000Z',
  },
];

const DEFAULT_ORDER_OWNER_BY_ID = new Map<string, { userId: string; customerEmail?: string }>(
  defaultOrders.map((order) => [
    order.id,
    { userId: order.userId ?? 'customer-1', customerEmail: order.customerEmail },
  ]),
);

const getInitialOrders = (): Order[] => {
  if (typeof window === 'undefined') return defaultOrders;

  const savedOrders = window.localStorage.getItem(STORAGE_KEY);
  if (!savedOrders) return defaultOrders;

  try {
    const parsedOrders: unknown = JSON.parse(savedOrders);
    if (!Array.isArray(parsedOrders) || parsedOrders.length === 0) {
      return defaultOrders;
    }

    return parsedOrders
      .filter((order): order is Order => Boolean(order && typeof order === 'object'))
      .map((order) => {
        const defaultOwner = !order.userId ? DEFAULT_ORDER_OWNER_BY_ID.get(order.id) : undefined;
        return {
          ...order,
          userId: order.userId ?? defaultOwner?.userId,
          customerEmail: order.customerEmail ?? defaultOwner?.customerEmail,
          items: Array.isArray(order.items)
            ? order.items
                .map((item) => {
                  const normalizedProduct = normalizeProductRecord(item.product);
                  return normalizedProduct ? { ...item, product: normalizedProduct } : null;
                })
                .filter((item): item is CartItem => item !== null)
            : [],
        };
      });
  } catch {
    return defaultOrders;
  }
};

const persistOrders = (orders: Order[]) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }
};

export const useOrderStore = create<OrderState>((set) => ({
  orders: getInitialOrders(),

  createOrder: (items, shipping, paymentMethod, options) => {
    const order: Order = {
      id: `TG-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      items,
      shipping,
      paymentMethod,
      status: options?.status ?? 'pending',
      total: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      userId: options?.userId,
      customerEmail: options?.customerEmail,
      trackingCode: options?.trackingCode,
      shippingCarrier: options?.shippingCarrier,
    };
    set((state) => {
      const orders = [order, ...state.orders];
      persistOrders(orders);
      return { orders };
    });
    return order;
  },

  updateStatus: (id, status, trackingCode, shippingCarrier) =>
    set((state) => {
      const orders = state.orders.map((order) => {
        if (order.id !== id) return order;

        let resolvedTracking = trackingCode ?? order.trackingCode;
        let resolvedCarrier = shippingCarrier ?? order.shippingCarrier;

        if (status === 'shipping') {
          if (!resolvedTracking) {
            const cleanId = order.id.replace(/^TG-/, '').replace(/[^A-Z0-9]/gi, '');
            resolvedTracking = `TG-SHIP-${cleanId || Math.floor(100000 + Math.random() * 900000)}`;
          }
          if (!resolvedCarrier) {
            resolvedCarrier = 'Giao Hàng Nhanh';
          }
        }

        return {
          ...order,
          status,
          trackingCode: resolvedTracking,
          shippingCarrier: resolvedCarrier,
        };
      });
      persistOrders(orders);
      return { orders };
    }),

  requestReturn: (id, reason, note) =>
    set((state) => {
      const orders = state.orders.map((order) =>
        order.id === id && (order.status === 'completed' || order.status === 'return_requested')
          ? {
              ...order,
              status: 'return_requested' as const,
              returnReason: reason,
              returnNote: note,
              returnedAt: new Date().toISOString(),
            }
          : order,
      );
      persistOrders(orders);
      return { orders };
    }),

  approveRefund: (id, adminNote) =>
    set((state) => {
      const orders = state.orders.map((order) =>
        order.id === id
          ? {
              ...order,
              status: 'refunded' as const,
              adminRefundNote: adminNote || 'Đã duyệt yêu cầu hoàn trả và chuyển tiền hoàn lại cho khách hàng.',
            }
          : order,
      );
      persistOrders(orders);
      return { orders };
    }),

  rejectRefund: (id, adminNote) =>
    set((state) => {
      const orders = state.orders.map((order) =>
        order.id === id
          ? {
              ...order,
              status: 'completed' as const,
              adminRefundNote: adminNote,
            }
          : order,
      );
      persistOrders(orders);
      return { orders };
    }),

  cancelOrder: (id) =>
    set((state) => {
      const orders = state.orders.map((order) =>
        order.id === id && order.status === 'pending'
          ? { ...order, status: 'cancelled' as const }
          : order,
      );
      persistOrders(orders);
      return { orders };
    }),

  syncFromStorage: () => {
    set({ orders: getInitialOrders() });
  },

  resetOrders: () => {
    persistOrders(defaultOrders);
    set({ orders: defaultOrders });
  },
}));

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      useOrderStore.getState().syncFromStorage();
    }
  });
}
