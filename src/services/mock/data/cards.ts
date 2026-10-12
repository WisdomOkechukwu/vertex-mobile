import { DebitBrandTints } from '@/constants/colors';
import type { Card, LinkedCard } from '@/services/types/cards';
import type { Transaction } from '@/services/types/transactions';

/** Verbatim from the design's initial `state.cards`. */
export const MOCK_VIRTUAL_CARDS: Card[] = [
  {
    id: 'vc_everyday', name: 'Everyday', color: '#ec3013', currency: 'USD',
    last4: '2214', full: '5399 4412 8830 2214', exp: '09/29', cvv: '884',
    frozen: false, spent: 65.5, funded: 200, limit: 500,
  },
  {
    id: 'vc_subs', name: 'Subscriptions', color: '#4338ca', currency: 'USD',
    last4: '7781', full: '5399 8820 4417 7781', exp: '03/28', cvv: '210',
    frozen: false, spent: 42, funded: 60, limit: 150,
  },
];

/**
 * Card spend per virtual card, from the design's `CARD_TX`.
 *
 * Full `Transaction` records rather than a display-only shape: `design/virtual card/on click of
 * transaction.png` opens the shared detail screen from these rows, which needs a reference, channel,
 * fee and date. `transactionsMockApi.getById` searches this map too.
 */
export const MOCK_CARD_ACTIVITY: Record<string, Transaction[]> = {
  vc_everyday: [
    {
      id: 'VTX-877401', mark: 'FG', name: 'Figma', time: '14 Aug · 11:30',
      amt: '−$15.00', kind: 'Card', status: 'success', dir: 'out', tint: '#f6e2f4',
      ref: 'VTX-877401', channel: 'Everyday card · 2214', fee: '$0.00',
      date: '14 Aug 2026, 11:30', note: 'Recurring · monthly', cashback: '$0.15',
    },
    {
      id: 'VTX-876220', mark: 'AW', name: 'Amazon Web Services', time: '11 Aug · 02:04',
      amt: '−$42.30', kind: 'Card', status: 'success', dir: 'out', tint: '#fff0cf',
      ref: 'VTX-876220', channel: 'Everyday card · 2214', fee: '$0.00',
      date: '11 Aug 2026, 02:04', note: 'Cloud hosting · monthly', cashback: '$0.42',
    },
    {
      id: 'VTX-875014', mark: 'UB', name: 'Uber', time: '09 Aug · 21:47',
      amt: '−$8.20', kind: 'Card', status: 'success', dir: 'out', tint: '#e2f4e6',
      ref: 'VTX-875014', channel: 'Everyday card · 2214', fee: '$0.00',
      date: '09 Aug 2026, 21:47', note: 'Trip in Lagos', cashback: '$0.08',
    },
    {
      id: 'VTX-873001', mark: 'TU', name: 'Top-up from NGN wallet', time: '01 Aug · 08:00',
      amt: '+$200.00', kind: 'Card', status: 'success', dir: 'in', tint: '#dfe7ff',
      ref: 'VTX-873001', channel: 'NGN wallet → Everyday card', fee: 'Free',
      date: '01 Aug 2026, 08:00', note: 'Converted at ₦1,533 to the dollar', cashback: '',
    },
  ],
  vc_subs: [
    {
      id: 'VTX-876501', mark: 'NF', name: 'Netflix', time: '12 Aug · 00:12',
      amt: '−$15.49', kind: 'Card', status: 'success', dir: 'out', tint: '#ffe3d8',
      ref: 'VTX-876501', channel: 'Subscriptions card · 7781', fee: '$0.00',
      date: '12 Aug 2026, 00:12', note: 'Recurring · monthly', cashback: '$0.15',
    },
    {
      id: 'VTX-874880', mark: 'NO', name: 'Notion', time: '06 Aug · 14:20',
      amt: '−$10.00', kind: 'Card', status: 'success', dir: 'out', tint: '#dfe7ff',
      ref: 'VTX-874880', channel: 'Subscriptions card · 7781', fee: '$0.00',
      date: '06 Aug 2026, 14:20', note: 'Recurring · monthly', cashback: '$0.10',
    },
    {
      id: 'VTX-874102', mark: 'AD', name: 'Adobe', time: '03 Aug · 09:41',
      amt: '−$16.51', kind: 'Card', status: 'success', dir: 'out', tint: '#f6e2f4',
      ref: 'VTX-874102', channel: 'Subscriptions card · 7781', fee: '$0.00',
      date: '03 Aug 2026, 09:41', note: 'Recurring · monthly', cashback: '$0.16',
    },
    {
      id: 'VTX-873002', mark: 'TU', name: 'Top-up from NGN wallet', time: '01 Aug · 08:02',
      amt: '+$60.00', kind: 'Card', status: 'success', dir: 'in', tint: '#e2f4e6',
      ref: 'VTX-873002', channel: 'NGN wallet → Subscriptions card', fee: 'Free',
      date: '01 Aug 2026, 08:02', note: 'Converted at ₦1,533 to the dollar', cashback: '',
    },
  ],
};

/** `design/add money/select debit card.png`, down to the brands, banks, last four and expiry dates. */
export const MOCK_DEBIT_CARDS: LinkedCard[] = [
  { id: 'dc_gt', brand: 'Verve', bank: 'GTBank', last4: '4417', exp: '08/28', tint: DebitBrandTints.Verve, primary: true },
  { id: 'dc_access', brand: 'Mastercard', bank: 'Access Bank', last4: '9032', exp: '11/27', tint: DebitBrandTints.Mastercard, primary: false },
];
