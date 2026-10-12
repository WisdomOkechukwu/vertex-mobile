import { router } from 'expo-router';

import { TransactionPinScreen } from '@/components/money/transaction-pin-screen';

export default function InternalTransferPinScreen() {
  return <TransactionPinScreen
      onSuccess={() => router.replace('/(money)/internal-transfer/result')} />;
}
