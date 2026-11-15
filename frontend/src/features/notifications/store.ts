import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import type { AppNotification, NotificationInput } from './types';

const STORAGE_KEY = 'techgear_notifications';

// Initial demo notifications so users immediately see functional data
const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-demo-1',
    userId: null,
    recipientRole: 'customer',
    title: 'Chào mừng bạn đến với TechGear!',
    message: 'Tặng bạn mã GIAM10 giảm ngay 10% cho đơn hàng Gaming Gear đầu tiên.',
    type: 'promo',
    link: '/promotions',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
  },
  {
    id: 'notif-demo-2',
    userId: null,
    recipientRole: 'customer',
    title: 'Đơn hàng #TG-2026-086 đã giao thành công',
    message: 'Kiện hàng bàn phím cơ của bạn đã được giao hoàn tất. Cảm ơn bạn đã tin tưởng TechGear!',
    type: 'order',
    link: '/orders',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: 'notif-demo-admin-1',
    userId: null,
    recipientRole: 'admin',
    title: 'Đơn hàng mới #TG-2026-087 cần xử lý',
    message: 'Khách hàng Võ Minh Khang vừa đặt đơn mới giá trị 1.890.000 đ.',
    type: 'order',
    link: '/admin?tab=orders',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'notif-demo-admin-2',
    userId: null,
    recipientRole: 'admin',
    title: 'Yêu cầu hoàn trả mới #TG-2026-087',
    message: 'Khách hàng yêu cầu đổi trả sản phẩm: Sai phiên bản switch màu đỏ.',
    type: 'refund',
    link: '/admin?tab=orders',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
];

const loadFromLocalStorage = (): AppNotification[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_NOTIFICATIONS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as AppNotification[]) : DEFAULT_NOTIFICATIONS;
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
};

const saveToLocalStorage = (list: AppNotification[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage quota errors
  }
};

interface NotificationState {
  notifications: AppNotification[];
  isLoading: boolean;
  activeChannel: ReturnType<typeof supabase.channel> | null;

  fetchNotifications: (user?: { id?: string; role?: string } | null) => Promise<void>;
  addNotification: (input: NotificationInput) => Promise<AppNotification>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: (user?: { id?: string; role?: string } | null) => Promise<void>;
  subscribeRealtime: (user?: { id?: string; role?: string } | null) => void;
  unsubscribeRealtime: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: loadFromLocalStorage(),
  isLoading: false,
  activeChannel: null,

