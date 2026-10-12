import { StyleSheet, View } from 'react-native';
import { PressableScale } from '@/components/ui/pressable-scale';

import { ThemedText } from '@/components/themed-text';

/**
 * A section title with an optional trailing item: either an accent action ("See all") or a muted
 * count ("1 of 3 complete", "4 this month"). Used on Home, Cards and Security.
 *
 * `sectionLabel`, not `sectionHeader`: the references draw an in-page heading at 15.5pt and reserve
 * 17pt for the centred nav title on a pushed screen (`ScreenHeader`).
 */
export function SectionHeading({
  title,
  actionLabel,
  onAction,
  meta,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Muted trailing text, when the section reports a count rather than offering an action. */
  meta?: string;
}) {
  return (
    <View style={styles.row}>
      <ThemedText type="sectionLabel">{title}</ThemedText>

      {actionLabel && onAction && (
        <PressableScale onPress={onAction} hitSlop={8} scale={false}>
          <ThemedText type="labelStrong" themeColor="accent">
            {actionLabel}
          </ThemedText>
        </PressableScale>
      )}

      {!actionLabel && meta && (
        <ThemedText type="label" themeColor="mut">
          {meta}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
});
