import { ApiError } from '@/services/types/common';
import { delay } from '@/services/mock/delay';
import { MOCK_CASHBACK_ENTRIES } from '@/services/mock/data/cashback';
import { MOCK_USER } from '@/services/mock/data/user';
import type { CashbackAPI } from '@/services/types/cashback';

let balance = MOCK_USER.cashbackBalance;
const entries = [...MOCK_CASHBACK_ENTRIES];

export const cashbackMockApi: CashbackAPI = {
  async getBalance() {
    await delay(300);
    return balance;
  },
  async listEntries() {
    await delay();
    return entries;
  },
  async getEntry(id) {
    await delay(250);
    const entry = entries.find((e) => e.id === id);
    if (!entry) throw new ApiError('NOT_FOUND', 'Reward not found.');
    return entry;
  },
  async withdraw(amount) {
    await delay(600);
    balance = Math.max(0, balance - amount);
    entries.unshift({
      id: `c_${Date.now()}`,
      mark: 'WD',
      name: 'Withdrawal',
      meta: 'To main wallet',
      amt: `−₦${amount.toLocaleString()}`,
      tint: '#e2f4e6',
      dir: 'out',
      ref: `VTX-${Date.now().toString().slice(-6)}`,
      channel: 'Internal',
      reward: false,
      fee: '₦0.00',
      date: new Date().toDateString(),
      status: 'Completed',
      note: '',
    });
    return { balance };
  },
};
