export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  avatar_url?: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  preferred_payment?: 'vietqr' | 'cod';
}
