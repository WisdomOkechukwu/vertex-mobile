export interface Card {
  id: string;
  name: string;
  color: string;
  /** The currency the card is denominated in — every balance and limit on it is in this. */
  currency: string;
  last4: string;
  full: string;
  exp: string;
  cvv: string;
  frozen: boolean;
  spent: number;
  funded: number;
  limit: number;
}

export interface LinkedCard {
  id: string;
  brand: string;
  bank: string;
  last4: string;
  exp: string;
  tint: string;
  primary: boolean;
}

export interface CardsAPI {
  listVirtualCards(): Promise<Card[]>;
  listDebitCards(): Promise<LinkedCard[]>;
  createVirtualCard(payload: { name: string; color: string }): Promise<Card>;
  toggleFreeze(cardId: string): Promise<Card>;
  topUp(cardId: string, amount: number): Promise<Card>;
  addDebitCard(payload: { number: string; exp: string; cvv: string; name: string }): Promise<LinkedCard>;
}
