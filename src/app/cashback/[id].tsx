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
import type { CashbackEntry } from '@/services/types/cashback';
import type { TransactionStatus } from '@/services/types/transactions';

/** The ledger stores a sentence, not an enum — map it onto the badge's three states. */
function badgeStatus(status: string): TransactionStatus {
  if (/pending/i.test(status)) return 'pending';
  if (/reversed|failed|clawback/i.test(status)) return 'failed';
  return 'success';
}

/**
 * `design/security/rewards-transaction-details.png` lists `Reference / Taken from / Moved to / Date
 * / Note` for a withdrawal. An earn instead names what produced it and at what rate.
 */
function rowsFor(e: CashbackEntry): DetailRow[] {
  const middle: DetailRow[] =
    e.dir === 'out'
      ? [
          { label: 'Taken from', value: 'Rewards balance' },
          {
            label: 'Moved to',
            // The reference reads "Your NGN wallet"; the ledger's channel says "… → NGN wallet".
            value: `Your ${e.channel.split('→').pop()?.trim() ?? 'NGN wallet'}`,
          },
        ]
      : [
          { label: 'Earned on', value: e.channel },
          ...(e.rate ? [{ label: 'Rate', value: e.rate }] : []),
          ...(e.spend ? [{ label: 'Qualifying spend', value: e.spend }] : []),
        ];

  return [
    { label: 'Reference', value: e.ref },
    ...middle,
    { label: 'Date and time', value: e.date },
    ...(e.note ? [{ label: 'Note', value: e.note }] : []),
  ];
}

export default function RewardDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [fetched, setFetched] = useState<{ id: string; entry: CashbackEntry | null }>();

  useEffect(() => {
    let live = true;
    api.cashback
      .getEntry(id)
      .then((entry) => live && setFetched({ id, entry }))
      .catch(() => live && setFetched({ id, entry: null }));
    return () => {
      live = false;
    };
  }, [id]);

  const settled = fetched?.id === id;
  const entry = settled ? fetched.entry : null;

  if (settled && !entry) {
    return (
      <View style={[styles.flex, { backgroundColor: theme.background }]}>
        <SafeAreaView style={styles.flex} edges={['top']}>
          <ScreenHeader title="Details" />
          <View style={styles.content}>
            <EmptyState
              icon="gift"
              title="We cannot find that reward"
              description="It may have been removed, or the link is out of date."
              action={{ label: 'Back to rewards', onPress: () => router.replace('/cashback') }}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!entry) {
    return (
      <View style={[styles.flex, { backgroundColor: theme.background }]}>
        <SafeAreaView style={styles.flex} edges={['top']}>
          <ScreenHeader title="Details" />
          <View style={styles.content}>
            <SkeletonRow style={{ height: 120, borderRadius: Radius.cardLg }} />
            <SkeletonRow style={{ height: 250, borderRadius: Radius.cardLg }} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <DetailScreen
      mark={entry.mark}
      tint={entry.tint}
      name={entry.name}
      subtitle={entry.channel}
      amount={entry.amt}
      dir={entry.dir}
      status={badgeStatus(entry.status)}
      statusLabel={entry.status}
      rows={rowsFor(entry)}
      shareText={`${entry.name} · ${entry.amt} · ${entry.ref}`}
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: Screen.horizontal, paddingBottom: Spacing.four, gap: 22 },
});
