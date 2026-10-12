import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { PressableScale } from '@/components/ui/pressable-scale';

import { Radius } from '@/constants/radius';
import { useTheme } from '@/hooks/use-theme';

/**
 * The mockup's dominant surface — a tappable card row:
 * `background:var(--card); border-radius:22px; padding:14–17px 16–18px; gap:13px`
 * with `background:var(--key)` on hover. Also covers the dashed "add" variant
 * (`border:1.5px dashed var(--line)`) and the accent-tinted banner variant.
 */
export function RowCard({
  children,
  onPress,
  tone = 'card',
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  tone?: 'card' | 'dashed' | 'accent' | 'plain';
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();

  const toneStyle: ViewStyle =
    tone === 'dashed'
      ? { backgroundColor: 'transparent', borderWidth: 1.5, borderStyle: 'dashed', borderColor: theme.line }
      : tone === 'accent'
        ? { backgroundColor: `${theme.accent}1a`, borderWidth: 1, borderColor: `${theme.accent}4d` }
        : tone === 'plain'
          ? { backgroundColor: 'transparent' }
          : { backgroundColor: theme.card };

  if (!onPress) {
    return <View style={[styles.base, toneStyle, style]}>{children}</View>;
  }

  return (
    <PressableScale onPress={onPress} style={[styles.base, toneStyle, style]}
    >
      {children}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderRadius: Radius.card,
    paddingVertical: 15,
    paddingHorizontal: 17,
  },
});
