import { ResultScreen } from '@/components/money/result-screen';

/**
 * A gift card settles instantly — the code exists the moment the charge clears — so only the success
 * copy is overridden. The receipt's share button already routes to the ledger entry, and the code
 * itself lives on `/gift-cards/card/[id]`.
 */
export default function GiftCardResultScreen() {
  return (
    <ResultScreen
      copy={{
        success: {
          title: 'Gift card bought',
          note: 'Your code is ready. Find it any time under Your gift cards.',
        },
      }}
    />
  );
}
