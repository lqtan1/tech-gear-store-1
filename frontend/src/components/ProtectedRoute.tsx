import { Navigate, Outlet, useLocation } from 'react-router';

import { useAuth } from '../app/AuthContext';
import { useAuthStore } from '../features/auth/store';

interface ProtectedRouteProps {
  requiredRole?: 'admin' | 'customer';
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { user: supabaseUser, profile, isLoading } = useAuth();
  const storeUser = useAuthStore((state) => state.user);
  const location = useLocation();

  // If auth state is still loading from Supabase (e.g. initial token check on reload), show skeleton
  if (isLoading) {
    return (
      <div
        className="container empty-state-wolf my-5"
        style={{
          minHeight: '40vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          className="skeleton-box"
          style={{ width: '48px', height: '48px', borderRadius: '50%', marginBottom: '16px' }}
        />
        <div
          className="skeleton-box"
          style={{ width: '220px', height: '20px', marginBottom: '8px' }}
        />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Đang xác thực thông tin tài khoản...
        </p>
      </div>
    );
  }

  // Determine current active user
  const role = storeUser?.role || profile?.role || 'customer';
  const isAuthenticated = Boolean(storeUser || profile || supabaseUser);

  // 1. Not logged in -> Redirect to /login with return path
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // 2. Requires admin privilege, but user is a regular customer -> Redirect to home
  if (requiredRole === 'admin' && role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
