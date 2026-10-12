import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { Chip } from '@/components/ui/chip';
import { CircleButton } from '@/components/ui/circle-button';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Stagger } from '@/components/ui/reveal';
import { SectionHeading } from '@/components/ui/section-heading';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusPill } from '@/components/ui/status-pill';
import { ThemedText } from '@/components/themed-text';
import { Radius, Screen } from '@/constants/theme';
import { useFirstRunTour } from '@/hooks/use-first-run-tour';
import { useTheme } from '@/hooks/use-theme';
import { isLoading } from '@/lib/api-status';
import { formatMoney, formatMoneyCompact } from '@/lib/format';
import { initialsFor } from '@/lib/picker-options';
import type { GiftCardCategory } from '@/services/types/gift-cards';
import { useGiftCardsStore } from '@/stores/gift-cards-store';

const CATEGORIES: (GiftCardCategory | 'All')[] = ['All', 'Shopping', 'Streaming', 'Gaming', 'Travel', 'Food'];

/**
 * Gift cards — the fifth tab. Follows `links/index.tsx`'s chrome: a gradient hero carrying the
 * running total, a filter row, the catalogue, then what you already own.
 *
 * Everything here is bought with *any* wallet: a card's price is quoted in its own currency and the
 * charge converts at the paying wallet's rate, the same arithmetic the card top-up sheet uses.
 */
export default function GiftCardsScreen() {
  useFirstRunTour('gifts');
  const theme = useTheme();
  const { brands, purchased, status, fetchGiftCards } = useGiftCardsStore();
  const [category, setCategory] = useState<GiftCardCategory | 'All'>('All');

  useEffect(() => {
    fetchGiftCards();
  }, [fetchGiftCards]);

  const loading = brands.length === 0 && isLoading(status);
  const shown = category === 'All' ? brands : brands.filter((b) => b.category === category);
  /** Face value is per-brand currency, so the hero counts cards rather than adding up two currencies. */
  const active = purchased.filter((c) => c.status === 'active');

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <View style={styles.header}>
          <CircleButton icon="chevronLeft" onPress={() => router.back()} />
          <ThemedText type="sectionHeader" style={styles.headerTitle}>
            Gift cards
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={[theme.wash1, theme.wash2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <ThemedText type="label" themeColor="mut">
              Ready to redeem
            </ThemedText>
            {loading ? (
              <Skeleton width={180} height={38} />
            ) : (
              <ThemedText type="display">
                {active.length === 1 ? '1 card' : `${active.length} cards`}
              </ThemedText>
            )}
            <ThemedText type="label" themeColor="mut">
              Buy with any wallet · codes arrive instantly
            </ThemedText>
          </LinearGradient>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            {CATEGORIES.map((c) => (
              <Chip key={c} label={c} active={c === category} onPress={() => setCategory(c)} />
            ))}
          </ScrollView>

          <View style={styles.grid}>
            {loading
              ? [0, 1, 2, 3].map((i) => <Skeleton key={i} height={104} radius={Radius.card} style={styles.gridCell} />)
              : shown.map((brand, i) => (
                  <Stagger key={`${category}-${brand.id}`} index={i} style={styles.gridCell}>
                    <PressableScale
                      onPress={() => router.push(`/gift-cards/${brand.id}`)}
                      style={[styles.brand, { backgroundColor: theme.card }]}
                    >
                      <Avatar label={initialsFor(brand.name)} tint={brand.tint} size={40} />
                      <ThemedText type="rowTitle" numberOfLines={1}>
                        {brand.name}
                      </ThemedText>
                      <ThemedText type="micro" themeColor="mut" numberOfLines={1}>
                        From {formatMoneyCompact(brand.denominations[0], brand.currency)}
                      </ThemedText>
                    </PressableScale>
                  </Stagger>
                ))}
          </View>

          <View style={styles.section}>
            <SectionHeading title="Your gift cards" meta={loading ? undefined : `${purchased.length} bought`} />
            {loading ? (
              <View style={styles.rows}>
                {[0, 1].map((i) => (
                  <Skeleton key={i} height={74} radius={Radius.card} />
                ))}
              </View>
            ) : purchased.length === 0 ? (
              <EmptyState
                icon="giftCard"
                title="No gift cards yet"
                description="Buy one above and the code lands here straight away."
              />
            ) : (
              <View style={styles.rows}>
                {purchased.map((card) => (
                  <PressableScale
                    key={card.id}
                    onPress={() => router.push(`/gift-cards/card/${card.id}`)}
                    style={[styles.row, { backgroundColor: theme.card }]}
                  >
                    <Avatar label={initialsFor(card.brandName)} tint={card.tint} size={42} />
                    <View style={styles.rowText}>
                      <ThemedText type="rowTitle" numberOfLines={1}>
                        {card.brandName}
                      </ThemedText>
                      <ThemedText type="micro" themeColor="mut" numberOfLines={1} style={styles.rowSub}>
                        {formatMoney(card.amount, card.currency)} · {card.purchased}
                      </ThemedText>
                    </View>
                    {card.status === 'active' ? (
                      <StatusPill label="Ready" tone="accentSoft" />
                    ) : (
                      <StatusPill label="Redeemed" tone="neutral" />
                    )}
                    <Icon name="chevronRight" size={16} color={theme.mut} strokeWidth={2.2} />
                  </PressableScale>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Screen.horizontal,
    paddingTop: Screen.top,
    paddingBottom: 10,
  },
  headerTitle: { flex: 1, textAlign: 'center' },
  headerSpacer: { width: 42 },

  content: { paddingHorizontal: Screen.horizontal, paddingBottom: Screen.bottomWithNav, gap: 18 },
  hero: { borderRadius: Radius.hero, padding: 20, gap: 6 },

  filters: { gap: 8, paddingRight: Screen.horizontal },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  // Two per row: half the width less half the gap.
  gridCell: { width: '48%', flexGrow: 1 },
  brand: { borderRadius: Radius.card, padding: 15, gap: 8 },

  section: { gap: 0 },
  rows: { gap: Screen.rowGap },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: Radius.card,
  },
  rowText: { flex: 1, minWidth: 0 },
  rowSub: { marginTop: 3 },
});
