import { router } from 'expo-router';

import { AmountEntryScreen } from '@/components/money/amount-entry-screen';
import { useWalletStore } from '@/stores/wallet-store';
import { usePendingTxStore } from '@/stores/pending-tx-store';

export default function SendAmountScreen() {
  const draft = usePendingTxStore((s) => s.draft);
  const updateDraft = usePendingTxStore((s) => s.updateDraft);
  const getAsset = useWalletStore((s) => s.getAsset);
  const asset = getAsset(draft?.asset ?? 'NGN');

  return (
    <AmountEntryScreen
      title="Amount"
      currencyCode={asset?.code ?? 'NGN'}
      balance={asset?.bal}
      target={draft?.target}
      feeLabel={draft?.fee}
      onContinue={(amount) => {
        updateDraft({ amount });
        router.push('/(money)/send/review');
      }}
    />
  );
}
