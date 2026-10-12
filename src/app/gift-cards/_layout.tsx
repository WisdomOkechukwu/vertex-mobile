import { Stack } from 'expo-router';

import { Motion } from '@/constants/layout';

export default function GiftCardsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: Motion.slide,
      }}
    />
  );
}
