import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { PressableScale } from '@/components/ui/pressable-scale';

import { Icon } from '@/components/ui/icon';
import { ThemedText } from '@/components/themed-text';
import { AvatarTints } from '@/constants/colors';
import { symbolFor } from '@/lib/format';
import { Radius } from '@/constants/radius';
import { useTheme } from '@/hooks/use-theme';

/**
 * The `key`-filled row that opens a picker sheet — "Send from", the bank row, the network row, the
 * bill provider and the You send / They get pair. Two shapes appear in the references: with a
 * caption above the value (two lines) and without (a single bold value, e.g. "GTBank").
 */
export function PickerField({
  badge,
  caption,
  value,
  sublabel,
  onPress,
  compact,
  style,
}: {
  /** Leading badge — a tinted currency disc, a bank monogram, or an icon tile. */
  badge?: React.ReactNode;
  caption?: string;
  value: string;
  /**
   * A muted third line under the value — the balance on the "Fund it from" row of
   * `design/virtual card/fund-1.png`. Only that row uses it; every other reference is two lines.
   */
  sublabel?: string;
  onPress?: () => void;
  /** Narrower padding and a smaller value, for the side-by-side currency pair. */
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();

  return (
    <PressableScale
      onPress={onPress}
      // A read-only row is not a button, so it must not answer a touch either.
      disabled={!onPress}
      style={[
        styles.row,
        { backgroundColor: theme.key },
        compact && styles.compact,
        style,
      ]}
    >
      {badge}
      <View style={styles.text}>
        {caption && (
          <ThemedText type={compact ? 'nano' : 'label'} themeColor="mut">
            {caption}
          </ThemedText>
        )}
        <ThemedText
          type={compact ? 'tabLabel' : 'inputText'}
          numberOfLines={1}
          style={caption ? styles.spaced : undefined}
        >
          {value}
        </ThemedText>
        {sublabel && (
          <ThemedText type="body" themeColor="mut" numberOfLines={1} style={styles.sublabel}>
            {sublabel}
          </ThemedText>
        )}
      </View>
      {/* No chevron without an `onPress`: the "Moving into · NGN wallet" row in
          `design/security/rewards-move-to-naira-1.png` is a statement of fact, and drawing a chevron
          on it advertised a picker that does not exist. */}
      {onPress && <Icon name="chevronDown" size={compact ? 15 : 18} color={theme.mut} strokeWidth={2} />}
    </PressableScale>
  );
}

/**
 * The tinted currency badge used as a `PickerField` badge and a picker-sheet mark.
 *
 * Two variants, because the references use both. `code` is a **circle** carrying the three-letter
 * code — `design/utility/pay from.png`, `send money/send from dropdown.png`, the Vertex pair.
 * `symbol` is a **rounded square** carrying the currency glyph — the swap legs on
 * `design/add money/on click of swap.png` and the rows in `swap from.png` / `swap to.png`, where the
 * code already appears in the row's title and repeating it in the badge read as a duplication.
 *
 * The fallback is a pastel, not `theme.card`: the mark is set in `onPastel` (dark by design, because
 * the tints are all light), so falling back to `card` produced dark ink on a dark card in dark mode.
 */
export function CurrencyBadge({
  code,
  tint,
  size = 44,
  variant = 'code',
}: {
  code: string;
  tint?: string;
  size?: number;
  variant?: 'code' | 'symbol';
}) {
  const theme = useTheme();
  const symbol = variant === 'symbol';

  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: symbol ? size * 0.32 : size / 2,
          backgroundColor: tint ?? AvatarTints[1],
        },
      ]}
    >
      <ThemedText type={symbol ? 'labelStrong' : 'nano'} style={{ color: theme.onPastel }}>
        {symbol ? symbolFor(code) : code}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: Radius.tile,
    paddingVertical: 9,
    paddingLeft: 9,
    paddingRight: 16,
    // Measured off `design/utility/default.png` (Provider 60.1pt) and `send money/sending ngn-1.png`
    // (Send from 63pt). It was 72, which pushed every form below it ~12pt down the screen.
    minHeight: 62,
  },
  compact: { minHeight: 60, paddingVertical: 9, paddingLeft: 9, paddingRight: 12, gap: 9 },
  text: { flex: 1, minWidth: 0 },
  spaced: { marginTop: 4 },
  sublabel: { marginTop: 2 },
  badge: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
});
