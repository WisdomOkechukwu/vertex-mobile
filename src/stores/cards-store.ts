import { create } from 'zustand';

import { errorMessage, type AsyncSlice } from '@/lib/api-status';
import { api } from '@/services';
import type { Card, LinkedCard } from '@/services/types/cards';

interface CardsState extends AsyncSlice {
  virtualCards: Card[];
  debitCards: LinkedCard[];
  fetchCards: () => Promise<void>;
  createVirtualCard: (payload: { name: string; color: string }) => Promise<void>;
  toggleFreeze: (cardId: string) => Promise<void>;
  topUp: (cardId: string, amount: number) => Promise<void>;
  addDebitCard: (payload: { number: string; exp: string; cvv: string; name: string }) => Promise<void>;
}

export const useCardsStore = create<CardsState>((set, get) => ({
  status: 'idle',
  error: null,
  virtualCards: [],
  debitCards: [],
  fetchCards: async () => {
    set({ status: 'loading', error: null });
    try {
      const [virtualCards, debitCards] = await Promise.all([
        api.cards.listVirtualCards(),
        api.cards.listDebitCards(),
      ]);
      set({ virtualCards, debitCards, status: 'success' });
    } catch (e) {
      set({ status: 'error', error: errorMessage(e) });
    }
  },
  createVirtualCard: async (payload) => {
    const card = await api.cards.createVirtualCard(payload);
    set({ virtualCards: [...get().virtualCards, card] });
  },
  toggleFreeze: async (cardId) => {
    const card = await api.cards.toggleFreeze(cardId);
    set({ virtualCards: get().virtualCards.map((c) => (c.id === cardId ? card : c)) });
  },
  topUp: async (cardId, amount) => {
    const card = await api.cards.topUp(cardId, amount);
    set({ virtualCards: get().virtualCards.map((c) => (c.id === cardId ? card : c)) });
  },
  addDebitCard: async (payload) => {
    const card = await api.cards.addDebitCard(payload);
    set({ debitCards: [...get().debitCards, card] });
  },
}));
