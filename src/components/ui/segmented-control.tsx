import { StyleSheet, View, type ViewStyle } from 'react-native';
import { PressableScale } from '@/components/ui/pressable-scale';

import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/radius';
import { useTheme } from '@/hooks/use-theme';

/**
 * The design's inline filter switch — a recessed pill track holding equal-width segments, with the
 * selected one lifted onto a `chip` pill. Measured from `design/notifications/default.png`:
 * 45pt track, 4pt inset, so the selected pill is 37pt tall.
 *
 * The track is `card`, not `key`: in dark `key` and `chip` are the same #272525, which would leave
 * the selected pill invisible. `card` keeps the light scheme's direction — pill lighter than track.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  style,
}: {
  options: readonly T[];
  value: T;
  onChange: (next: T) => void;
  style?: ViewStyle;
}) {
  const theme = useTheme();

  return (
    <View style={[styles.track, { backgroundColor: theme.card }, style]}>
      {options.map((option) => {
        const active = option === value;
        return (
          <PressableScale
            key={option}
            onPress={() => onChange(option)}
            style={[styles.segment, active && { backgroundColor: theme.chip }]}
          >
            <ThemedText type={active ? 'labelStrong' : 'label'} themeColor={active ? 'fg' : 'mut'}>
              {option}
            </ThemedText>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', height: 45, padding: 4, borderRadius: Radius.pill },
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.pill },
});
