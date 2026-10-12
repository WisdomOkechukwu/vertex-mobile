import { ResultScreen } from '@/components/money/result-screen';

/**
 * `design/add money/payment process after pin.png` — a card charge clears through the acquirer, so
 * this lands on the pending receipt rather than an instant one (`settlementStatusFor` rates the
 * `deposit` rail as slow).
 */
export default function CardDepositResultScreen() {
  return (
    <ResultScreen
      copy={{
        pending: {
          title: 'Payment pending',
          note: 'Your bank is authorising the charge. The money lands in your wallet as soon as it clears.',
          status: 'Pending confirmation',
        },
        success: { title: 'Money added', note: 'It is in your wallet and ready to spend.' },
      }}
    />
  );
}
