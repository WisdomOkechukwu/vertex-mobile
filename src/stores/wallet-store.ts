import { create } from 'zustand';

import { errorMessage, type AsyncSlice } from '@/lib/api-status';
import { api } from '@/services';
import type { Asset } from '@/services/types/wallets';

interface WalletState extends AsyncSlice {
  assets: Asset[];
  fetchAssets: () => Promise<void>;
  getAsset: (code: string) => Asset | undefined;
  swap: (fromCode: string, toCode: string, amount: number) => Promise<void>;
  debit: (code: string, amount: number) => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  status: 'idle',
  error: null,
  assets: [],
  fetchAssets: async () => {
    set({ status: 'loading', error: null });
    try {
      const assets = await api.wallets.listAssets();
      set({ assets, status: 'success' });
    } catch (e) {
      set({ status: 'error', error: errorMessage(e) });
    }
  },
  getAsset: (code) => get().assets.find((a) => a.code === code),
  swap: async (fromCode, toCode, amount) => {
    await api.wallets.swap({ fromCode, toCode, amount });
    await get().fetchAssets();
  },
  debit: async (code, amount) => {
    set({ assets: await api.wallets.debit({ code, amount }) });
  },
}));
