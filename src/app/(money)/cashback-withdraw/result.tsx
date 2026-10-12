import { ResultScreen } from '@/components/money/result-screen';

/** `design/security/rewards-move-to-naira-4.png` — the receipt for a cashback move. */
export default function CashbackWithdrawResultScreen() {
  return (
    <ResultScreen
      copy={{
        success: {
          title: 'Cashback moved',
          note: 'It is in your NGN wallet and ready to spend.',
        },
      }}
    />
  );
}
