import { useEffect } from 'react';
import { StyleSheet, View, type DimensionValue } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { Radius } from '@/constants/radius';
import { useTheme } from '@/hooks/use-theme';

/** Shimmering placeholder block shown while a store's `status` is `'loading'`. */
export function Skeleton({
  width = '100%',
  height = 16,
  radius = Radius.crisp,
  style,
}: {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: object;
}) {
  const theme = useTheme();
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(withSequence(withTiming(1, { duration: 650 }), withTiming(0.5, { duration: 650 })), -1);
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: theme.key },
        animStyle,
        style,
      ]}
    />
  );
}

/**
 * A leading mark and a couple of text bars — the shape of most rows in the app.
 *
 * `avatar` and `lines` exist because callers were passing `style={{ height: 120 }}` to fake a block,
 * which left a 40×40 disc and two bars floating inside an enlarged row.
 */
export function SkeletonRow({
  avatar = true,
  lines = 2,
  style,
}: {
  avatar?: boolean;
  lines?: number;
  style?: object;
}) {
  const widths = ['60%', '40%', '75%'];

  return (
    <View style={[styles.row, style]}>
      {avatar && <Skeleton width={40} height={40} radius={14} />}
      <View style={{ flex: 1, gap: 6 }}>
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton key={i} width={widths[i % widths.length] as DimensionValue} height={i === 0 ? 13 : 11} />
        ))}
      </View>
    </View>
  );
}

/** The `Array.from({ length: 3 })` every list screen was writing out. */
export function SkeletonRows({
  count = 3,
  gap = 10,
  ...row
}: { count?: number; gap?: number } & Parameters<typeof SkeletonRow>[0]) {
  return (
    <View style={{ gap }}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonRow key={i} {...row} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
