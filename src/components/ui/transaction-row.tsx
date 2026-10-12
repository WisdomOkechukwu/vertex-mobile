import { StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { RowCard } from '@/components/ui/row-card';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { Transaction } from '@/services/types/transactions';

/**
 * The transaction row, on a `card` surface. Measured off `design/home/default.png` (a 1:1 capture):
 * the card runs y657–726, so **70pt** tall, with an 11pt gap, and the avatar tint spans x41–80 — a
 * 40pt disc inset 17pt from the card edge.
 *
 * Amounts are tinted **both** ways — incoming green, outgoing **red**. (The earlier build left
 * outgoing in the default ink; every reference screenshot shows it red.)
 *
 * The trailing sub-label is always the kind. An earlier build swapped in a cashback pill whenever
 * `tx.cashback` was set, but the references print "Bill" on the Ikeja row that earned ₦150 — the
 * cashback is stated on the detail screen instead.
 */
export function TransactionRow({ tx, onPress }: { tx: Transaction; onPress?: () => void }) {
  const theme = useTheme();
  const amountColor = tx.dir === 'in' ? theme.pos : theme.neg;

  return (
    <RowCard onPress={onPress} style={styles.row}>
      <Avatar label={tx.mark} size={42} tint={tx.tint} />
      <View style={styles.textCol}>
        <ThemedText type="rowTitle" numberOfLines={1}>
          {tx.name}
        </ThemedText>
        <ThemedText type="micro" themeColor="mut" numberOfLines={1} style={styles.meta}>
          {tx.time}
        </ThemedText>
      </View>
      <View style={styles.trailing}>
        <ThemedText type="amountValue" style={{ color: amountColor }}>
          {tx.amt}
        </ThemedText>
        <ThemedText type="micro" themeColor="mut" style={styles.meta}>
          {tx.kind}
        </ThemedText>
      </View>
    </RowCard>
  );
}

const styles = StyleSheet.create({
  // 70pt = the 40pt avatar (taller than the 34pt text column) + 15pt padding each side. The old
  // 17pt padding around a 42pt avatar made the row 76pt, which is what pushed Home's list ~8pt per
  // row further down the screen than the reference.
  // 70pt overall: a 42pt avatar (the reference measures 41–42) inside 14pt of vertical padding.
  row: { paddingVertical: 14, paddingHorizontal: 17 },
  textCol: { flex: 1, minWidth: 0 },
  trailing: { alignItems: 'flex-end' },
  meta: { marginTop: 3 },
});
