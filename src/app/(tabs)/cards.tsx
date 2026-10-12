import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionTile } from '@/components/ui/action-tile';
import { CardVisual } from '@/components/ui/card-visual';
import { CircleButton } from '@/components/ui/circle-button';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { SectionHeading } from '@/components/ui/section-heading';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/ui/stat-card';
import { ThemedText } from '@/components/themed-text';
import { TransactionRow } from '@/components/ui/transaction-row';
import { Radius, Screen } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { isLoading } from '@/lib/api-status';
import { formatMoney, formatMoneyCompact } from '@/lib/format';
import { MOCK_CARD_ACTIVITY } from '@/services/mock/data/cards';
import { useAuthStore } from '@/stores/auth-store';
import { useCardsStore } from '@/stores/cards-store';
import { useUiStore } from '@/stores/ui-store';
import { useFirstRunTour } from '@/hooks/use-first-run-tour';

const CARD_WIDTH = 288;
const CARD_GAP = 12;

/**
 * Virtual cards, from `design/virtual card/default.png`: a swipeable carousel of card faces, the
 * pager and "New card" control, the Details / Freeze / Top up tiles, this card's spend summary, and
 * its transactions.
 */
export default function CardsScreen() {
  useFirstRunTour('cards');
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const openSheet = useUiStore((s) => s.openSheet);
  const { virtualCards, status, fetchCards, toggleFreeze } = useCardsStore();

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const card = virtualCards[index];
  const loading = isLoading(status);
  const activity = card ? (MOCK_CARD_ACTIVITY[card.id] ?? []) : [];
  const holder = user?.fullName ? `${user.fullName[0]}. ${user.fullName.split(' ').pop()?.toUpperCase()}` : undefined;

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex}>
        <View style={styles.header}>
          <CircleButton icon="chevronLeft" onPress={() => router.back()} />
          <ThemedText type="sectionHeader" style={styles.headerTitle}>
            Virtual cards
          </ThemedText>
          <CircleButton icon="plus" onPress={() => router.push('/cards/new')} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Screen.bottomWithNav }}
        >
          {loading ? (
            <View style={styles.loadingWrap}>
              <Skeleton width={CARD_WIDTH} height={196} radius={Radius.hero} />
            </View>
          ) : virtualCards.length === 0 ? (
            <EmptyState
              icon="card"
              title="No virtual cards yet"
              description="Create one for subscriptions or online shopping."
              action={{ label: 'New card', onPress: () => router.push('/cards/new') }}
            />
          ) : (
            <>
              <ThemedText type="label" themeColor="mut" style={styles.swipeHint}>
                Swipe to switch card · {index + 1} of {virtualCards.length}
              </ThemedText>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH + CARD_GAP}
                decelerationRate="fast"
                contentContainerStyle={styles.carousel}
                onMomentumScrollEnd={(e) =>
                  setIndex(Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_GAP)))
                }
              >
                {virtualCards.map((c) => (
                  <CardVisual
                    key={c.id}
                    card={c}
                    width={CARD_WIDTH}
                    available={formatMoney(c.funded - c.spent, 'USD')}
                    holder={holder}
                    revealed={revealed}
                  />
                ))}
              </ScrollView>

              <View style={styles.pagerRow}>
                <View style={styles.dots}>
                  {virtualCards.map((c, i) => (
                    <View
                      key={c.id}
                      style={[
                        styles.dot,
                        {
                          backgroundColor: i === index ? c.color : theme.key,
                          width: i === index ? 22 : 8,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Pressable
                  style={[styles.newCard, { backgroundColor: theme.card }]}
                  onPress={() => router.push('/cards/new')}
                >
                  <Icon name="plus" size={17} color={theme.fg} strokeWidth={2.2} />
                  <ThemedText type="buttonGhost">New card</ThemedText>
                </Pressable>
              </View>

              {card && (
                <>
                  <View style={styles.tiles}>
                    <ActionTile
                      icon={revealed ? 'eyeOff' : 'eye'}
                      label={revealed ? 'Hide' : 'Details'}
                      onPress={() => setRevealed((r) => !r)}
                    />
                    <ActionTile
                      icon="freeze"
                      label={card.frozen ? 'Frozen' : 'Freeze'}
                      active={card.frozen}
                      onPress={() => toggleFreeze(card.id)}
                    />
                    <ActionTile
                      icon="plus"
                      label="Top up"
                      onPress={() => openSheet('card-topup', { cardId: card.id, cardName: card.name })}
                    />
                  </View>

                  <View style={styles.section}>
                    <StatCard
                      caption={`${card.name} · this month`}
                      leftLabel="Funded"
                      leftValue={formatMoney(card.funded, 'USD')}
                      rightLabel="Spent"
                      rightValue={formatMoney(card.spent, 'USD')}
                      progress={card.limit ? card.spent / card.limit : 0}
                      footnote={`${formatMoney(card.spent, 'USD')} of your ${formatMoneyCompact(card.limit, 'USD')} monthly limit used`}
                    />
                  </View>

                  <View style={styles.section}>
                    <SectionHeading
                      title={`${card.name} transactions`}
                      meta={`${activity.length} this month`}
                    />
                    <View style={styles.txList}>
                      {activity.map((tx) => (
                        <TransactionRow
                          key={tx.id}
                          tx={tx}
                          onPress={() => router.push(`/transactions/${tx.id}`)}
                        />
                      ))}
                    </View>
                  </View>
                </>
              )}
            </>
          )}
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
    paddingBottom: 18,
  },
  headerTitle: { flex: 1, textAlign: 'center' },

  swipeHint: { paddingHorizontal: Screen.horizontal, marginBottom: 12 },
  carousel: { gap: CARD_GAP, paddingHorizontal: Screen.horizontal },
  loadingWrap: { paddingHorizontal: Screen.horizontal },

  pagerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Screen.horizontal,
    marginTop: 18,
  },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { height: 8, borderRadius: Radius.pill },
  newCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: Radius.pill,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },

  tiles: { flexDirection: 'row', gap: 10, paddingHorizontal: Screen.horizontal, marginTop: 18 },
  section: { paddingHorizontal: Screen.horizontal, marginTop: 20 },
  txList: { gap: Screen.rowGap },
});
