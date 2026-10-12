export interface LinkPayer {
  name: string;
  meta: string;
  amt: number;
  tint: string;
  /**
   * The ledger entry this payment created. `design/payment links/view link.png` draws a chevron on
   * every payer row, so each one opens the shared transaction detail screen.
   */
  ref: string;
}

export interface PaymentLink {
  id: string;
  title: string;
  slug: string;
  amount: number;
  paid: number;
  count: number;
  active: boolean;
  created: string;
  payers: LinkPayer[];
  /** The three switches on `design/payment links/create payment link.png`. Absent on seeded links,
   * which the edit form reads as on — the reference has all three on by default. */
  collectName?: boolean;
  allowReuse?: boolean;
  notify?: boolean;
}

/** What the create form sends, and what editing an existing link sends back. */
export interface LinkDraft {
  title: string;
  /** Omitted for an open-amount link — "Payer decides". */
  amount?: number;
  collectName?: boolean;
  allowReuse?: boolean;
  notify?: boolean;
}

export interface LinksAPI {
  listLinks(): Promise<PaymentLink[]>;
  createLink(payload: LinkDraft): Promise<PaymentLink>;
  updateLink(id: string, payload: LinkDraft): Promise<PaymentLink>;
  toggleActive(id: string): Promise<PaymentLink>;
  deleteLink(id: string): Promise<void>;
}
