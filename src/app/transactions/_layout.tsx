import { Stack } from 'expo-router';

import { Motion } from '@/constants/layout';

export default function TransactionsLayout() {
  return <Stack screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        // `Motion.slide` is the mockup's own `vs-slide` duration, and was the one motion token
        // nothing read — the stacks were running the platform default instead.
        animationDuration: Motion.slide,
      }} />;
}
