import { create } from 'zustand';

import { authenticateUser } from './service';
import type { AuthUser } from './types';

interface AuthState {
  user: AuthUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const getInitialUser = (): AuthUser | null => {
  const savedUser = window.localStorage.getItem('tech-gear-user');
  if (!savedUser) return null;

  try {
    const parsedUser: unknown = JSON.parse(savedUser);
    if (!parsedUser || typeof parsedUser !== 'object') return null;
    const candidate = parsedUser as Record<string, unknown>;
    if (
      typeof candidate.id !== 'string' ||
      typeof candidate.name !== 'string' ||
      typeof candidate.email !== 'string' ||
      (candidate.role !== 'admin' && candidate.role !== 'customer')
    ) {
      return null;
    }
    return {
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      role: candidate.role,
    };
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getInitialUser(),
  login: (email, password) => {
    const user = authenticateUser(email, password);
    if (!user) return false;

    window.localStorage.setItem('tech-gear-user', JSON.stringify(user));
    set({ user });
    return true;
  },
  logout: () => {
    window.localStorage.removeItem('tech-gear-user');
    set({ user: null });
  },
}));
