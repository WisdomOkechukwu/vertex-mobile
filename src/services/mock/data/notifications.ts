import type { Notification } from '@/services/types/notifications';

/** Verbatim from the design's `NOTIFS` groups. */
export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', group: 'Today', kind: 'money', title: 'Salary received', body: '₦420,000 paid in from Thoth Group. Your NGN wallet is now ₦482,650.00.', time: '06:15', tone: 'pos', unread: true },
  { id: 'n2', group: 'Today', kind: 'security', title: 'New sign-in on MacBook Pro', body: 'Chrome, Lagos. If this was not you, revoke the session and change your password.', time: '05:02', tone: 'neg', unread: true },
  { id: 'n3', group: 'Yesterday', kind: 'reward', title: '₦150 cashback earned', body: 'From your ₦15,000 Ikeja Electric payment. Rewards are paid on the 15th.', time: '19:42', tone: 'pos', unread: true },
  { id: 'n4', group: 'Yesterday', kind: 'verify', title: 'NIN still outstanding', body: 'Add your NIN to lift your daily limit from ₦1,000,000 to ₦5,000,000.', time: '12:00', tone: 'neg', unread: false },
  { id: 'n5', group: 'Yesterday', kind: 'money', title: 'Electricity token delivered', body: 'Token 4412 8890 2231 5567 for meter 4512889.', time: '19:42', tone: 'pos', unread: false },
  { id: 'n6', group: 'Earlier', kind: 'card', title: 'Subscriptions card created', body: 'Your second virtual card is ready with a $150 monthly limit.', time: '12 Aug', tone: 'pos', unread: false },
];
