import type { BillType } from '@/services/types/bills';

/** `design/utility/amount-1.png` reads "fee ₦50"; `review-payment.png` reads "Service fee ₦50". */
export const BILL_FEE = 50;
export const BILL_FEE_LABEL = '₦50';

/**
 * `review-payment.png` shows ₦1 cashback on ₦84.2 — 1%, which is also what `(tabs)/bills.tsx`'s
 * banner, `content.ts` and the loyalty tour all say. The code had 1.2% in two places.
 */
export const BILL_CASHBACK_RATE = 0.01;

/** Verbatim from the design's `BILLS` map. */
export const MOCK_BILL_TYPES: BillType[] = [
  { key: 'Electricity', title: 'Electricity token', field: 'Meter number', hint: 'Your prepaid token arrives by SMS within 60 seconds.', providers: ['Ikeja Electric', 'Eko DisCo', 'Abuja DisCo', 'PH DisCo'], ref: '4512 8890 231', icon: 'bolt' },
  { key: 'Airtime', title: 'Airtime top-up', field: 'Mobile number', hint: 'Credited instantly to the number above.', providers: ['MTN', 'Airtel', 'Glo', '9mobile'], ref: '0801 234 5678', icon: 'phone' },
  { key: 'Data', title: 'Data bundle', field: 'Mobile number', hint: 'Your bundle activates as soon as payment clears.', providers: ['MTN', 'Airtel', 'Glo', '9mobile'], ref: '0801 234 5678', icon: 'wifi' },
  { key: 'Cable', title: 'Cable TV', field: 'Smartcard number', hint: 'Renews your subscription for one month.', providers: ['DStv', 'GOtv', 'Startimes', 'Showmax'], ref: '7028 449 155', icon: 'tv' },
  { key: 'Water', title: 'Water rate', field: 'Customer ID', hint: 'Lagos Water Corporation billing reference.', providers: ['Lagos Water', 'Abuja Water', 'Ogun Water', 'Other'], ref: 'LWC-88213', icon: 'water' },
  { key: 'Internet', title: 'Internet', field: 'Account ID', hint: 'Fibre and fixed wireless providers.', providers: ['Spectranet', 'Smile', 'FibreOne', 'Starlink'], ref: 'SPC-449021', icon: 'globe' },
];

/** The design's `BANK_LIST`, used by the bank-transfer picker. */
export const MOCK_BANKS = [
  'GTBank', 'Access Bank', 'Zenith Bank', 'First Bank', 'UBA',
  'Kuda MFB', 'Opay', 'Moniepoint', 'PalmPay', 'Sterling Bank',
];

/** The design's `PEOPLE` — saved bank beneficiaries. */
export const MOCK_BENEFICIARIES = [
  { mark: 'AK', name: 'Adrian', bank: 'GTBank', number: '6512340890', acct: 'GTBank · 65******890', tint: '#ffe3d8' },
  { mark: 'MV', name: 'Martin', bank: 'Access Bank', number: '0491220087', acct: 'Access · 04******087', tint: '#dfe7ff' },
  { mark: 'SO', name: 'Stefan', bank: 'Kuda MFB', number: '2084417712', acct: 'Kuda · 20******712', tint: '#e2f4e6' },
  { mark: 'SP', name: 'Sophie', bank: 'Opay', number: '8033114422', acct: 'Opay · 80******422', tint: '#f6e2f4' },
  { mark: 'CE', name: 'Chinedu', bank: 'GTBank', number: '0123456789', acct: 'GTBank · 01******789', tint: '#fff0cf' },
];

/** The design's `VERTEX_USERS` — recent Vertex-to-Vertex contacts. */
export const MOCK_VERTEX_USERS = [
  { mark: 'NO', name: 'Nkem Obi', tag: '@nkem', tint: '#dfe7ff' },
  { mark: 'TB', name: 'Tunde Bello', tag: '@tundeb', tint: '#e2f4e6' },
  { mark: 'ZA', name: 'Zainab Ali', tag: '@zainab', tint: '#fff0cf' },
  { mark: 'EK', name: 'Emeka Nwosu', tag: '@emeka', tint: '#ffe3d8' },
];

/**
 * The design resolves an account number to a name deterministically via `RESOLVED_NAMES` +
 * `NAME_FOR` (last two digits, modulo the list length) so the same number always resolves the same
 * way — reproduced here so the NUBAN lookup behaves identically.
 */
const RESOLVED_NAMES = [
  'CHINEDU M. ELUEMUNOR', 'FATIMA A. BELLO', 'OLUWASEUN T. ADEYEMI',
  'IKECHUKWU P. NWACHUKWU', 'HALIMA S. YUSUF',
];

export function resolveAccountName(accountNumber: string): string {
  const suffix = parseInt(accountNumber.slice(-2), 10) || 0;
  return RESOLVED_NAMES[suffix % RESOLVED_NAMES.length];
}
