import type { Transaction } from '@/services/types/transactions';

/** Verbatim from the design's `TXNS` array (Home's recent list and the transaction detail source). */
export const MOCK_RECENT_TRANSACTIONS: Transaction[] = [
  {
    id: 'VTX-884102', mark: 'AK', name: 'Adrian Keller',
    time: 'Vertex transfer · lunch split · 08:19',
    amt: '−₦399.00', kind: 'Sent', status: 'success', dir: 'out', tint: '#ffe3d8',
    ref: 'VTX-884102', channel: 'Vertex to Vertex · instant', fee: 'Free',
    date: '18 Aug 2026, 08:19', note: 'Lunch split at Terra Kulture', cashback: '',
  },
  {
    id: 'VTX-883940', mark: 'TG', name: 'Thoth Group',
    time: 'Salary paid in from Zenith Bank · 06:15',
    amt: '+₦420,000', kind: 'Received', status: 'success', dir: 'in', tint: '#e2f4e6',
    ref: 'VTX-883940', channel: 'NIP inbound · Zenith Bank 1044******21', fee: 'Free',
    date: '18 Aug 2026, 06:15', note: 'August 2026 salary', cashback: '',
  },
  {
    id: 'VTX-881277', mark: 'IE', name: 'Ikeja Electric',
    time: 'Prepaid token · meter 4512889 · yesterday',
    amt: '−₦15,000', kind: 'Bill', status: 'success', dir: 'out', tint: '#fff0cf',
    ref: 'VTX-881277', channel: 'Utility · prepaid electricity token', fee: '₦50',
    date: '17 Aug 2026, 19:42', note: 'Token 4412 8890 2231 5567', cashback: '₦150',
  },
  {
    id: 'VTX-880913', mark: 'USD', name: 'Converted to USD',
    time: 'NGN wallet → USD wallet · yesterday',
    amt: '−₦50,000', kind: 'Swap', status: 'success', dir: 'out', tint: '#dfe7ff',
    ref: 'VTX-880913', channel: 'Currency swap · NGN → USD at ₦1,533', fee: '0.5%',
    date: '17 Aug 2026, 09:05', note: 'Received $32.42 in your USD wallet', cashback: '',
  },
  {
    id: 'VTX-879002', mark: 'CB', name: 'Cashback reward',
    time: 'Earned on bills and card spend · 15 Aug',
    amt: '+₦1,240', kind: 'Cashback', status: 'success', dir: 'in', tint: '#e2f4e6',
    ref: 'VTX-879002', channel: 'Vertex rewards · paid to NGN wallet', fee: 'Free',
    date: '15 Aug 2026, 00:05', note: 'July rewards, paid monthly', cashback: '',
  },
  {
    id: 'VTX-878850', mark: 'MT', name: 'MTN airtime',
    time: 'Top-up for 0801 234 5678 · 08:12',
    amt: '−₦5,000', kind: 'Bill', status: 'success', dir: 'out', tint: '#e2f4e6',
    ref: 'VTX-878850', channel: 'Utility · airtime top-up', fee: 'Free',
    date: '17 Aug 2026, 08:12', note: 'Top-up for 0801 234 5678', cashback: '₦50',
  },
  {
    id: 'VTX-877401', mark: 'FG', name: 'Figma',
    time: 'Everyday card ···2214 · subscription · 14 Aug',
    amt: '−$15.00', kind: 'Card', status: 'success', dir: 'out', tint: '#f6e2f4',
    ref: 'VTX-877401', channel: 'Everyday card · 2214', fee: '$0.00',
    date: '14 Aug 2026, 11:30', note: 'Recurring · monthly', cashback: '$0.15',
  },
];

/** Day-grouped history, mirroring the design's `HISTORY` grouping and per-day totals. */
export const MOCK_HISTORY: Transaction[] = [
  { ...MOCK_RECENT_TRANSACTIONS[0], day: 'Today · 18 August', value: 399 },
  { ...MOCK_RECENT_TRANSACTIONS[1], day: 'Today · 18 August', value: 420_000 },
  { ...MOCK_RECENT_TRANSACTIONS[2], day: 'Yesterday · 17 August', value: 15_000 },
  { ...MOCK_RECENT_TRANSACTIONS[3], day: 'Yesterday · 17 August', value: 50_000 },
  { ...MOCK_RECENT_TRANSACTIONS[5], day: 'Yesterday · 17 August', value: 5_000 },
  { ...MOCK_RECENT_TRANSACTIONS[4], day: '15 August', value: 1_240 },
  { ...MOCK_RECENT_TRANSACTIONS[6], day: '14 August', value: 15 },
];
