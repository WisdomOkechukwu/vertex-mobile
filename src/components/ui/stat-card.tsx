import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/radius';
import { useTheme } from '@/hooks/use-theme';

/**
 * The two-column spend summary on the cards screen: a caption, Funded against Spent either side of
 * a hairline, a progress bar, and the limit line beneath.
 */
export function StatCard({
  caption,
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  progress,
  footnote,
}: {
  caption: string;
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
  /** 0–1. */
  progress: number;
  footnote?: string;
}) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <ThemedText type="label" themeColor="mut">
        {caption}
      </ThemedText>

      <View style={styles.columns}>
        <View style={styles.column}>
          <ThemedText type="label" themeColor="mut">
            {leftLabel}
          </ThemedText>
          <ThemedText type="statValue" themeColor="accent" style={styles.value}>
            {leftValue}
          </ThemedText>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.line }]} />

        <View style={styles.column}>
          <ThemedText type="label" themeColor="mut">
            {rightLabel}
          </ThemedText>
          <ThemedText type="statValue" style={styles.value}>
            {rightValue}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.track, { backgroundColor: theme.key }]}>
        <View
          style={[
            styles.fill,
            { backgroundColor: theme.accent, width: `${Math.min(100, Math.max(0, progress * 100))}%` },
          ]}
        />
      </View>

      {footnote && (
        <ThemedText type="body" themeColor="mut">
          {footnote}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.card, padding: 18, gap: 14 },
  columns: { flexDirection: 'row', alignItems: 'center' },
  column: { flex: 1, gap: 6 },
  value: { marginTop: 2 },
  divider: { width: 1, alignSelf: 'stretch', marginHorizontal: 18 },
  track: { height: 8, borderRadius: Radius.pill, overflow: 'hidden' },
  fill: { height: 8, borderRadius: Radius.pill },
});
