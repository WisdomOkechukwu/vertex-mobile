import { StyleSheet, View } from 'react-native';

import { Icon, type IconProps } from '@/components/ui/icon';
import { RowCard } from '@/components/ui/row-card';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ListRowProps = {
  avatar?: React.ReactNode;
  badgeIcon?: IconProps['name'];
  tint?: string;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  /** The payment-link payer rows keep their meta on one line; most rows allow two. */
  subtitleLines?: number;
  onPress?: () => void;
  tone?: 'card' | 'dashed' | 'accent' | 'plain';
};

/**
 * The mockup's generic list row inside a `RowCard`: a 34–44px leading badge, a two-line text block
 * (`600 14px/1.2` over `500 11.5px/1.4` in `--mut`), then a trailing value or chevron.
 */
export function ListRow({ avatar, badgeIcon, tint, title, subtitle, trailing, subtitleLines = 2, onPress, tone }: ListRowProps) {
  const theme = useTheme();

  return (
    <RowCard onPress={onPress} tone={tone}>
      {avatar}
      {!avatar && badgeIcon && (
        <View style={[styles.badge, { backgroundColor: tint ?? theme.key }]}>
          <Icon name={badgeIcon} size={18} color={theme.fg} strokeWidth={1.9} />
        </View>
      )}
      <View style={styles.textCol}>
        <ThemedText type="rowTitle" numberOfLines={1}>
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText type="body" themeColor="mut" numberOfLines={subtitleLines} style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        )}
      </View>
      {trailing ?? (onPress && <Icon name="chevronRight" size={17} color={theme.mut} strokeWidth={2.2} />)}
    </RowCard>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textCol: { flex: 1, minWidth: 0 },
  subtitle: { marginTop: 3 },
});
