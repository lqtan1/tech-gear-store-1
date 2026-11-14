import { Navigate, Outlet, useLocation } from 'react-router';

import { useAuthStore } from '../features/auth/store';

export default function ProtectedRoute() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
