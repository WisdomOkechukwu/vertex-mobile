import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { CircleButton } from '@/components/ui/circle-button';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/constants/layout';

/**
 * The mockup's pushed-screen header, verbatim:
 * a 42px `circBtn` back button, a 12px gap, the title *centred* via `flex:1;text-align:center` at
 * `700 17px/1 -.02em`, then either a trailing action button or a 42px spacer that balances the back
 * button. Titles are centred, not left-aligned.
 */
export function ScreenHeader({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.header}>
      <CircleButton icon="chevronLeft" onPress={onBack ?? (() => router.back())} />
      <ThemedText type="sectionHeader" numberOfLines={1} style={styles.title}>
        {title}
      </ThemedText>
      {right ?? <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Screen.horizontal,
    paddingBottom: 20,
  },
  title: { flex: 1, textAlign: 'center' },
  spacer: { width: 42 },
});
