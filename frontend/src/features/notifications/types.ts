export type NotificationType = 'order' | 'shipping' | 'refund' | 'system' | 'promo';
export type NotificationRecipientRole = 'customer' | 'admin' | 'all';

export interface AppNotification {
  id: string;
  userId?: string | null;
  recipientRole: NotificationRecipientRole;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationInput {
  userId?: string | null;
  recipientRole?: NotificationRecipientRole;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
}
