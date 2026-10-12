import { ResultScreen } from '@/components/money/result-screen';

/** `design/virtual card/reciept.png` — the receipt for a card top-up. */
export default function CardTopUpResultScreen() {
  return (
    <ResultScreen
      copy={{
        success: {
          title: 'Card topped up',
          note: 'The funds are on the card and ready to spend.',
        },
      }}
    />
  );
}
