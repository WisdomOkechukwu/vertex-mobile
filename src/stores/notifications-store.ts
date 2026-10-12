import { create } from 'zustand';

import { errorMessage, type AsyncSlice } from '@/lib/api-status';
import { api } from '@/services';
import type { Notification } from '@/services/types/notifications';

interface NotificationsState extends AsyncSlice {
  items: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markRead: (id: string) => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  status: 'idle',
  error: null,
  items: [],
  unreadCount: 0,
  fetchNotifications: async () => {
    set({ status: 'loading', error: null });
    try {
      const items = await api.notifications.listNotifications();
      set({ items, unreadCount: items.filter((n) => n.unread).length, status: 'success' });
    } catch (e) {
      set({ status: 'error', error: errorMessage(e) });
    }
  },
  markRead: (id) => {
    api.notifications.markRead(id).catch(() => undefined);
    const items = get().items.map((n) => (n.id === id ? { ...n, unread: false } : n));
    set({ items, unreadCount: items.filter((n) => n.unread).length });
  },
}));
