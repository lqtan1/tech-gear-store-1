import { useEffect } from 'react';
import { Navigate } from 'react-router';

import { useAuth } from '../app/AuthContext';

export default function LogoutPage() {
  const { signOut } = useAuth();

  useEffect(() => {
    signOut();
  }, [signOut]);

  return <Navigate to="/" replace />;
}
