import type { RouteObject } from 'react-router';

import ProtectedRoute from '../components/ProtectedRoute';
import RootLayout from '../layouts/RootLayout';
import AboutPage from '../pages/AboutPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import B2BPage from '../pages/B2BPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import LogoutPage from '../pages/LogoutPage';
import NewsDetailPage from '../pages/NewsDetailPage';
import NewsPage from '../pages/NewsPage';
import NotFoundPage from '../pages/NotFoundPage';
import OrdersPage from '../pages/OrdersPage';
import PolicyPage from '../pages/PolicyPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import ProductsPage from '../pages/ProductsPage';
import ProfilePage from '../pages/ProfilePage';
import PromotionsPage from '../pages/PromotionsPage';
import SoftwarePage from '../pages/SoftwarePage';
import StoresPage from '../pages/StoresPage';

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
      { path: 'about', element: <AboutPage /> },
      { path: 'stores', element: <StoresPage /> },
      { path: 'promotions', element: <PromotionsPage /> },
      { path: 'b2b', element: <B2BPage /> },
      { path: 'policy', element: <PolicyPage /> },
      { path: 'policy/:slug', element: <PolicyPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'logout', element: <LogoutPage /> },
      {
        // Yêu cầu đăng nhập (Customer hoặc Admin đều được vào Hồ sơ & Cài đặt)
        element: <ProtectedRoute />,
        children: [{ path: 'profile', element: <ProfilePage /> }],
      },
      {
        // Yêu cầu quyền Quản trị viên (Chỉ Admin mới được vào Quản trị)
        element: <ProtectedRoute requiredRole="admin" />,
        children: [{ path: 'admin', element: <AdminDashboardPage /> }],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
