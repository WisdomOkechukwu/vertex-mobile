import { delay } from '@/services/mock/delay';
import { BILL_CASHBACK_RATE, MOCK_BILL_TYPES } from '@/services/mock/data/bills';
import { avatarTintFor } from '@/constants/colors';
import { formatDate, formatMoney, formatTime, initialsOf } from '@/lib/format';
import type { BillsAPI } from '@/services/types/bills';

export const billsMockApi: BillsAPI = {
  async listBillTypes() {
    await delay();
    return MOCK_BILL_TYPES;
  },
  async payBill({ billKey, provider, amount, fromWalletCode }) {
    await delay(800);
    return {
      id: `tx_${Date.now()}`,
      mark: initialsOf(provider),
      name: provider,
      time: 'Just now',
      amt: formatMoney(-amount, fromWalletCode),
      kind: 'Bill',
      status: 'pending',
      dir: 'out',
      tint: avatarTintFor(provider),
      ref: `VTX-${Date.now().toString().slice(-6)}`,
      channel: 'Bill payment',
      fee: 'Fee included',
      date: `${formatDate(new Date())}, ${formatTime(new Date())}`,
      note: billKey,
      cashback: formatMoney(amount * BILL_CASHBACK_RATE, fromWalletCode),
    };
  },
};
