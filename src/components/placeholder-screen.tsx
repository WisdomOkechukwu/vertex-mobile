import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/ui/empty-state';
import { ThemedView } from '@/components/themed-view';
import { Screen } from '@/constants/theme';
import type { IconProps } from '@/components/ui/icon';

/**
 * Route stub for screens not yet built out in this pass (see build-order steps 8-13 in the plan).
 * Swap for the real screen implementation without touching the route tree/navigation wiring.
 */
export function PlaceholderScreen({ title, icon = 'grid' }: { title: string; icon?: IconProps['name'] }) {
  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <EmptyState icon={icon} title={title} description="This screen is coming in the next pass." />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, paddingHorizontal: Screen.horizontal },
});
