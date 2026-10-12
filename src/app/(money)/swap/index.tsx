import { router } from 'expo-router';
import { useState } from 'react';

import { CurrencyPairEntry } from '@/components/money/currency-pair-entry';
import { useFirstRunTour } from '@/hooks/use-first-run-tour';
import { usePendingTxStore } from '@/stores/pending-tx-store';

/**
 * Swap, from `design/add money/on click of swap.png`.
 *
 * The screen is now a thin wrapper: the legs, the flip, the rate card, the percentage chips and the
 * keypad all live in `CurrencyPairEntry`, which Vertex transfer shares.
 *
 * The flow used to be entry → *a second amount screen* → PIN, with no confirmation step: you typed a
 * figure here, then were asked for the same amount again in the other currency and it was
 * back-converted. Now both amounts are known from one screen and the next step confirms them.
 */
export default function SwapScreen() {
  useFirstRunTour('internal');
  const setDraft = usePendingTxStore((s) => s.setDraft);

  const [fromCode, setFromCode] = useState('NGN');
  const [toCode, setToCode] = useState('USDC');

  return (
    <CurrencyPairEntry
      title="Swap"
      payLabel="You pay"
      receiveLabel="You receive"
      fromCode={fromCode}
      toCode={toCode}
      onFromChange={setFromCode}
      onToChange={setToCode}
      onContinue={({ fromAmount, toAmount }) => {
        setDraft({
          kind: 'swap',
          label: `Swap ${fromCode} → ${toCode}`,
          // Human, not a machine key. The pair travels in `meta`, as every other flow's does — the
          // old `NGN->USDC` target had to be re-parsed downstream and hidden from the PIN screen.
          target: `${fromCode} → ${toCode}`,
          amount: fromAmount,
          fee: '0.5%',
          ctaLabel: 'Swap',
          needPin: true,
          asset: fromCode,
          meta: { fromCode, toCode, receiveAmount: String(toAmount) },
        });
        router.push('/(money)/swap/review');
      }}
    />
  );
}
