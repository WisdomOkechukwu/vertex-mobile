import { router } from 'expo-router';

import { AmountEntryScreen } from '@/components/money/amount-entry-screen';
import { usePendingTxStore } from '@/stores/pending-tx-store';
import { useWalletStore } from '@/stores/wallet-store';

/**
 * `design/add money/top up via card.png`: "Top up {code}" over "From Mastercard ···4659 · into your
 * USDC wallet", with "Charge my card" as the CTA.
 *
 * This file was orphaned — nothing routed to it — until `cards/debit/index.tsx` grew a working CTA.
 *
 * `direction="credit"`: the reference's footnote reads "Balance after ₦5,001,371,538.00" against a
 * ₦482,650 wallet — it *adds* the top-up — and its CTA is live well past the balance, because a card
 * charge is not bounded by what the wallet already holds.
 */
export default function DepositAmountScreen() {
  const draft = usePendingTxStore((s) => s.draft);
  const updateDraft = usePendingTxStore((s) => s.updateDraft);
  const getAsset = useWalletStore((s) => s.getAsset);
  const code = draft?.asset ?? 'NGN';
  const asset = getAsset(code);

  return (
    <AmountEntryScreen
      title={`Top up ${code}`}
      currencyCode={code}
      balance={asset?.bal}
      direction="credit"
      target={draft?.target}
      feeLabel={draft?.fee}
      ctaLabel={draft?.ctaLabel ?? 'Add money'}
      onContinue={(amount) => {
        updateDraft({ amount });
        router.push('/(money)/card-deposit/pin');
      }}
    />
  );
}
