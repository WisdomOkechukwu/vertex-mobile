import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

/**
 * The PIN dots. From `design/utility/pin.png`: entered digits are solid accent discs, the slot
 * you're about to fill is an accent ring, and anything beyond that is a plain `key` disc.
 */
export function PinDotEntry({
  length = 4,
  value,
  error,
}: {
  length?: number;
  value: string;
  error?: boolean;
}) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {Array.from({ length }, (_, i) => {
        const filled = i < value.length;
        const isNext = i === value.length;
        const tone = error ? theme.neg : theme.accent;

        return (
          <View
            key={i}
            style={[
              styles.dot,
              filled
                ? { backgroundColor: tone, borderColor: tone }
                : isNext
                  ? { backgroundColor: theme.background, borderColor: tone }
                  : { backgroundColor: theme.key, borderColor: 'transparent' },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 18, justifyContent: 'center' },
  dot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2 },
});
