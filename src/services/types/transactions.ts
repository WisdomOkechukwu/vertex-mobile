export type TransactionKind =
  | 'Sent'
  | 'Received'
  | 'Bill'
  | 'Swap'
  | 'Cashback'
  | 'Card'
  | 'Vertex transfer'
  | 'Gift card';

/** Drives the detail screen's badge. Mirrors `Status` in `@/components/ui/status-badge`. */
export type TransactionStatus = 'success' | 'pending' | 'failed';

export interface Transaction {
  id: string;
  mark: string;
  name: string;
  time: string;
  day?: string;
  amt: string;
  value?: number;
  kind: TransactionKind;
  status: TransactionStatus;
  dir: 'in' | 'out';
  tint: string;
  ref: string;
  channel: string;
  fee: string;
  date: string;
  note: string;
  cashback: string;
}

export interface TransactionsAPI {
  listRecent(): Promise<Transaction[]>;
  listHistory(params?: { cursor?: string; filter?: string }): Promise<import('./common').PaginatedResult<Transaction>>;
  getById(id: string): Promise<Transaction>;
}
