import { API_MODE } from '@/services/config';

import { authMockApi } from '@/services/mock/auth.mock';
import { walletsMockApi } from '@/services/mock/wallets.mock';
import { transactionsMockApi } from '@/services/mock/transactions.mock';
import { cardsMockApi } from '@/services/mock/cards.mock';
import { billsMockApi } from '@/services/mock/bills.mock';
import { linksMockApi } from '@/services/mock/links.mock';
import { notificationsMockApi } from '@/services/mock/notifications.mock';
import { cashbackMockApi } from '@/services/mock/cashback.mock';
import { securityMockApi } from '@/services/mock/security.mock';
import { verificationMockApi } from '@/services/mock/verification.mock';
import { giftCardsMockApi } from '@/services/mock/gift-cards.mock';

import { authLiveApi } from '@/services/live/auth.live';
import { walletsLiveApi } from '@/services/live/wallets.live';
import { transactionsLiveApi } from '@/services/live/transactions.live';
import { cardsLiveApi } from '@/services/live/cards.live';
import { billsLiveApi } from '@/services/live/bills.live';
import { linksLiveApi } from '@/services/live/links.live';
import { notificationsLiveApi } from '@/services/live/notifications.live';
import { cashbackLiveApi } from '@/services/live/cashback.live';
import { securityLiveApi } from '@/services/live/security.live';
import { verificationLiveApi } from '@/services/live/verification.live';
import { giftCardsLiveApi } from '@/services/live/gift-cards.live';

const isMock = API_MODE === 'mock';

/**
 * Single import surface for every store. Flip `API_MODE` in `./config` to point the whole app at
 * a real backend — no store or screen changes required, since both adapters implement the same
 * per-resource interface from `./types/*`.
 */
export const api = {
  auth: isMock ? authMockApi : authLiveApi,
  wallets: isMock ? walletsMockApi : walletsLiveApi,
  transactions: isMock ? transactionsMockApi : transactionsLiveApi,
  cards: isMock ? cardsMockApi : cardsLiveApi,
  bills: isMock ? billsMockApi : billsLiveApi,
  links: isMock ? linksMockApi : linksLiveApi,
  notifications: isMock ? notificationsMockApi : notificationsLiveApi,
  cashback: isMock ? cashbackMockApi : cashbackLiveApi,
  security: isMock ? securityMockApi : securityLiveApi,
  verification: isMock ? verificationMockApi : verificationLiveApi,
  giftCards: isMock ? giftCardsMockApi : giftCardsLiveApi,
};
