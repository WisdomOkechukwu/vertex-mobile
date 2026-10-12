import type { Asset } from '@/services/types/wallets';

/** Verbatim from the design's `ASSETS` array. */
export const MOCK_ASSETS: Asset[] = [
  { code: 'NGN', name: 'Nigerian naira', kind: 'fiat', bal: 482650, rate: 1, sym: '₦', tint: '#e2f4e6', change: null },
  { code: 'USD', name: 'US dollar', kind: 'fiat', bal: 168.4, rate: 1533, sym: '$', tint: '#dfe7ff', change: '+0.4%' },
  { code: 'GBP', name: 'Pound sterling', kind: 'fiat', bal: 40, rate: 1962, sym: '£', tint: '#f6e2f4', change: '−0.2%' },
  { code: 'EUR', name: 'Euro', kind: 'fiat', bal: 0, rate: 1671, sym: '€', tint: '#fff0cf', change: '+0.1%' },
  { code: 'BTC', name: 'Bitcoin', kind: 'crypto', bal: 0.0142, rate: 96_400_000, sym: '₿', tint: '#ffe3d8', change: '+2.8%' },
  { code: 'USDT', name: 'Tether', kind: 'crypto', bal: 240.5, rate: 1531, sym: '₮', tint: '#e2f4e6', change: '0.0%' },
  { code: 'USDC', name: 'USD Coin', kind: 'crypto', bal: 85, rate: 1532, sym: '$', tint: '#dfe7ff', change: '0.0%' },
];

/** The design's `BAL` — the NGN wallet balance shown on Home. */
export const MOCK_PRIMARY_BALANCE = 482650;

/**
 * The on-chain networks each crypto wallet can send over, from `design/send money/sending btc-2.png`
 * and `sending-usdt-2.png` / `sending-usdc-2.png`. The sublabels are the references' own wording.
 *
 * This lives here rather than in the send route because the picker sheet needs the sublabel and mark
 * per network, not just a name — and because every other fixture in the app is a `mock/data` file.
 */
export type CryptoNetwork = {
  label: string;
  sublabel: string;
  /** A glyph instead of initials, where the reference shows one (Lightning's bolt). */
  icon?: 'bolt';
};

const EVM_NETWORKS: CryptoNetwork[] = [
  { label: 'TRC-20', sublabel: 'Tron · cheapest · ~1 min' },
  { label: 'ERC-20', sublabel: 'Ethereum · higher gas fee' },
  { label: 'BEP-20', sublabel: 'BNB Chain · low fee' },
  { label: 'Solana', sublabel: 'Fast · very low fee' },
];

export const MOCK_NETWORKS: Record<string, CryptoNetwork[]> = {
  BTC: [
    { label: 'Bitcoin', sublabel: 'Native · 2 confirmations · ~10 min' },
    { label: 'Lightning', sublabel: 'Instant · low fee · small amounts', icon: 'bolt' },
  ],
  USDT: EVM_NETWORKS,
  USDC: EVM_NETWORKS,
};

/** The networks for `code`, defaulting to the stablecoin set. */
export function networksFor(code: string): CryptoNetwork[] {
  return MOCK_NETWORKS[code] ?? EVM_NETWORKS;
}
