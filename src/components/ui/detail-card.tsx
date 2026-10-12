import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/radius';
import { useTheme } from '@/hooks/use-theme';

export type DetailRow = {
  label: string;
  value: string;
};

/**
 * The hairline-ruled label/value panel the references use for every breakdown — the transaction and
 * reward detail screens, the bill and transfer reviews, and the receipt footer.
 *
 * Measured off `design/home/on click of the transactions.png`: a `card` surface at radius 24 with
 * 18pt side padding, rows 14pt tall either side of their text, and a 1px `line` rule between rows
 * inset to the padding. Values are right-aligned and wrap rather than truncate — the rewards
 * reference breaks "Confirmed with your / transaction PIN" over two right-aligned lines.
 */
export function DetailCard({ rows }: { rows: DetailRow[] }) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      {rows.map((r, i) => (
        <View
          key={r.label}
          style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: theme.line }]}
        >
          <ThemedText type="body" themeColor="mut">
            {r.label}
          </ThemedText>
          <ThemedText type="labelStrong" style={styles.value}>
            {r.value}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.cardLg, paddingHorizontal: 18 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 14, paddingVertical: 14 },
  value: { flex: 1, textAlign: 'right', lineHeight: 17 },
});
