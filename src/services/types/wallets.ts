export interface Asset {
  code: string;
  name: string;
  kind: 'fiat' | 'crypto';
  bal: number;
  rate: number;
  sym: string;
  tint: string;
  change: string | null;
}

export interface WalletAPI {
  listAssets(): Promise<Asset[]>;
  getAsset(code: string): Promise<Asset>;
  swap(payload: { fromCode: string; toCode: string; amount: number }): Promise<{ transaction: import('./transactions').Transaction }>;
  /** Money leaving a wallet for somewhere outside it — a Vertex transfer, a bill, a gift card. */
  debit(payload: { code: string; amount: number }): Promise<Asset[]>;
}
