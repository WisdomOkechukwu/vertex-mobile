import { create } from 'zustand';

import { errorMessage, type AsyncSlice } from '@/lib/api-status';
import { api } from '@/services';
import type { GiftCardBrand, GiftCardPurchase, PurchasedGiftCard } from '@/services/types/gift-cards';
import type { Transaction } from '@/services/types/transactions';

interface GiftCardsState extends AsyncSlice {
  brands: GiftCardBrand[];
  purchased: PurchasedGiftCard[];
  fetchGiftCards: () => Promise<void>;
  getBrand: (id: string) => GiftCardBrand | undefined;
  /** Returns the issued card and its ledger entry — `pending-tx-store` needs both. */
  purchaseCard: (payload: GiftCardPurchase) => Promise<{ card: PurchasedGiftCard; transaction: Transaction }>;
  markRedeemed: (id: string) => Promise<void>;
}

export const useGiftCardsStore = create<GiftCardsState>((set, get) => ({
  status: 'idle',
  error: null,
  brands: [],
  purchased: [],
  /** One fetch for both lists — the tab shows them together, so loading them apart would flicker. */
  fetchGiftCards: async () => {
    set({ status: 'loading', error: null });
    try {
      const [brands, purchased] = await Promise.all([
        api.giftCards.listBrands(),
        api.giftCards.listPurchased(),
      ]);
      set({ brands, purchased, status: 'success' });
    } catch (e) {
      set({ status: 'error', error: errorMessage(e) });
    }
  },
  getBrand: (id) => get().brands.find((b) => b.id === id),
  purchaseCard: async (payload) => {
    const result = await api.giftCards.purchase(payload);
    set({ purchased: [result.card, ...get().purchased] });
    return result;
  },
  markRedeemed: async (id) => {
    const card = await api.giftCards.markRedeemed(id);
    set({ purchased: get().purchased.map((c) => (c.id === id ? card : c)) });
  },
}));
