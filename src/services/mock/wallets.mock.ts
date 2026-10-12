import { avatarTintFor } from '@/constants/colors';
import { MOCK_ASSETS } from '@/services/mock/data/assets';
import { delay } from '@/services/mock/delay';
import { ApiError } from '@/services/types/common';
import type { Asset, WalletAPI } from '@/services/types/wallets';

/**
 * A session-lived copy of the fixture, so balances actually move.
 *
 * `swap` used to return a receipt and change nothing — you could swap ₦482,650 into USDC and both
 * wallets would read exactly what they had before. The card and cashback mocks already keep mutable
 * module state for the same reason; this brings wallets in line.
 */
const assets: Asset[] = MOCK_ASSETS.map((a) => ({ ...a }));

function find(code: string): Asset {
  const asset = assets.find((a) => a.code === code);
  if (!asset) throw new ApiError('NOT_FOUND', 'Asset not found.');
  return asset;
}

export const walletsMockApi: WalletAPI = {
  async listAssets() {
    await delay();
    return assets.map((a) => ({ ...a }));
  },
  async getAsset(code) {
    await delay();
    return { ...find(code) };
  },
  async swap({ fromCode, toCode, amount }) {
    await delay(700);
    const from = find(fromCode);
    const to = find(toCode);
    if (amount > from.bal) throw new ApiError('INSUFFICIENT_FUNDS', `Not enough ${fromCode}.`);

    // Each asset's `rate` is its value in naira, so the pay leg goes to naira and back out at the
    // receiving leg's rate.
    from.bal = Number((from.bal - amount).toFixed(8));
    to.bal = Number((to.bal + (amount * from.rate) / to.rate).toFixed(8));

    return {
      transaction: {
        id: `tx_${Date.now()}`,
        mark: 'SW',
        name: `Swap ${fromCode} → ${toCode}`,
        time: 'Just now',
        amt: `−${amount.toLocaleString()} ${fromCode}`,
        kind: 'Swap',
        status: 'success',
        dir: 'out',
        tint: avatarTintFor(fromCode + toCode),
        ref: `VTX-${Date.now().toString().slice(-6)}`,
        channel: 'In-app swap',
        fee: '0.00',
        date: new Date().toISOString(),
        note: '',
        cashback: '',
      },
    };
  },
  async debit({ code, amount }) {
    await delay(400);
    const asset = find(code);
    if (amount > asset.bal) throw new ApiError('INSUFFICIENT_FUNDS', `Not enough ${code}.`);
    asset.bal = Number((asset.bal - amount).toFixed(8));
    return assets.map((a) => ({ ...a }));
  },
};
