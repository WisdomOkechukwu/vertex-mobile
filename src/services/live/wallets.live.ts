import { http } from '@/services/live/http';
import type { WalletAPI } from '@/services/types/wallets';

export const walletsLiveApi: WalletAPI = {
  listAssets: () => http.get('/wallets'),
  getAsset: (code: string) => http.get(`/wallets/${code}`),
  swap: (payload) => http.post('/wallets/swap', payload),
  debit: (payload) => http.post('/wallets/debit', payload),
};
