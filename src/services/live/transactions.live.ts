import { http } from '@/services/live/http';
import type { TransactionsAPI } from '@/services/types/transactions';

export const transactionsLiveApi: TransactionsAPI = {
  listRecent: () => http.get('/transactions/recent'),
  listHistory: (params) =>
    http.get(`/transactions?cursor=${params?.cursor ?? ''}&filter=${params?.filter ?? ''}`),
  getById: (id: string) => http.get(`/transactions/${id}`),
};
