import { http } from '@/services/live/http';
import type { GiftCardPurchase, GiftCardsAPI } from '@/services/types/gift-cards';

export const giftCardsLiveApi: GiftCardsAPI = {
  listBrands: () => http.get('/gift-cards/brands'),
  listPurchased: () => http.get('/gift-cards'),
  getPurchased: (id: string) => http.get(`/gift-cards/${id}`),
  purchase: (payload: GiftCardPurchase) => http.post('/gift-cards', payload),
  markRedeemed: (id: string) => http.patch(`/gift-cards/${id}/redeem`),
};
