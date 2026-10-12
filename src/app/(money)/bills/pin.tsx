import { router } from 'expo-router';

import { TransactionPinScreen } from '@/components/money/transaction-pin-screen';
import { formatMoneyCompact } from '@/lib/format';
import { usePendingTxStore } from '@/stores/pending-tx-store';

/**
 * `design/utility/pin.png` wraps the whole payment onto two lines —
 * "$84.20 · Ikeja Electric · 4512 8890 231 · from USD wallet" — so the amount is prepended to the
 * draft's target rather than left to the default label/target join.
 */
export default function BillPinScreen() {
  const draft = usePendingTxStore((s) => s.draft);
  const amount = draft ? formatMoneyCompact(draft.amount, draft.asset ?? 'NGN') : '';
  const summary = [amount, draft?.target].filter(Boolean).join(' · ');

  return (
    <TransactionPinScreen
      summary={summary || undefined}
      onSuccess={() => router.replace('/(money)/bills/result')}
    />
  );
}
