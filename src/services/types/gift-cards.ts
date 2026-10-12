import type { Transaction } from '@/services/types/transactions';

export type GiftCardCategory = 'Shopping' | 'Streaming' | 'Gaming' | 'Travel' | 'Food';

export interface GiftCardBrand {
  id: string;
  name: string;
  /** The pastel the brand's monogram sits on. No logo assets exist, as with banks and providers. */
  tint: string;
  category: GiftCardCategory;
  /** What the card is denominated in — never the wallet you pay from. */
  currency: string;
  denominations: number[];
  /** One line on what it is good for, shown on the brand screen. */
  blurb: string;
  /** Where the code is redeemed, shown on a purchased card. */
  redeemAt: string;
}

export interface PurchasedGiftCard {
  id: string;
  brandId: string;
  brandName: string;
  tint: string;
  /** Face value, in the brand's currency. */
  amount: number;
  currency: string;
  /** What the purchase actually cost, in the wallet it was paid from. */
  paid: number;
  paidCurrency: string;
  code: string;
  pin?: string;
  purchased: string;
  redeemAt: string;
  status: 'active' | 'redeemed';
}

export interface GiftCardPurchase {
  brandId: string;
  amount: number;
  /** The wallet the charge comes out of — any of the seven. */
  fromCode: string;
}

export interface GiftCardsAPI {
  listBrands(): Promise<GiftCardBrand[]>;
  listPurchased(): Promise<PurchasedGiftCard[]>;
  getPurchased(id: string): Promise<PurchasedGiftCard>;
  purchase(payload: GiftCardPurchase): Promise<{ card: PurchasedGiftCard; transaction: Transaction }>;
  markRedeemed(id: string): Promise<PurchasedGiftCard>;
}
