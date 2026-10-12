import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Motion, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * The mockup's wizard progress: `height:5px; gap:5px; border-radius:999px` segments, filled ones in
 * `var(--acc)` and animated in from the left (`animation:vs-bar .5s cubic-bezier(.2,.9,.3,1)`).
 */
function Segment({ filled }: { filled: boolean }) {
  const theme = useTheme();
  const scale = useSharedValue(filled ? 0 : 0);

  useEffect(() => {
    scale.value = withTiming(filled ? 1 : 0, {
      duration: Motion.bar,
      easing: Easing.bezier(...Motion.easing),
    });
  }, [filled, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scaleX: scale.value }] }));

  return (
    <View style={[styles.track, { backgroundColor: theme.key }]}>
      <Animated.View
        style={[styles.fill, { backgroundColor: theme.accent, transformOrigin: 'left' }, style]}
      />
    </View>
  );
}

export function StepProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }, (_, i) => (
        <Segment key={i} filled={i < step} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 5 },
  track: { flex: 1, height: 5, borderRadius: Radius.pill, overflow: 'hidden' },
  fill: { flex: 1, borderRadius: Radius.pill },
});