  fetchNotifications: async (user) => {
    set({ isLoading: true });

    // Fallback load from local storage first
    const localNotifs = loadFromLocalStorage();
    set({ notifications: localNotifs });

    if (!isSupabaseConfigured()) {
      set({ isLoading: false });
      return;
    }

    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (user?.role === 'admin') {
        // Admin sees admin notifications and broadcast
        query = query.or(`recipient_role.eq.admin,recipient_role.eq.all,user_id.eq.${user.id}`);
      } else if (user?.id) {
        // Customer sees own notifications and broadcast
        query = query.or(`user_id.eq.${user.id},recipient_role.eq.all,recipient_role.eq.customer`);
      } else {
        query = query.or('recipient_role.eq.all,recipient_role.eq.customer');
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const mapped: AppNotification[] = data.map((item) => ({
          id: item.id,
          userId: item.user_id,
          recipientRole: item.recipient_role,
          title: item.title,
          message: item.message,
          type: item.type,
          link: item.link,
          isRead: Boolean(item.is_read),
          createdAt: item.created_at,
        }));

        // Merge with local notifications (deduplicating by id)
        const existingIds = new Set(mapped.map((n) => n.id));
        const combined = [...mapped, ...localNotifs.filter((n) => !existingIds.has(n.id))];
        combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        saveToLocalStorage(combined);
        set({ notifications: combined });
      }
    } catch (err) {
      console.warn('Could not fetch notifications from Supabase:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  addNotification: async (input) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId: input.userId ?? null,
      recipientRole: input.recipientRole || 'customer',
      title: input.title,
      message: input.message,
      type: input.type || 'order',
      link: input.link,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    // Update state immediately
    const updated = [newNotif, ...get().notifications];
    saveToLocalStorage(updated);
    set({ notifications: updated });

    // Sync to Supabase in background
    if (isSupabaseConfigured()) {
      try {
        void supabase.from('notifications').insert({
          user_id: newNotif.userId,
          recipient_role: newNotif.recipientRole,
          title: newNotif.title,
          message: newNotif.message,
          type: newNotif.type,
          link: newNotif.link,
          is_read: false,
        });
      } catch (err) {
        console.warn('Could not save notification to Supabase:', err);
      }
    }

    return newNotif;
  },

  markAsRead: async (id) => {
    const updated = get().notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    saveToLocalStorage(updated);
    set({ notifications: updated });

    if (isSupabaseConfigured()) {
      try {
        void supabase.from('notifications').update({ is_read: true }).eq('id', id);
      } catch (err) {
        console.warn('Could not update notification in Supabase:', err);
      }
    }
  },

  markAllAsRead: async (user) => {
    const updated = get().notifications.map((n) => {
      if (user?.role === 'admin') {
        if (n.recipientRole === 'admin' || n.recipientRole === 'all' || (user?.id && n.userId === user.id)) {
          return { ...n, isRead: true };
        }
      } else {
        if (n.recipientRole === 'customer' || n.recipientRole === 'all' || (user?.id && n.userId === user.id)) {
          return { ...n, isRead: true };
        }
      }
      return n;
    });

    saveToLocalStorage(updated);
    set({ notifications: updated });

    if (isSupabaseConfigured() && user?.id) {
      try {
        if (user.role === 'admin') {
          void supabase
            .from('notifications')
            .update({ is_read: true })
            .or(`recipient_role.eq.admin,recipient_role.eq.all,user_id.eq.${user.id}`);
        } else {
          void supabase
            .from('notifications')
            .update({ is_read: true })
            .or(`user_id.eq.${user.id},recipient_role.eq.all,recipient_role.eq.customer`);
        }
      } catch (err) {
        console.warn('Could not mark all as read in Supabase:', err);
      }
    }
  },

  subscribeRealtime: (user) => {
    if (!isSupabaseConfigured()) return;

    // Clean up existing subscription
    const existing = get().activeChannel;
    if (existing) {
      void supabase.removeChannel(existing);
    }

    try {
      const channel = supabase
        .channel('public:notifications')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const row = payload.new as {
                id: string;
                user_id?: string | null;
                recipient_role: AppNotification['recipientRole'];
                title: string;
                message: string;
                type: AppNotification['type'];
                link?: string;
                is_read: boolean;
                created_at: string;
              };

              // Check if relevant to current user
              const isAdmin = user?.role === 'admin';
              const isRelevant =
                row.recipient_role === 'all' ||
                (isAdmin && row.recipient_role === 'admin') ||
                (!isAdmin && row.recipient_role === 'customer') ||
                (user?.id && row.user_id === user.id);

              if (isRelevant) {
                const incoming: AppNotification = {
                  id: row.id,
                  userId: row.user_id,
                  recipientRole: row.recipient_role,
                  title: row.title,
                  message: row.message,
                  type: row.type,
                  link: row.link,
                  isRead: Boolean(row.is_read),
                  createdAt: row.created_at,
                };

                const current = get().notifications;
                if (!current.some((n) => n.id === incoming.id)) {
                  const updated = [incoming, ...current];
                  saveToLocalStorage(updated);
                  set({ notifications: updated });
                }
              }
            } else if (payload.eventType === 'UPDATE') {
              const row = payload.new as { id: string; is_read: boolean };
              const current = get().notifications;
              const updated = current.map((n) =>
                n.id === row.id ? { ...n, isRead: Boolean(row.is_read) } : n,
              );
              saveToLocalStorage(updated);
              set({ notifications: updated });
            }
          },
        )
        .subscribe();

      set({ activeChannel: channel });
    } catch (err) {
      console.warn('Realtime subscription failed:', err);
    }
  },

  unsubscribeRealtime: () => {
    const existing = get().activeChannel;
    if (existing) {
      void supabase.removeChannel(existing);
      set({ activeChannel: null });
    }
  },
}));
