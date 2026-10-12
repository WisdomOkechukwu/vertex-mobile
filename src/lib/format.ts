const SYMBOLS: Record<string, string> = { NGN: '₦', USD: '$', GBP: '£', EUR: '€', BTC: '₿', USDT: '₮', USDC: '$' };

export function symbolFor(code: string): string {
  return SYMBOLS[code] ?? code;
}

/**
 * The currency's own name, as the design writes it — the wallet tile reads "Naira balance", not
 * "Nigerian balance" (which is what you get from splitting the asset's full name "Nigerian naira").
 */
const CURRENCY_NAMES: Record<string, string> = {
  NGN: 'Naira',
  USD: 'Dollar',
  GBP: 'Pound',
  EUR: 'Euro',
  BTC: 'Bitcoin',
  USDT: 'Tether',
  USDC: 'USD Coin',
};

export function currencyName(code: string): string {
  return CURRENCY_NAMES[code] ?? code;
}

/**
 * How many decimal places a currency carries, both for typing and for display.
 *
 * **Eight for Bitcoin**, because a ₿0.0142 balance is otherwise unreachable. **Zero for naira**:
 * every naira figure in the references is whole (`design/add money/top up via card.png`,
 * `design/security/rewards-move-to-naira-1.png`), and both of those screens draw a `00` key where the
 * dollar screens (`design/utility/amount-1.png`) draw a `.`. **Two for everything else, stablecoins
 * included** — the references quote them as the dollars they track (`₮240.50`, `$85.00`), and giving
 * USDC eight put `$32.63707572` on the swap screen.
 */
export function decimalsFor(code: string): number {
  if (code === 'BTC') return 8;
  return code === 'NGN' ? 0 : 2;
}

/**
 * Thousands-groups the whole part of a live entry string, leaving any decimal tail — and a trailing
 * point mid-typing — alone. `design/add money/swap amount display.png` shows `₦129,079` and
 * `top up via card.png` shows `₦5,000,888,888`, so the figure is grouped as it is typed.
 */
export function groupDigits(entry: string): string {
  if (!entry) return '0';
  const [whole, decimals] = entry.split('.');
  const grouped = Number(whole || '0').toLocaleString('en-NG');
  return decimals != null ? `${grouped}.${decimals}` : entry.endsWith('.') ? `${grouped}.` : grouped;
}

/** The bottom-left keypad cell that goes with `decimalsFor` — a point, or `00` for whole currencies. */
export function keypadExtraFor(code: string): 'decimal' | 'double-zero' {
  return decimalsFor(code) > 0 ? 'decimal' : 'double-zero';
}

/**
 * `signed` prefixes a "+" on positives as well as the "−" on negatives — the history list's per-day
 * totals read "+₦419,601" / "−₦70,000".
 */
export function formatMoney(amount: number, code = 'NGN', opts?: { signed?: boolean }): string {
  const sym = symbolFor(code);
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    // Bitcoin is the one currency the app holds at a scale two decimals cannot show: a ₿0.0142
    // balance rendered as "₿0.01" on every screen that quoted it.
    maximumFractionDigits: Math.max(2, decimalsFor(code)),
  });
  const sign = amount < 0 ? '−' : opts?.signed ? '+' : '';
  return `${sign}${sym}${formatted}`;
}

/** Like `formatMoney`, but drops a trailing ".00" — the design writes "$500 monthly limit". */
export function formatMoneyCompact(amount: number, code = 'NGN', opts?: { signed?: boolean }): string {
  return formatMoney(amount, code, opts).replace(/\.00$/, '');
}

/** First letter of each of the first two words — "Design retainer · September" → "DR". */
export function initialsOf(text: string): string {
  return text
    .split(/\s+/)
    .filter((w) => /^[a-z0-9]/i.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function maskCardNumber(full: string, revealed = false): string {
  const clean = full.replace(/\s/g, '');
  if (revealed) return clean.replace(/(.{4})/g, '$1 ').trim();
  return `•••• •••• •••• ${clean.slice(-4)}`;
}

export function formatDate(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatTime(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

/** The host every payment link lives under, as `design/payment links/home.png` writes it. */
export const LINK_HOST = 'vertex.ng';

/**
 * A payment link's public URL — `vertex.ng/adaeze/retainer-sept`. Both the create form's live
 * preview and the mock backend mint slugs through here so a new link matches the seeded ones.
 *
 * Capped at 24 characters on a **word** boundary: a hard slice leaves things like
 * `design-retainer-septembe`.
 */
export function linkSlug(tag: string, title: string): string {
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);

  const kept: string[] = [];
  for (const word of words) {
    const next = [...kept, word].join('-');
    if (kept.length && next.length > 24) break;
    kept.push(word);
  }
  return `${LINK_HOST}/${tag}/${kept.join('-').slice(0, 24) || 'your-link'}`;
}
