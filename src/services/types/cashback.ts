export interface CashbackEntry {
  id: string;
  mark: string;
  name: string;
  meta: string;
  amt: string;
  tint: string;
  dir: 'in' | 'out';
  ref: string;
  channel: string;
  reward: boolean;
  rate?: string;
  fee: string;
  date: string;
  spend?: string;
  status: string;
  note: string;
}

export interface CashbackAPI {
  getBalance(): Promise<number>;
  listEntries(): Promise<CashbackEntry[]>;
  getEntry(id: string): Promise<CashbackEntry>;
  withdraw(amount: number): Promise<{ balance: number }>;
}
