import { CurrencyBadge } from '@/components/ui/picker-field';
import { formatMoney } from '@/lib/format';
import type { CryptoNetwork } from '@/services/mock/data/assets';
import type { Asset } from '@/services/types/wallets';
import type { PickerOption } from '@/stores/ui-store';

/**
 * Wallet rows for a "Send from" / "Pay from" / "Fund the card from" picker sheet.
 *
 * `design/send money/send from dropdown.png`, `design/utility/pay from.png` and
 * `design/virtual card/fund-2.png` all show `NGN wallet` over `₦482,650.00 available`.
 *
 * The disc is `badgeLabel`, not a tinted `CurrencyBadge`: sampled off all three, a sheet row's disc
 * is `key` grey with the code in the accent — the wallet's own tint appears on the `PickerField` that
 * *opens* the sheet, not on the rows inside it.
 */
export function walletOptions(assets: Asset[]): PickerOption[] {
  return assets.map((a) => ({
    label: `${a.code} wallet`,
    sublabel: `${formatMoney(a.bal, a.code)} available`,
    badgeLabel: a.code,
    value: a.code,
  }));
}

/**
 * Currency rows for the pair pickers — swap's "You pay" / "You receive"
 * (`design/add money/swap from.png`, `swap to.png`) and Vertex transfer's "You send" / "They receive"
 * (`design/vertex transfer/vertex-send on click of you send.png`, `…they  recieve.png`).
 *
 * A different row from `walletOptions`: the code alone is the title and the currency's name carries
 * the balance, rather than "NGN wallet" over "₦482,650.00 available". Pass `balance: false` for the
 * recipient side — "They receive" shows only the name, because your balance is not what they get, and
 * `variant: 'symbol'` for the swap sheets, which draw a glyph squircle rather than a code disc.
 */
export function currencyOptions(
  assets: Asset[],
  opts?: { balance?: boolean; variant?: 'code' | 'symbol' }
): PickerOption[] {
  return assets.map((a) => ({
    label: a.code,
    sublabel: opts?.balance === false ? a.name : `${a.name} · ${formatMoney(a.bal, a.code)}`,
    // The swap sheets tint the disc and set the glyph in it; the Vertex pair uses the same grey
    // code disc as the wallet sheets. Both sampled off their references.
    ...(opts?.variant === 'symbol'
      ? { badge: <CurrencyBadge code={a.code} tint={a.tint} variant="symbol" /> }
      : { badgeLabel: a.code }),
    value: a.code,
  }));
}

/**
 * The two-letter mark for a bank or bill provider — "Ikeja Electric" → "IE", "GTBank" → "GT". The
 * references use word initials where there are two words and the first two characters where there
 * is one.
 */
export function initialsFor(name: string): string {
  const words = name.split(/\s+/).filter((w) => /^[a-z0-9]/i.test(w));
  if (words.length > 1) return words.slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/** Provider/bank rows: the name over a category line, with a monogram disc. */
export function namedOptions(names: string[], sublabel?: string): PickerOption[] {
  return names.map((n) => ({ label: n, sublabel, badgeLabel: initialsFor(n), value: n }));
}

/** Network rows for the "Send over" sheet — `design/send money/sending-usdt-2.png`. */
export function networkOptions(networks: CryptoNetwork[]): PickerOption[] {
  return networks.map((n) => ({
    label: n.label,
    sublabel: n.sublabel,
    badgeIcon: n.icon,
    badgeLabel: n.icon ? undefined : n.label[0].toUpperCase(),
    value: n.label,
  }));
}
