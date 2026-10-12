import { http } from '@/services/live/http';
import type { NotificationsAPI } from '@/services/types/notifications';

export const notificationsLiveApi: NotificationsAPI = {
  listNotifications: () => http.get('/notifications'),
  markRead: (id: string) => http.patch(`/notifications/${id}/read`),
};
