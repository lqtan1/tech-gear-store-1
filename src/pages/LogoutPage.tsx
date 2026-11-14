import { useEffect } from 'react';
import { Navigate } from 'react-router';

import { useAuthStore } from '../features/auth/store';

export default function LogoutPage() {
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    logout();
  }, [logout]);

  return <Navigate to="/" replace />;
}
