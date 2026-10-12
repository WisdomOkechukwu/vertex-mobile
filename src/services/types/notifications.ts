export interface Notification {
  id: string;
  group: 'Today' | 'Yesterday' | 'Earlier';
  kind: 'money' | 'security' | 'reward' | 'verify' | 'card';
  title: string;
  body: string;
  time: string;
  /** Tints the icon tile: attention (`neg`) vs informational (`pos`). */
  tone: 'pos' | 'neg';
  unread: boolean;
}

export interface NotificationsAPI {
  listNotifications(): Promise<Notification[]>;
  markRead(id: string): Promise<void>;
}
