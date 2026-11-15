import userDatabase from '../../database/users.json';

import type { AuthUser } from './types';

interface StoredUser extends AuthUser {
  password: string;
}

const users: StoredUser[] = userDatabase.filter(
  (user): user is StoredUser => user.role === 'admin' || user.role === 'customer',
);

export function authenticateUser(email: string, password: string): AuthUser | undefined {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();
  const user = users.find(
    (candidate) =>
      candidate.email.toLowerCase() === normalizedEmail &&
      candidate.password === normalizedPassword,
  );

  if (!user) return undefined;

  const { password: _password, ...safeUser } = user;
  return safeUser;
}
