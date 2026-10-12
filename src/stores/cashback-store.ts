import { create } from 'zustand';

import { errorMessage, type AsyncSlice } from '@/lib/api-status';
import { api } from '@/services';
import type { CashbackEntry } from '@/services/types/cashback';

interface CashbackState extends AsyncSlice {
  balance: number;
  entries: CashbackEntry[];
  fetchCashback: () => Promise<void>;
  withdraw: (amount: number) => Promise<void>;
}

export const useCashbackStore = create<CashbackState>((set, get) => ({
  status: 'idle',
  error: null,
  balance: 0,
  entries: [],
  fetchCashback: async () => {
    set({ status: 'loading', error: null });
    try {
      const [balance, entries] = await Promise.all([api.cashback.getBalance(), api.cashback.listEntries()]);
      set({ balance, entries, status: 'success' });
    } catch (e) {
      set({ status: 'error', error: errorMessage(e) });
    }
  },
  withdraw: async (amount) => {
    const { balance } = await api.cashback.withdraw(amount);
    set({ balance });
    await get().fetchCashback();
  },
}));
