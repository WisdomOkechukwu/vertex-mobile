import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { ButtonPrimary } from '@/components/ui/button-primary';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { RowCard } from '@/components/ui/row-card';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionHeading } from '@/components/ui/section-heading';
import { SkeletonRow } from '@/components/ui/skeleton';
import { ThemedText } from '@/components/themed-text';
import { LOYALTY } from '@/constants/content';
import { Radius, Screen, Spacing } from '@/constants/theme';
import { useFirstRunTour } from '@/hooks/use-first-run-tour';
import { useTheme } from '@/hooks/use-theme';
import { isLoading } from '@/lib/api-status';
import { formatMoneyCompact } from '@/lib/format';
import { useCashbackStore } from '@/stores/cashback-store';
import { useUiStore } from '@/stores/ui-store';

/**
 * `design/security/rewards-default.png`: a gradient hero holding the balance and the month's earn
 * over the withdraw CTA, then the tier row — "Silver member" against "₦1,520 to Gold" with a
 * progress bar and one line of explanation — then the tappable ledger, every row chevroned through
 * to `design/security/rewards-transaction-details.png`.
 */
export default function CashbackScreen() {
  useFirstRunTour('loyalty');
  const theme = useTheme();
  const balance = useCashbackStore((s) => s.balance);
  const entries = useCashbackStore((s) => s.entries);
  const status = useCashbackStore((s) => s.status);
  const fetchCashback = useCashbackStore((s) => s.fetchCashback);
  const openSheet = useUiStore((s) => s.openSheet);

  useEffect(() => {
    fetchCashback();
  }, [fetchCashback]);

  const loading = isLoading(status);
  const progress = Math.min(1, balance / (balance + LOYALTY.toNextTier));

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScreenHeader title="Rewards" />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={[theme.wash1, theme.wash2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <ThemedText type="label" themeColor="mut">
              Cashback balance
            </ThemedText>
            {loading ? (
              <SkeletonRow style={styles.heroSkeleton} />
            ) : (
              <ThemedText type="display" style={styles.heroFigure}>
                {formatMoneyCompact(balance, 'NGN')}
              </ThemedText>
            )}
            <ThemedText type="label" themeColor="mut">
              {formatMoneyCompact(LOYALTY.earnedThisMonth, 'NGN')} earned in {LOYALTY.month} · pays out
              on the {LOYALTY.payoutDay}
            </ThemedText>
            <ButtonPrimary
              label="Move to main wallet"
              onPress={() => openSheet('withdraw-cashback')}
              compact
              style={styles.heroCta}
            />
          </LinearGradient>

          <View style={styles.tier}>
            <View style={styles.tierRow}>
              <ThemedText type="sectionLabel">{LOYALTY.tier} member</ThemedText>
              <ThemedText type="label" themeColor="mut">
                {formatMoneyCompact(LOYALTY.toNextTier, 'NGN')} to {LOYALTY.nextTier}
              </ThemedText>
            </View>
            <View style={[styles.track, { backgroundColor: theme.key }]}>
              <View
                style={[styles.fill, { backgroundColor: theme.accent, width: `${progress * 100}%` }]}
              />
            </View>
            <ThemedText type="body" themeColor="mut">
              {LOYALTY.nextTierBlurb}
            </ThemedText>
          </View>

          <View>
            <SectionHeading title="Recent cashback" />
            {loading ? (
              <View style={styles.rows}>
                {[0, 1, 2].map((i) => (
                  <SkeletonRow key={i} />
                ))}
              </View>
            ) : entries.length === 0 ? (
              <EmptyState
                icon="gift"
                title="No cashback yet"
                description="Earn cashback on eligible bill payments and card spend."
              />
            ) : (
              <View style={styles.rows}>
                {entries.map((e) => (
                  <RowCard key={e.id} onPress={() => router.push(`/cashback/${e.id}`)}>
                    <Avatar label={e.mark} tint={e.tint} size={42} />
                    <View style={styles.rowText}>
                      <ThemedText type="rowTitle" numberOfLines={1}>
                        {e.name}
                      </ThemedText>
                      <ThemedText type="micro" themeColor="mut" numberOfLines={1} style={styles.rowMeta}>
                        {e.meta}
                      </ThemedText>
                    </View>
                    <ThemedText
                      type="amountValue"
                      style={{ color: e.dir === 'in' ? theme.pos : theme.neg }}
                    >
                      {e.amt}
                    </ThemedText>
                    <Icon name="chevronRight" size={18} color={theme.mut} strokeWidth={2.2} />
                  </RowCard>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: Screen.horizontal, paddingBottom: Screen.bottom, gap: 24 },

  hero: { borderRadius: Radius.hero, padding: 22, gap: 6 },
  heroFigure: { marginVertical: 2 },
  heroSkeleton: { marginVertical: Spacing.one },
  heroCta: { alignSelf: 'flex-start', marginTop: 14, paddingHorizontal: 26 },

  tier: { gap: 10 },
  tierRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },

  rows: { gap: Screen.rowGap },
  rowText: { flex: 1, minWidth: 0 },
  rowMeta: { marginTop: 3 },
});
