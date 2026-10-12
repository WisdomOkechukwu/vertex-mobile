import { http } from '@/services/live/http';
import type { CardsAPI } from '@/services/types/cards';

export const cardsLiveApi: CardsAPI = {
  listVirtualCards: () => http.get('/cards/virtual'),
  listDebitCards: () => http.get('/cards/debit'),
  createVirtualCard: (payload) => http.post('/cards/virtual', payload),
  toggleFreeze: (cardId: string) => http.patch(`/cards/virtual/${cardId}/freeze`),
  topUp: (cardId: string, amount: number) => http.post(`/cards/virtual/${cardId}/top-up`, { amount }),
  addDebitCard: (payload) => http.post('/cards/debit', payload),
};
