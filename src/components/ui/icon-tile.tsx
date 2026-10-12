import { StyleSheet, View } from 'react-native';

import { Icon, type IconProps } from '@/components/ui/icon';
import { Radius } from '@/constants/radius';
import { useTheme } from '@/hooks/use-theme';

/**
 * A raised rounded-square holding an accent glyph — the leading mark on Add money's funding methods
 * and on Security's setting rows. Distinct from the circular tinted `Avatar`.
 *
 * It fills with `chip`, not `background`: the tile sits on top of a `card` surface, and in dark mode
 * `background` is *darker* than `card`, so a background-filled tile read as a hole punched in the row.
 */
export function IconTile({
  icon,
  size = 48,
  tone = 'accent',
  tint,
}: {
  icon: IconProps['name'];
  size?: number;
  tone?: 'accent' | 'fg';
  /** An explicit glyph colour, overriding `tone` — the destructive row paints its tile `neg`. */
  tint?: string;
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.tile,
        { width: size, height: size, borderRadius: size * 0.34, backgroundColor: theme.chip },
      ]}
    >
      <Icon
        name={icon}
        size={size * 0.44}
        color={tint ?? (tone === 'accent' ? theme.accent : theme.fg)}
        strokeWidth={2}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRadius: Radius.crisp },
});
