import { router } from 'expo-router';

import { TransactionPinScreen } from '@/components/money/transaction-pin-screen';
import { formatMoneyCompact } from '@/lib/format';
import { usePendingTxStore } from '@/stores/pending-tx-store';

/**
 * `design/add money/swap pin.png` recaps the swap as an amount and a route:
 * "₦50,000 · ₦50,000 → $32.64".
 *
 * The summary is still passed explicitly, but for a different reason than before: the draft's `target`
 * is now human (`"NGN → USDC"`), so the shared screen's default `target · label` line would read
 * "NGN → USDC · Swap NGN → USDC". The reference states the figures, so state them.
 */
export default function SwapPinScreen() {
  const draft = usePendingTxStore((s) => s.draft);
  const fromCode = draft?.meta?.fromCode ?? draft?.asset ?? 'NGN';
  const toCode = draft?.meta?.toCode ?? fromCode;
  const received = Number(draft?.meta?.receiveAmount ?? 0);

  const summary = draft
    ? `${formatMoneyCompact(draft.amount, fromCode)} → ${formatMoneyCompact(received, toCode)}`
    : undefined;

  return (
    <TransactionPinScreen summary={summary} onSuccess={() => router.replace('/(money)/swap/result')} />
  );
}
