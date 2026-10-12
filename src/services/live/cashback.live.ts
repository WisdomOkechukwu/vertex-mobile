import { http } from '@/services/live/http';
import type { CashbackAPI } from '@/services/types/cashback';

export const cashbackLiveApi: CashbackAPI = {
  getBalance: () => http.get('/cashback/balance'),
  listEntries: () => http.get('/cashback/entries'),
  getEntry: (id: string) => http.get(`/cashback/entries/${id}`),
  withdraw: (amount: number) => http.post('/cashback/withdraw', { amount }),
};
