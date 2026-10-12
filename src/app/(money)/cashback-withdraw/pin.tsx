import { router } from 'expo-router';

import { TransactionPinScreen } from '@/components/money/transaction-pin-screen';
import { formatMoneyCompact } from '@/lib/format';
import { usePendingTxStore } from '@/stores/pending-tx-store';

/**
 * `design/security/rewards-move-to-naira-3.png`. Cashback used to leave the rewards balance with no
 * PIN at all, which is the one control the reference puts on it.
 */
export default function CashbackWithdrawPinScreen() {
  const draft = usePendingTxStore((s) => s.draft);
  const summary = draft ? `${formatMoneyCompact(draft.amount, 'NGN')} · ${draft.label}` : undefined;

  return (
    <TransactionPinScreen
      summary={summary}
      onSuccess={() => router.replace('/(money)/cashback-withdraw/result')}
    />
  );
}
