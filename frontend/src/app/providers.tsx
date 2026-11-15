import type { ReactNode } from 'react';

import { AuthProvider } from './AuthContext';
import { CartProvider } from '../context/CartContext';
import { ThemeProvider } from './theme-context';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
