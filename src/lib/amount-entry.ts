/**
 * The keypad reducer every amount surface shares.
 *
 * ## Why the entry is a string, not minor units
 *
 * It used to accumulate minor units and divide by 100, which fixed the step at 0.01 and always
 * rendered two decimals. That could not produce either of the things the references show: the
 * `.` key on `design/utility/amount-1.png`, or its unpadded `$84.2`. It also made a BTC balance of
 * `0.0142` literally unreachable. So what the user typed is kept verbatim and parsed on read.
 *
 * Lifted out of `amount-entry-screen.tsx` once the swap screen grew a near-identical copy that had
 * already drifted — the two disagreed on whether `.` was accepted on a whole-currency screen.
 */

/** The most digits any figure in the app can carry, decimal point excluded. */
const MAX_DIGITS = 12;

export function appendKey(prev: string, key: string, maxDecimals: number): string {
  // A decimal point is meaningless on a whole currency, whatever key the pad happens to be showing.
  if (key === '.') return prev.includes('.') || !maxDecimals ? prev : `${prev || '0'}.`;
  // `00` is a shortcut, not a way to type "00" — it needs a leading digit to append to.
  if (key === '00' && (prev === '' || prev === '0')) return prev;

  const [, decimals] = prev.split('.');
  if (decimals != null && decimals.length + key.length > maxDecimals) return prev;
  if (prev.replace('.', '').length + key.length > MAX_DIGITS) return prev;

  // A leading zero is only meaningful before a decimal point.
  return prev === '0' ? key : prev + key;
}

export function backspace(prev: string): string {
  return prev.slice(0, -1);
}

/** A number rendered back into an entry string — used when the swap flip re-quotes the typed leg. */
export function toEntry(value: number, maxDecimals: number): string {
  if (!value) return '';
  return String(Number(value.toFixed(maxDecimals)));
}
