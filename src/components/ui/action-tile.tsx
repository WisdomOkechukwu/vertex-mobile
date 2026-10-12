import { StyleSheet } from 'react-native';
import { PressableScale } from '@/components/ui/pressable-scale';

import { Icon, type IconProps } from '@/components/ui/icon';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/radius';
import { useTheme } from '@/hooks/use-theme';

/**
 * A square `card`-filled tile with an accent glyph over a bold label — the Details / Freeze / Top up
 * row on the cards screen. Three sit side by side across the content width.
 */
export function ActionTile({
  icon,
  label,
  onPress,
  active,
}: {
  icon: IconProps['name'];
  label: string;
  onPress?: () => void;
  /** Freeze flips to an accent fill once the card is frozen. */
  active?: boolean;
}) {
  const theme = useTheme();

  return (
    <PressableScale
      onPress={onPress}
      style={[
        styles.tile,
        { backgroundColor: active ? theme.accent : theme.card },
      ]}
    >
      <Icon name={icon} size={22} color={active ? theme.onAccent : theme.accent} strokeWidth={2} />
      <ThemedText type="labelStrong" style={active ? { color: theme.onAccent } : undefined}>
        {label}
      </ThemedText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    // `design/virtual card/default.png` measures 107.3 x 69.3 with a 23.5 radius.
    height: 69,
    borderRadius: Radius.veryRound,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
});
