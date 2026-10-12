import { router } from 'expo-router';
import { useState } from 'react';

import { CurrencyPairEntry } from '@/components/money/currency-pair-entry';
import { usePendingTxStore } from '@/stores/pending-tx-store';

/**
 * `design/vertex transfer/vertex-send amount input.png`, rebuilt as a two-leg screen.
 *
 * A Vertex transfer can be cross-currency — you send USDC, they receive naira — and the single-figure
 * amount screen this replaced could only ever show one side of that. The pair is chosen here rather
 * than back on the recipient screen, next to the figures it governs.
 */
export default function InternalTransferAmountScreen() {
  const draft = usePendingTxStore((s) => s.draft);
  const updateDraft = usePendingTxStore((s) => s.updateDraft);

  const [fromCode, setFromCode] = useState(draft?.asset ?? 'NGN');
  const [toCode, setToCode] = useState(draft?.meta?.toCode ?? 'NGN');

  const recipient = draft?.target ?? '';
  const firstName = recipient.split(' ')[0];
  const tag = draft?.meta?.tag;

  return (
    <CurrencyPairEntry
      title={firstName ? `To ${firstName}` : 'Amount'}
      target={[recipient, tag].filter(Boolean).join(' · ') || undefined}
      payLabel="You send"
      receiveLabel="They receive"
      fromCode={fromCode}
      toCode={toCode}
      onFromChange={setFromCode}
      onToChange={setToCode}
      // A Vertex transfer is free and instant, so there is no rate card to justify — the flow states
      // that in a line instead, as `to vertex user.png` does.
      showRate={false}
      allowSameCurrency
      showReceiveBalance={false}
      footnote="Instant and free between Vertex accounts."
      feeLabel="Free"
      ctaLabel="Review transfer"
      sheetBadge="code"
      onContinue={({ fromAmount, toAmount }) => {
        updateDraft({
          amount: fromAmount,
          asset: fromCode,
          meta: { ...draft?.meta, toCode, receiveAmount: String(toAmount) },
        });
        router.push('/(money)/internal-transfer/review');
      }}
    />
  );
}
