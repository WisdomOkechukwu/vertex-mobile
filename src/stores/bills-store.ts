import { create } from 'zustand';

import { errorMessage, type AsyncSlice } from '@/lib/api-status';
import { api } from '@/services';
import type { BillType } from '@/services/types/bills';
import type { Transaction } from '@/services/types/transactions';

interface BillsState extends AsyncSlice {
  billTypes: BillType[];
  fetchBillTypes: () => Promise<void>;
  payBill: (payload: {
    billKey: string;
    provider: string;
    reference: string;
    amount: number;
    fromWalletCode: string;
  }) => Promise<Transaction>;
}

export const useBillsStore = create<BillsState>((set) => ({
  status: 'idle',
  error: null,
  billTypes: [],
  fetchBillTypes: async () => {
    set({ status: 'loading', error: null });
    try {
      const billTypes = await api.bills.listBillTypes();
      set({ billTypes, status: 'success' });
    } catch (e) {
      set({ status: 'error', error: errorMessage(e) });
    }
  },
  payBill: (payload) => api.bills.payBill(payload),
}));
