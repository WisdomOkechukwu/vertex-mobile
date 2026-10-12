import { formatMoneyCompact, initialsOf } from '@/lib/format';
import type { PaymentLink } from '@/services/types/links';
import type { Transaction } from '@/services/types/transactions';

/**
 * Matches `design/payment links/home.png`: three links totalling ₦393,500 collected, two active and
 * one paused, on `vertex.ng/adaeze/…` URLs.
 */
export const MOCK_LINKS: PaymentLink[] = [
  {
    id: 'retainer-sept',
    title: 'Design retainer · September',
    slug: 'vertex.ng/adaeze/retainer-sept',
    amount: 250000,
    paid: 250000,
    count: 1,
    active: true,
    created: '01 Aug 2026',
    payers: [{ name: 'Bolt Studio', meta: 'Card payment · 02 Aug, 11:14', amt: 250000, tint: '#dfe7ff', ref: 'LNK-620114' }],
  },
  {
    id: 'ankara-dress',
    title: 'Ankara dress · made to order',
    slug: 'vertex.ng/adaeze/ankara-dress',
    amount: 45000,
    paid: 135000,
    count: 3,
    active: true,
    created: '08 Aug 2026',
    payers: [
      { name: 'Ngozi Eze', meta: 'Bank transfer · 09 Aug, 16:40', amt: 45000, tint: '#e2f4e6', ref: 'LNK-621640' },
      { name: 'Halima Yusuf', meta: 'Card payment · 11 Aug, 10:02', amt: 45000, tint: '#fff0cf', ref: 'LNK-622002' },
      { name: 'Tunde Bello', meta: 'Vertex transfer · 14 Aug, 19:20', amt: 45000, tint: '#f6e2f4', ref: 'LNK-623920' },
    ],
  },
  {
    id: 'coffee',
    title: 'Buy me a coffee',
    // An open-amount link: the payer decides, so `amount` is 0.
    slug: 'vertex.ng/adaeze/coffee',
    amount: 0,
    paid: 8500,
    count: 3,
    active: false,
    created: '19 Jul 2026',
    payers: [
      { name: 'Chidi Kalu', meta: 'Card payment · 20 Jul, 08:31', amt: 3000, tint: '#ffe3d8', ref: 'LNK-610831' },
      { name: 'Amaka Kalu', meta: 'Card payment · 22 Jul, 12:09', amt: 3000, tint: '#dfe7ff', ref: 'LNK-611209' },
      { name: 'Emeka Nwosu', meta: 'Vertex transfer · 28 Jul, 17:55', amt: 2500, tint: '#e2f4e6', ref: 'LNK-612755' },
    ],
  },
];

/**
 * The link payments as ledger records, derived from the payers above so the two cannot drift.
 * `transactionsMockApi.getById` searches these, which is what makes the payer chevron on
 * `design/payment links/view link.png` open the shared transaction detail screen.
 */
export const MOCK_LINK_PAYMENTS: Transaction[] = MOCK_LINKS.flatMap((link) =>
  link.payers.map((p) => {
    // "Card payment · 02 Aug, 11:14" -> channel "Card payment", stamp "02 Aug 2026, 11:14".
    const [rail, when = ''] = p.meta.split('·').map((part) => part.trim());
    const [day, clock = ''] = when.split(',').map((part) => part.trim());
    return {
      id: p.ref,
      mark: initialsOf(p.name),
      name: p.name,
      time: p.meta,
      amt: `+${formatMoneyCompact(p.amt, 'NGN')}`,
      kind: 'Received' as const,
      status: 'success' as const,
      dir: 'in' as const,
      tint: p.tint,
      ref: p.ref,
      channel: `${rail} · payment link`,
      fee: 'Free',
      date: `${day} 2026, ${clock}`,
      note: link.title,
      cashback: '',
    };
  })
);
