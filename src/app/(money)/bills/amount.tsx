import { router } from 'expo-router';

import { AmountEntryScreen } from '@/components/money/amount-entry-screen';
import { usePendingTxStore } from '@/stores/pending-tx-store';
import { useWalletStore } from '@/stores/wallet-store';

/**
 * `design/utility/amount.png` and `amount-1.png`: the header is the bill's own title, the target line
 * carries provider, reference and funding wallet, and the CTA reads "Review payment".
 */
export default function BillAmountScreen() {
  const draft = usePendingTxStore((s) => s.draft);
  const updateDraft = usePendingTxStore((s) => s.updateDraft);
  const getAsset = useWalletStore((s) => s.getAsset);
  // The wallet the user picked in "Pay from", not a hardcoded NGN — the reference pays a naira bill
  // out of a USD wallet and shows `$` throughout.
  const asset = getAsset(draft?.asset ?? 'NGN');

  return (
    <AmountEntryScreen
      title={draft?.meta?.billTitle ?? draft?.label ?? 'Amount'}
      currencyCode={asset?.code ?? 'NGN'}
      balance={asset?.bal}
      target={draft?.target}
      feeLabel={draft?.fee}
      ctaLabel="Review payment"
      onContinue={(amount) => {
        updateDraft({ amount });
        router.push('/(money)/bills/review');
      }}
    />
  );
}
