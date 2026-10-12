import { StyleSheet, View } from 'react-native';
import { PressableScale } from '@/components/ui/pressable-scale';

import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * The two-up Fixed amount / Payer decides switch on `design/payment links/create payment link.png`:
 * a 50pt track with 4pt padding, and the selected half lifted out onto a `chip` pill.
 *
 * `card` track rather than `key` for the same reason as `SegmentedControl`: `key` and `chip` collapse
 * to one colour in dark, which would hide the selection.
 */
export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const theme = useTheme();

  return (
    <View style={[styles.track, { backgroundColor: theme.card }]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <PressableScale key={opt.value} onPress={() => onChange(opt.value)} style={styles.segmentWrap}>
            <View style={[styles.segment, active && { backgroundColor: theme.chip }]}>
              <ThemedText type="buttonGhost" themeColor={active ? 'fg' : 'mut'}>
                {opt.label}
              </ThemedText>
            </View>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: Radius.pill, padding: 4 },
  segmentWrap: { flex: 1 },
  /** 42pt inside a 4pt-padded track — the reference's 50pt overall height. */
  segment: { height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.pill },
});
