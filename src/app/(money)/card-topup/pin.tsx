import { router } from 'expo-router';

import { TransactionPinScreen } from '@/components/money/transaction-pin-screen';
import { formatMoneyCompact } from '@/lib/format';
import { usePendingTxStore } from '@/stores/pending-tx-store';

/**
 * `design/virtual card/pin.png` — the step that was missing: card top-ups used to commit straight
 * from the sheet with no authorisation and no receipt. The reference's summary names the amount, the
 * card and the wallet it is coming out of: "$50.00 to Everyday · from EUR wallet".
 */
export default function CardTopUpPinScreen() {
  const draft = usePendingTxStore((s) => s.draft);
  const cardName = draft?.target?.replace(/^Top up /, '');
  const from = draft?.meta?.fromCode;
  const summary = draft
    ? [
        `${formatMoneyCompact(draft.amount, draft.asset ?? 'USD')}${cardName ? ` to ${cardName}` : ''}`,
        from ? `from ${from} wallet` : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : undefined;

  return (
    <TransactionPinScreen summary={summary} onSuccess={() => router.replace('/(money)/card-topup/result')} />
  );
}
