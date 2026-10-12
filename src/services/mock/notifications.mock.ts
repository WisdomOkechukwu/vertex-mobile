import { delay } from '@/services/mock/delay';
import { MOCK_NOTIFICATIONS } from '@/services/mock/data/notifications';
import type { NotificationsAPI } from '@/services/types/notifications';

const notifications = [...MOCK_NOTIFICATIONS];

export const notificationsMockApi: NotificationsAPI = {
  async listNotifications() {
    await delay();
    return notifications;
  },
  async markRead(id) {
    await delay(150);
    const n = notifications.find((x) => x.id === id);
    if (n) n.unread = false;
  },
};
