import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useCartStore } from '../features/cart/store';
import type { CartItem } from '../features/cart/types';
import type { Product } from '../features/products/types';

export interface CartContextValue {
  items: CartItem[];
  isLoading: boolean;
  totalAmount: number;
  itemCount: number;
  addItem: (product: Product) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  loadUserCart: (userId: string) => Promise<void>;
  resetOnLogout: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useCartStore((state) => state.items);
  const isLoading = useCartStore((state) => state.isLoading);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const loadUserCart = useCartStore((state) => state.loadUserCart);
  const resetOnLogout = useCartStore((state) => state.resetOnLogout);

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items],
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isLoading,
      totalAmount,
      itemCount,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      loadUserCart,
      resetOnLogout,
    }),
    [items, isLoading, totalAmount, itemCount, addItem, removeItem, updateQuantity, clearCart, loadUserCart, resetOnLogout],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    // Return store fallback if used outside CartProvider
    const state = useCartStore.getState();
    const totalAmount = state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
    return {
      items: state.items,
      isLoading: state.isLoading,
      totalAmount,
      itemCount,
      addItem: state.addItem,
      removeItem: state.removeItem,
      updateQuantity: state.updateQuantity,
      clearCart: state.clearCart,
      loadUserCart: state.loadUserCart,
      resetOnLogout: state.resetOnLogout,
    };
  }
  return context;
}
