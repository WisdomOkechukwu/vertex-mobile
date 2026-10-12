import { router } from 'expo-router';

import { TransactionPinScreen } from '@/components/money/transaction-pin-screen';
import { formatMoneyCompact } from '@/lib/format';
import { usePendingTxStore } from '@/stores/pending-tx-store';

/** `design/add money/top up from card pin.png`. */
export default function CardDepositPinScreen() {
  const draft = usePendingTxStore((s) => s.draft);
  const summary = draft
    ? `${formatMoneyCompact(draft.amount, draft.asset ?? 'NGN')} · ${draft.label}`
    : undefined;

  return (
    <TransactionPinScreen summary={summary} onSuccess={() => router.replace('/(money)/card-deposit/result')} />
  );
}
