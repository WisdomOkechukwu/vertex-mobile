import { create } from 'zustand';

import { errorMessage, type AsyncSlice } from '@/lib/api-status';
import { api } from '@/services';
import type { Transaction } from '@/services/types/transactions';

interface TransactionsState extends AsyncSlice {
  recent: Transaction[];
  history: Transaction[];
  hasMore: boolean;
  fetchRecent: () => Promise<void>;
  fetchHistory: (params?: { cursor?: string; filter?: string }) => Promise<void>;
  getById: (id: string) => Transaction | undefined;
}

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  status: 'idle',
  error: null,
  recent: [],
  history: [],
  hasMore: false,
  fetchRecent: async () => {
    set({ status: 'loading', error: null });
    try {
      const recent = await api.transactions.listRecent();
      set({ recent, status: 'success' });
    } catch (e) {
      set({ status: 'error', error: errorMessage(e) });
    }
  },
  fetchHistory: async (params) => {
    set({ status: 'loading', error: null });
    try {
      const { items, hasMore } = await api.transactions.listHistory(params);
      set({ history: items, hasMore, status: 'success' });
    } catch (e) {
      set({ status: 'error', error: errorMessage(e) });
    }
  },
  getById: (id) => [...get().recent, ...get().history].find((t) => t.id === id),
}));
