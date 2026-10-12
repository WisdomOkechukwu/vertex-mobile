import { delay } from '@/services/mock/delay';
import { MOCK_CARD_ACTIVITY } from '@/services/mock/data/cards';
import { MOCK_LINK_PAYMENTS } from '@/services/mock/data/links';
import { MOCK_HISTORY, MOCK_RECENT_TRANSACTIONS } from '@/services/mock/data/transactions';
import { ApiError } from '@/services/types/common';
import type { TransactionsAPI } from '@/services/types/transactions';

export const transactionsMockApi: TransactionsAPI = {
  async listRecent() {
    await delay();
    return MOCK_RECENT_TRANSACTIONS;
  },
  async listHistory() {
    await delay();
    return { items: MOCK_HISTORY, hasMore: false };
  },
  async getById(id) {
    await delay(250);
    // Card spend and payment-link income live in their own ledgers but open the same detail
    // screen, so they have to be reachable here too.
    const all = [
      ...MOCK_RECENT_TRANSACTIONS,
      ...MOCK_HISTORY,
      ...Object.values(MOCK_CARD_ACTIVITY).flat(),
      ...MOCK_LINK_PAYMENTS,
    ];
    const found = all.find((t) => t.id === id);
    if (!found) throw new ApiError('NOT_FOUND', 'Transaction not found.');
    return found;
  },
};
