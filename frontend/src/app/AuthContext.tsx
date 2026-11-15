import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { User, Session } from '@supabase/supabase-js';

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuthStore } from '../features/auth/store';
import { useCartStore } from '../features/cart/store';
import type { AuthUser } from '../features/auth/types';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  preferred_payment?: 'vietqr' | 'cod';
  role: 'customer' | 'admin';
  created_at?: string;
}

interface SignUpResult {
  success: boolean;
  error?: string;
  needsEmailConfirmation?: boolean;
}

interface SignInResult {
  success: boolean;
  error?: string;
  needsEmailConfirmation?: boolean;
}

interface ResendResult {
  success: boolean;
  message: string;
}

interface OAuthResult {
  success: boolean;
  error?: string;
}

export interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  loginWithGoogle: () => Promise<OAuthResult>;
  signOut: () => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<ResendResult>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isConfigured = isSupabaseConfigured();

  const syncProfile = useCallback(async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      let profileData = data;
      const metadata = currentUser.user_metadata || {};
      const googleFullName =
        metadata.full_name ||
        metadata.name ||
        currentUser.email?.split('@')[0] ||
        'Khách hàng TechGear';
      const googleAvatar =
        metadata.avatar_url ||
        metadata.picture ||
        '';

      // Tự động tạo mới hồ sơ nếu chưa có bản ghi trong public.profiles (Google OAuth / First Login)
      if (!profileData) {
        const newRecord = {
          id: currentUser.id,
          email: currentUser.email || '',
          full_name: googleFullName,
          avatar_url: googleAvatar,
          role: 'customer',
        };
        const { data: created, error: insertErr } = await supabase
          .from('profiles')
          .upsert(newRecord, { onConflict: 'id' })
          .select('*')
          .maybeSingle();

        if (!insertErr && created) {
          profileData = created;
        } else {
          profileData = newRecord;
        }
      } else if (!profileData.avatar_url && googleAvatar) {
        // Đồng bộ ảnh đại diện Google nếu hồ sơ chưa có ảnh
        await supabase
          .from('profiles')
          .update({ avatar_url: googleAvatar })
          .eq('id', currentUser.id);
        profileData.avatar_url = googleAvatar;
      }

      const userRole = (profileData?.role === 'admin' ? 'admin' : 'customer') as 'admin' | 'customer';
      const userFullName = profileData?.full_name || googleFullName;

      const userProfile: UserProfile = {
        id: currentUser.id,
        email: currentUser.email || '',
        full_name: userFullName,
        avatar_url: profileData?.avatar_url || googleAvatar,
        phone: profileData?.phone || '',
        address: profileData?.address || '',
        city: profileData?.city || '',
        district: profileData?.district || '',
        preferred_payment: (profileData?.preferred_payment === 'cod' || profileData?.preferred_payment === 'vietqr') ? profileData.preferred_payment : 'vietqr',
        role: userRole,
        created_at: profileData?.created_at,
      };

      setProfile(userProfile);

      // Sync with global auth store
      const storeUser: AuthUser = {
        id: userProfile.id,
        name: userProfile.full_name,
        email: userProfile.email,
        role: userProfile.role,
        avatar_url: userProfile.avatar_url,
        phone: userProfile.phone,
        address: userProfile.address,
        city: userProfile.city,
        district: userProfile.district,
        preferred_payment: userProfile.preferred_payment,
      };
      window.localStorage.setItem('tech-gear-user', JSON.stringify(storeUser));
      useAuthStore.setState({ user: storeUser });

      if (error && !profileData) {
        console.warn('[TechGear Auth] Lỗi tải profile:', error.message);
      }
    } catch (err) {
      console.warn('[TechGear Auth] Không thể tải profile:', err);
    }
  }, []);

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!isMounted) return;
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      if (initialSession?.user) {
        syncProfile(initialSession.user).finally(() => {
          if (isMounted) setIsLoading(false);
        });
        void useCartStore.getState().loadUserCart(initialSession.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen to real-time auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await syncProfile(currentSession.user);
        void useCartStore.getState().loadUserCart(currentSession.user.id);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        useAuthStore.getState().logout();
        useCartStore.getState().resetOnLogout();
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [isConfigured, syncProfile]);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
  ): Promise<SignUpResult> => {
    if (!isConfigured) {
      return {
        success: false,
        error: 'Chưa cấu hình thông tin Supabase (VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY).',
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: 'customer',
          },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        let vietnameseMsg = error.message;
        if (error.message.includes('User already registered')) {
          vietnameseMsg = 'Email này đã được đăng ký tài khoản. Vui lòng chuyển sang tab Đăng nhập.';
        } else if (error.message.includes('Password should be at least')) {
          vietnameseMsg = 'Mật khẩu phải có độ dài tối thiểu 6 ký tự.';
        } else if (error.message.includes('valid email')) {
          vietnameseMsg = 'Địa chỉ email không đúng định dạng.';
        }
        return { success: false, error: vietnameseMsg };
      }

      // Check if email confirmation is required
      if (data.user && (!data.session || data.user.identities?.length === 0)) {
        return { success: true, needsEmailConfirmation: true };
      }

      return { success: true, needsEmailConfirmation: false };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Đã có lỗi xảy ra trong quá trình đăng ký.',
      };
    }
  };

  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!isConfigured) {
      // Fallback to local demo auth if Supabase is unconfigured
      const success = useAuthStore.getState().login(cleanEmail, cleanPassword);
      if (success) {
        const localUser = useAuthStore.getState().user;
        if (localUser) {
          setProfile({
            id: localUser.id,
            email: localUser.email,
            full_name: localUser.name,
            role: localUser.role,
          });
          void useCartStore.getState().loadUserCart(localUser.id);
        }
        return { success: true };
      }
      return { success: false, error: 'Email hoặc mật khẩu không chính xác.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error) {
        // Specifically catch "Email not confirmed"
        if (
          error.message.toLowerCase().includes('email not confirmed') ||
          error.message.toLowerCase().includes('not confirmed')
        ) {
          return {
            success: false,
            needsEmailConfirmation: true,
            error:
              'Email của bạn chưa được xác thực! Vui lòng kiểm tra hộp thư (cả mục Spam) và nhấn liên kết xác nhận để kích hoạt tài khoản.',
          };
        }

        // Allow demo accounts fallback even if not present in Supabase Auth
        if (
          (cleanEmail === 'admin@techgear.vn' && cleanPassword === 'admin') ||
          (cleanEmail === 'customer@techgear.vn' && cleanPassword === 'customer')
        ) {
          const demoSuccess = useAuthStore.getState().login(cleanEmail, cleanPassword);
          if (demoSuccess) {
            const localUser = useAuthStore.getState().user;
            if (localUser) {
              setProfile({
                id: localUser.id,
                email: localUser.email,
                full_name: localUser.name,
                role: localUser.role,
              });
            }
            return { success: true };
          }
        }

        let vietnameseMsg = 'Email hoặc mật khẩu không chính xác.';
        if (error.message.includes('Invalid login credentials')) {
          vietnameseMsg = 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.';
        }
        return { success: false, error: vietnameseMsg };
      }

      if (data.user) {
        await syncProfile(data.user);
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Lỗi kết nối máy chủ xác thực.',
      };
    }
  };

  const loginWithGoogle = async (): Promise<OAuthResult> => {
    if (!isConfigured) {
      return {
        success: false,
        error: 'Chưa cấu hình Supabase (VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY).',
      };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        let vietnameseMsg = error.message;
        if (
          error.message.includes('popup closed') ||
          error.message.includes('user cancelled') ||
          error.message.includes('cancelled')
        ) {
          vietnameseMsg = 'Quá trình đăng nhập bằng Google đã bị hủy.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          vietnameseMsg = 'Lỗi kết nối mạng khi liên kết với tài khoản Google. Vui lòng thử lại.';
        }
        return { success: false, error: vietnameseMsg };
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi xác thực qua Google.',
      };
    }
  };

  const signOut = async (): Promise<void> => {
    if (isConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[TechGear Auth] Lỗi signOut Supabase:', err);
      }
    }
    setUser(null);
    setProfile(null);
    setSession(null);
    useAuthStore.getState().logout();
    useCartStore.getState().resetOnLogout();
  };

  const resendVerificationEmail = async (email: string): Promise<ResendResult> => {
    if (!isConfigured) {
      return {
        success: false,
        message: 'Supabase chưa được cấu hình.',
      };
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return {
        success: true,
        message: 'Đã gửi lại email xác nhận thành công! Vui lòng kiểm tra hộp thư của bạn.',
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Không thể gửi lại email.',
      };
    }
  };

  const refreshProfile = async (): Promise<void> => {
    if (user) {
      await syncProfile(user);
    }
  };

  const updateProfile = async (
    updates: Partial<UserProfile>,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const currentUserId = user?.id || profile?.id;
      if (!currentUserId) {
        return { success: false, error: 'Bạn cần đăng nhập để cập nhật hồ sơ.' };
      }

      // 1. If Supabase is configured and live
      if (isConfigured && user) {
        const payload: Record<string, unknown> = {
          id: currentUserId,
          ...updates,
        };
        // Don't modify email here
        delete payload.email;
        delete payload.created_at;

        const { error: dbError } = await supabase
          .from('profiles')
          .upsert(payload, { onConflict: 'id' });

        if (dbError) {
          return { success: false, error: dbError.message };
        }

        // Also update auth user metadata if full_name or avatar_url changed
        if (updates.full_name || updates.avatar_url) {
          await supabase.auth.updateUser({
            data: {
              ...(updates.full_name ? { full_name: updates.full_name } : {}),
              ...(updates.avatar_url ? { avatar_url: updates.avatar_url } : {}),
            },
          });
        }
      }

      // 2. Update local profile state
      setProfile((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          ...updates,
        };
      });

      // 3. Update useAuthStore
      const currentStoreUser = useAuthStore.getState().user;
      if (currentStoreUser) {
        useAuthStore.getState().updateProfile({
          name: updates.full_name ?? currentStoreUser.name,
          phone: updates.phone ?? currentStoreUser.phone,
          address: updates.address ?? currentStoreUser.address,
          city: updates.city ?? currentStoreUser.city,
          district: updates.district ?? currentStoreUser.district,
          preferred_payment: updates.preferred_payment ?? currentStoreUser.preferred_payment,
          avatar_url: updates.avatar_url ?? currentStoreUser.avatar_url,
        });
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Lỗi không xác định khi lưu hồ sơ.',
      };
    }
  };

  const value: AuthContextValue = {
    user,
    profile,
    session,
    isLoading,
    isConfigured,
    signUp,
    signIn,
    loginWithGoogle,
    signOut,
    resendVerificationEmail,
    refreshProfile,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
