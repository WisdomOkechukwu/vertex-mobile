import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { PressableScale } from '@/components/ui/pressable-scale';

import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/radius';
import { useTheme } from '@/hooks/use-theme';

/**
 * The mockup's filter/quick-amount chip:
 * `background:var(--key); border-radius:999px; padding:9px 15px; font:600 12px/1 var(--font-body)`
 * — with the accent fill it takes when selected.
 */
export function Chip({
  label,
  active,
  onPress,
  style,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();

  return (
    <PressableScale
      onPress={onPress}
      style={[
        styles.base,
        { backgroundColor: active ? theme.accent : theme.key },
        style,
      ]}
    >
      <ThemedText type="labelStrong" style={active ? { color: theme.onAccent } : undefined}>
        {label}
      </ThemedText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: Radius.pill, paddingHorizontal: 15, paddingVertical: 9 },
});
