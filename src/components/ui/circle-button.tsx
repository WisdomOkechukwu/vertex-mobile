import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { PressableScale } from '@/components/ui/pressable-scale';

import { Icon, type IconProps } from '@/components/ui/icon';
import { Radius } from '@/constants/theme';
import { useShadows } from '@/hooks/use-shadows';
import { useTheme } from '@/hooks/use-theme';

/**
 * The mockup's `circBtn`. Its own definition sits in the truncated tail of the design export, but
 * every one of the 21 screen headers balances it with a `<span style="width:42px">` spacer, which
 * pins it at 42px. The 44px accent variant is the floating add/confirm action
 * (`background:var(--acc); box-shadow:0 8px 20px -8px ...`).
 */
export function CircleButton({
  icon,
  onPress,
  size = 42,
  tone = 'key',
  iconTone = 'fg',
  children,
  style,
}: {
  icon?: IconProps['name'];
  onPress?: () => void;
  size?: number;
  tone?: 'key' | 'accent' | 'bg';
  /** Recolours the glyph on a neutral disc — the payment-links "+" is accent on `card`. */
  iconTone?: 'fg' | 'accent';
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  const shadows = useShadows();
  // Sampled from `design/login/login.png`: the back button's disc is #f6f5f4 — `card`, not `key`.
  const bg = tone === 'accent' ? theme.accent : tone === 'bg' ? theme.background : theme.card;
  const iconColor = tone === 'accent' ? theme.onAccent : theme[iconTone];

  return (
    <PressableScale
      onPress={onPress}
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
        tone === 'accent' && shadows.accentGlow(theme.accent),
        tone === 'bg' && shadows.raised,
        style,
      ]}
    >
      {children ?? (icon && <Icon name={icon} size={size <= 44 ? 18 : 20} color={iconColor} strokeWidth={2.2} />)}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
});

export const CircleButtonRadius = Radius.pill;
