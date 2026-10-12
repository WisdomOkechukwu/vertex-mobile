import { formatMoney } from '@/lib/format';
import { MOCK_ASSETS } from '@/services/mock/data/assets';
import { MOCK_GIFT_BRANDS, MOCK_PURCHASED_GIFT_CARDS } from '@/services/mock/data/gift-cards';
import { delay } from '@/services/mock/delay';
import { ApiError } from '@/services/types/common';
import type { GiftCardsAPI, PurchasedGiftCard } from '@/services/types/gift-cards';

/** Session-lived, like the card and cashback mocks, so a purchase shows up in the list behind it. */
const purchased: PurchasedGiftCard[] = MOCK_PURCHASED_GIFT_CARDS.map((c) => ({ ...c }));

const BLOCK = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Four dash-separated blocks, prefixed with the brand — the shape every real voucher code takes. */
function makeCode(brandName: string): string {
  const block = () =>
    Array.from({ length: 4 }, () => BLOCK[Math.floor(Math.random() * BLOCK.length)]).join('');
  return `${brandName.slice(0, 4).toUpperCase()}-${block()}-${block()}-${block()}`;
}

export const giftCardsMockApi: GiftCardsAPI = {
  async listBrands() {
    await delay();
    return MOCK_GIFT_BRANDS;
  },
  async listPurchased() {
    await delay();
    return purchased.map((c) => ({ ...c }));
  },
  async getPurchased(id) {
    await delay(300);
    const card = purchased.find((c) => c.id === id);
    if (!card) throw new ApiError('NOT_FOUND', 'Gift card not found.');
    return { ...card };
  },
  async purchase({ brandId, amount, fromCode }) {
    await delay(700);
    const brand = MOCK_GIFT_BRANDS.find((b) => b.id === brandId);
    if (!brand) throw new ApiError('NOT_FOUND', 'Gift card not found.');

    /**
     * The card is denominated in the brand's currency and paid for from whichever wallet was chosen,
     * so the charge converts through naira — each asset's `rate` is its value in naira.
     */
    const face = MOCK_ASSETS.find((a) => a.code === brand.currency);
    const from = MOCK_ASSETS.find((a) => a.code === fromCode);
    const paid = face && from ? (amount * face.rate) / from.rate : amount;

    const now = Date.now();
    const card: PurchasedGiftCard = {
      id: `pg_${now}`,
      brandId: brand.id,
      brandName: brand.name,
      tint: brand.tint,
      amount,
      currency: brand.currency,
      paid: Number(paid.toFixed(8)),
      paidCurrency: fromCode,
      code: makeCode(brand.name),
      purchased: 'Just now',
      redeemAt: brand.redeemAt,
      status: 'active',
    };
    purchased.unshift(card);

    return {
      card,
      transaction: {
        id: `tx_${now}`,
        mark: brand.name.slice(0, 2).toUpperCase(),
        name: `${brand.name} gift card`,
        time: 'Just now',
        // Through the shared formatter, like every other ledger entry — a raw `toLocaleString`
        // put "50.033 USDC" on the receipt where the rest of the app writes "$50.03".
        amt: formatMoney(-paid, fromCode),
        kind: 'Gift card',
        status: 'success',
        dir: 'out',
        tint: brand.tint,
        ref: `GFT-${String(now).slice(-6)}`,
        channel: `${brand.name} · ${formatMoney(amount, brand.currency)}`,
        fee: 'Free',
        date: new Date().toISOString(),
        note: `Redeem at ${brand.redeemAt}`,
        cashback: '',
      },
    };
  },
  async markRedeemed(id) {
    await delay(300);
    const card = purchased.find((c) => c.id === id);
    if (!card) throw new ApiError('NOT_FOUND', 'Gift card not found.');
    card.status = 'redeemed';
    return { ...card };
  },
};
