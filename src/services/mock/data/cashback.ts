import type { CashbackEntry } from '@/services/types/cashback';

/** Verbatim from the design's `CASHBACK` ledger — earns, a withdrawal and a clawback. */
export const MOCK_CASHBACK_ENTRIES: CashbackEntry[] = [
  {
    id: 'RWD-441290', mark: 'NG', name: 'Moved to NGN wallet', meta: 'Withdrawal · 16 Aug',
    amt: '−₦2,000', tint: '#dfe7ff', dir: 'out',
    ref: 'RWD-441290', channel: 'Rewards balance → NGN wallet', reward: true, fee: 'Free',
    date: '16 Aug 2026, 14:22', status: 'Completed', note: 'Confirmed with your transaction PIN',
  },
  {
    id: 'RWD-441105', mark: 'FG', name: 'Figma refund reversal', meta: 'Card spend refunded · 15 Aug',
    amt: '−₦230', tint: '#f6e2f4', dir: 'out',
    ref: 'RWD-441105', channel: 'Reward clawback on VTX-877401', reward: true, fee: 'Free',
    date: '15 Aug 2026, 09:40', status: 'Completed',
    note: 'The original card charge was refunded, so its cashback was taken back',
  },
  {
    id: 'RWD-441028', mark: 'IE', name: 'Ikeja Electric', meta: 'Utility · 1% back',
    amt: '+₦150', tint: '#fff0cf', dir: 'in',
    ref: 'RWD-441028', channel: 'Reward on VTX-881277 · Ikeja Electric', reward: true,
    rate: '1% of ₦15,000', fee: 'Free', date: '17 Aug 2026, 19:43', spend: '₦15,000',
    status: 'Paid to rewards balance', note: 'Prepaid electricity token, meter 4512889',
  },
  {
    id: 'RWD-440917', mark: 'MT', name: 'MTN airtime', meta: 'Airtime · 2% back',
    amt: '+₦100', tint: '#e2f4e6', dir: 'in',
    ref: 'RWD-440917', channel: 'Reward on VTX-879544 · MTN top-up', reward: true,
    rate: '2% of ₦5,000', fee: 'Free', date: '16 Aug 2026, 08:12', spend: '₦5,000',
    status: 'Paid to rewards balance', note: 'Airtime for 0801 234 5678',
  },
  {
    id: 'RWD-440380', mark: 'FG', name: 'Figma', meta: 'Card spend · 1% back',
    amt: '+₦230', tint: '#f6e2f4', dir: 'in',
    ref: 'RWD-440380', channel: 'Reward on VTX-877401 · Everyday card ···2214', reward: true,
    rate: '1% of $15.00', fee: 'Free', date: '14 Aug 2026, 11:31', spend: '$15.00',
    status: 'Paid to rewards balance', note: 'Converted at ₦1,533 to the dollar',
  },
  {
    id: 'RWD-439802', mark: 'DS', name: 'DStv', meta: 'Cable · 1.5% back',
    amt: '+₦180', tint: '#dfe7ff', dir: 'in',
    ref: 'RWD-439802', channel: 'Reward on VTX-874120 · DStv Compact', reward: true,
    rate: '1.5% of ₦12,000', fee: 'Free', date: '11 Aug 2026, 20:04', spend: '₦12,000',
    status: 'Pending until the 15th', note: 'Smartcard 7028 449 155',
  },
];
