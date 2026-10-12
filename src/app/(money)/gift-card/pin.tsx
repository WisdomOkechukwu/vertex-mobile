import { router } from 'expo-router';

import { TransactionPinScreen } from '@/components/money/transaction-pin-screen';
import { formatMoneyCompact } from '@/lib/format';
import { usePendingTxStore } from '@/stores/pending-tx-store';

/** The PIN gate every money flow ends with. The summary names the card, not the wallet charge. */
export default function GiftCardPinScreen() {
  const draft = usePendingTxStore((s) => s.draft);
  const summary = draft
    ? `${draft.target} · ${formatMoneyCompact(draft.amount, draft.asset ?? 'NGN')}`
    : undefined;

  return (
    <TransactionPinScreen summary={summary} onSuccess={() => router.replace('/(money)/gift-card/result')} />
  );
}
