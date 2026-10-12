import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DetailScreen } from '@/components/money/detail-screen';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SkeletonRow } from '@/components/ui/skeleton';
import type { DetailRow } from '@/components/ui/detail-card';
import { Radius, Screen, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/services';
import type { Transaction } from '@/services/types/transactions';

/** The reference writes "Completed", not the `StatusBadge` default of "Successful". */
const STATUS_LABEL = { success: 'Completed', pending: 'Pending', failed: 'Failed' } as const;

/**
 * `Reference` head, `Date and time` / `Note` tail, and a counterparty block in between. Both
 * references — the Vertex transfer on `design/home/on click of the transactions.png` and the card
 * charge on `design/virtual card/on click of transaction.png` — use plain `To / Channel / Fee`, so
 * only the two flows with no counterparty get their own labels.
 */
function rowsFor(tx: Transaction): DetailRow[] {
  const middle: DetailRow[] =
    tx.kind === 'Cashback'
      ? [{ label: 'Earned on', value: tx.channel }]
      : tx.kind === 'Swap'
        ? [
            { label: 'Converted', value: tx.name },
            { label: 'Route', value: tx.channel },
            { label: 'Fee', value: tx.fee },
          ]
        : [
            { label: tx.dir === 'in' ? 'From' : 'To', value: tx.name },
            { label: 'Channel', value: tx.channel },
            { label: 'Fee', value: tx.fee },
          ];

  return [
    { label: 'Reference', value: tx.ref },
    ...middle,
    { label: 'Date and time', value: tx.date },
    ...(tx.note ? [{ label: 'Note', value: tx.note }] : []),
  ];
}

/**
 * `design/home/on click of the transactions.png` — reached from every transaction list in the app:
 * Home, the history screen, a currency's activity, a card's spend and a payment link's payers.
 */
export default function TransactionDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  /**
   * One record rather than separate `tx`/`missing`/`loading` flags: it carries the `id` it was
   * fetched for, so a route change reads as loading again without a synchronous reset in the effect.
   */
  const [fetched, setFetched] = useState<{ id: string; tx: Transaction | null }>();

  useEffect(() => {
    let live = true;
    api.transactions
      .getById(id)
      .then((t) => live && setFetched({ id, tx: t }))
      .catch(() => live && setFetched({ id, tx: null }));
    return () => {
      live = false;
    };
  }, [id]);

  const settled = fetched?.id === id;
  const tx = settled ? fetched.tx : null;

  if (settled && !tx) {
    return (
      <View style={[styles.flex, { backgroundColor: theme.background }]}>
        <SafeAreaView style={styles.flex} edges={['top']}>
          <ScreenHeader title="Details" />
          <View style={styles.content}>
            <EmptyState
              icon="grid"
              title="We cannot find that transaction"
              description="It may have been removed, or the link is out of date."
              action={{ label: 'Back to transactions', onPress: () => router.replace('/transactions') }}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!tx) {
    return (
      <View style={[styles.flex, { backgroundColor: theme.background }]}>
        <SafeAreaView style={styles.flex} edges={['top']}>
          <ScreenHeader title="Details" />
          <View style={styles.content}>
            <SkeletonRow style={{ height: 120, borderRadius: Radius.cardLg }} />
            <SkeletonRow style={{ height: 291, borderRadius: Radius.cardLg }} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <DetailScreen
      mark={tx.mark}
      tint={tx.tint}
      name={tx.name}
      subtitle={tx.channel}
      amount={tx.amt}
      dir={tx.dir}
      status={tx.status}
      statusLabel={STATUS_LABEL[tx.status]}
      rows={rowsFor(tx)}
      reward={
        tx.cashback
          ? { title: `${tx.cashback} cashback earned`, body: 'Paid into your rewards balance' }
          : undefined
      }
      shareText={`${tx.name} · ${tx.amt} · ${tx.ref}`}
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: Screen.horizontal, paddingBottom: Spacing.four, gap: 22 },
});
