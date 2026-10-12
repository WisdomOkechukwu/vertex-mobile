import { Platform, StyleSheet, Switch, View } from 'react-native';
import { PressableScale } from '@/components/ui/pressable-scale';

import { Icon, type IconProps } from '@/components/ui/icon';
import { IconTile } from '@/components/ui/icon-tile';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/radius';
import { useTheme } from '@/hooks/use-theme';

/**
 * A `card`-filled row with a white icon tile, a title over a muted subtitle, and a trailing control —
 * a switch on Security's sign-in rows, a chevron on the account rows, or a caller-supplied pill.
 */
export function SettingRow({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
  onPress,
  trailing,
  tone = 'default',
}: {
  icon?: IconProps['name'];
  title: string;
  subtitle?: string;
  /** `destructive` tints the title and its icon tile — the Delete account row. */
  tone?: 'default' | 'destructive';
  /** Present for a switch row. */
  value?: boolean;
  onValueChange?: (v: boolean) => void;
  onPress?: () => void;
  trailing?: React.ReactNode;
}) {
  const theme = useTheme();
  const isSwitch = typeof value === 'boolean';

  const content = (
    <>
      {icon && <IconTile icon={icon} size={38} tint={tone === 'destructive' ? theme.neg : undefined} />}
      <View style={styles.text}>
        <ThemedText type="rowTitle" style={tone === 'destructive' ? { color: theme.neg } : undefined}>
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText type="body" themeColor="mut" style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        )}
      </View>

      {trailing ??
        (isSwitch ? (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: theme.key, true: theme.accent }}
            thumbColor={theme.onAccent}
            ios_backgroundColor={theme.key}
            // The reference switch measures 44x28; RNW renders ~42x25 unscaled.
            style={styles.switch}
            // RNW uses its own default for the on-state thumb unless told otherwise.
            {...(Platform.OS === 'web' ? ({ activeThumbColor: theme.onAccent } as object) : null)}
          />
        ) : onPress ? (
          <Icon name="chevronRight" size={18} color={theme.mut} strokeWidth={2.2} />
        ) : null)}
    </>
  );

  const style = [styles.row, { backgroundColor: theme.card }];
  if (!onPress) return <View style={style}>{content}</View>;

  return (
    <PressableScale onPress={onPress} disabled={!onPress} style={style}>
      {content}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: Radius.card,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  text: { flex: 1, minWidth: 0 },
  subtitle: { marginTop: 3 },
  switch: { transform: [{ scale: 1.05 }] },
});
