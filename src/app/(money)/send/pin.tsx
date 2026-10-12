import { router } from 'expo-router';

import { TransactionPinScreen } from '@/components/money/transaction-pin-screen';

export default function SendPinScreen() {
  return (
    <TransactionPinScreen
      onSuccess={() => router.replace('/(money)/send/result')}
    />
  );
}
