import { ResultScreen } from '@/components/money/result-screen';

export default function SwapResultScreen() {
  return (
    <ResultScreen
      copy={{
        success: {
          title: 'Swapped instantly',
          note: 'Both wallets are already up to date, and the receipt is saved to your history.',
        },
      }}
    />
  );
}
