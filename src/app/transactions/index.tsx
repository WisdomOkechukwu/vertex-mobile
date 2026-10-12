import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SkeletonRow } from '@/components/ui/skeleton';
import { Stagger } from '@/components/ui/reveal';
import { TextField } from '@/components/ui/text-field';
import { ThemedText } from '@/components/themed-text';
import { TransactionRow } from '@/components/ui/transaction-row';
import { Screen, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { isLoading } from '@/lib/api-status';
import { formatMoneyCompact } from '@/lib/format';
import type { Transaction } from '@/services/types/transactions';
import { useTransactionsStore } from '@/stores/transactions-store';

/**
 * `design/home/on click of the see all transactions.png`.
 *
 * The reference's chips filter by *direction* for the first two and by kind for the last two, which
 * is why this is not a plain `kind` equality test: "In"/"Out" have no matching `TransactionKind`.
 */
const FILTERS = [
  { label: 'All', match: () => true },
  { label: 'In', match: (t: Transaction) => t.dir === 'in' },
  { label: 'Out', match: (t: Transaction) => t.dir === 'out' },
  { label: 'Bills', match: (t: Transaction) => t.kind === 'Bill' },
  { label: 'Cards', match: (t: Transaction) => t.kind === 'Card' },
] as const;

export default function HistoryScreen() {
  const theme = useTheme();
  const history = useTransactionsStore((s) => s.history);
  const status = useTransactionsStore((s) => s.status);
  const fetchHistory = useTransactionsStore((s) => s.fetchHistory);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('All');

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const groups = useMemo(() => {
    const match = FILTERS.find((f) => f.label === filter)?.match ?? (() => true);
    const q = search.trim().toLowerCase();
    const rows = history.filter((t) => {
      if (!match(t)) return false;
      // The reference's placeholder promises name, amount *and* reference.
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.amt.toLowerCase().includes(q) ||
        t.ref.toLowerCase().includes(q)
      );
    });

    const order: string[] = [];
    const byDay = new Map<string, Transaction[]>();
    for (const t of rows) {
      const day = t.day ?? '';
      if (!byDay.has(day)) {
        byDay.set(day, []);
        order.push(day);
      }
      byDay.get(day)!.push(t);
    }
    return order.map((day) => {
      const items = byDay.get(day)!;
      return {
        day,
        items,
        total: items.reduce((sum, t) => sum + (t.value ?? 0) * (t.dir === 'out' ? -1 : 1), 0),
      };
    });
  }, [history, filter, search]);

  const loading = isLoading(status);

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScreenHeader title="Transactions" />

        <View style={styles.searchWrap}>
          <TextField
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name, amount or reference"
            leadingIcon="search"
            size="compact"
          />
        </View>

        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <Chip key={f.label} label={f.label} active={f.label === filter} onPress={() => setFilter(f.label)} />
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            [0, 1, 2, 3].map((i) => <SkeletonRow key={i} />)
          ) : groups.length === 0 ? (
            <EmptyState
              icon="grid"
              title="Nothing matches that"
              description="Try a different name, amount or reference."
            />
          ) : (
            // Keyed on the filter and query as well as the day, so changing either replays the
            // entrance instead of silently reshuffling rows that look identical.
            groups.map((g, i) => (
              <Stagger key={`${filter}-${search}-${g.day}`} index={i} style={styles.group}>
                <View style={styles.dayRow}>
                  <ThemedText type="microStrong">{g.day}</ThemedText>
                  <ThemedText type="microStrong" themeColor="mut">
                    {formatMoneyCompact(g.total, 'NGN', { signed: true })}
                  </ThemedText>
                </View>
                <View style={styles.rows}>
                  {g.items.map((t) => (
                    <TransactionRow key={t.id} tx={t} onPress={() => router.push(`/transactions/${t.id}`)} />
                  ))}
                </View>
              </Stagger>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  // Measured off the reference: header→search 35, search→chips 24, chips→first day header 22.
  searchWrap: { paddingHorizontal: Screen.horizontal, paddingTop: Spacing.three },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: Screen.horizontal,
    paddingTop: Spacing.four,
    paddingBottom: 22,
  },
  content: { paddingHorizontal: Screen.horizontal, paddingBottom: Screen.bottom, gap: 26 },
  group: { gap: 14 },
  dayRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  rows: { gap: Screen.rowGap },
});
