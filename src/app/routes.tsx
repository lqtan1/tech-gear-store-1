import type { RouteObject } from 'react-router';

import ProtectedRoute from '../components/ProtectedRoute';
import RootLayout from '../layouts/RootLayout';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import LogoutPage from '../pages/LogoutPage';
import NewsDetailPage from '../pages/NewsDetailPage';
import NewsPage from '../pages/NewsPage';
import NotFoundPage from '../pages/NotFoundPage';
import OrdersPage from '../pages/OrdersPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import ProductsPage from '../pages/ProductsPage';
import SoftwarePage from '../pages/SoftwarePage';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'software', element: <SoftwarePage /> },
      { path: 'news', element: <NewsPage /> },
      { path: 'news/:id', element: <NewsDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'logout', element: <LogoutPage /> },
      {
        element: <ProtectedRoute />,
        children: [{ path: 'admin', element: <AdminDashboardPage /> }],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
