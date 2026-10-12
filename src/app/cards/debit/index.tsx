import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonPrimary } from '@/components/ui/button-primary';
import { CardBrandMark } from '@/components/ui/card-brand-mark';
import { Icon } from '@/components/ui/icon';
import { InfoBanner } from '@/components/ui/info-banner';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemedText } from '@/components/themed-text';
import { Radius, Screen, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { isLoading } from '@/lib/api-status';
import { useCardsStore } from '@/stores/cards-store';
import { usePendingTxStore } from '@/stores/pending-tx-store';

/**
 * `design/add money/select debit card.png`. Reached from Add money's "My debit cards", which passes
 * the wallet being funded so the amount screen that follows knows its currency — and so the intro
 * line can name it.
 *
 * The reference's row is a picture of a card, the brand and last four on one bold line, and the bank,
 * expiry and default flag beneath. Selection is an accent border plus a filled check disc; the fill
 * stays `card` (sampled — the selected row is not tinted, unlike the picker-sheet rows).
 */
export default function DebitCardsScreen() {
  const theme = useTheme();
  const { asset } = useLocalSearchParams<{ asset?: string }>();
  const { debitCards, fetchCards, status } = useCardsStore();
  const setDraft = usePendingTxStore((s) => s.setDraft);
  const [explicitSelection, setExplicitSelection] = useState<string | null>(null);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // Default to the primary card (or the first) until the user taps a different one, without a
  // setState-in-effect round trip — derived directly from the loaded list on every render.
  const selected = explicitSelection ?? debitCards.find((c) => c.primary)?.id ?? debitCards[0]?.id ?? null;
  const card = debitCards.find((c) => c.id === selected);
  const assetCode = asset ?? 'NGN';

  /**
   * An earlier build called `router.back()` here, so selecting a card and tapping the primary CTA
   * did nothing. It opens the top-up chain from `design/add money/top up via card.png`.
   */
  const onTopUp = () => {
    if (!card) return;
    setDraft({
      kind: 'deposit',
      label: `Card top-up · ${card.brand} ···${card.last4}`,
      target: `From ${card.brand} ···${card.last4} · into your ${assetCode} wallet`,
      amount: 0,
      // The reference prints 1.4% against "My debit cards" on the Add money screen.
      fee: '1.4%',
      ctaLabel: 'Charge my card',
      needPin: true,
      asset: assetCode,
      meta: { cardId: card.id },
    });
    router.push('/(money)/deposit/amount');
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScreenHeader title="My debit cards" />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ThemedText type="bodyLg" themeColor="mut" style={styles.intro}>
            Pick the card to charge, then enter how much to add to your {assetCode} wallet.
          </ThemedText>

          <View style={styles.rows}>
            {debitCards.length === 0 && isLoading(status)
              ? [0, 1].map((i) => <Skeleton key={i} height={78} radius={Radius.card} />)
              : null}
            {debitCards.map((c) => {
              const isSelected = selected === c.id;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setExplicitSelection(c.id)}
                  style={({ pressed }) => [
                    styles.row,
                    {
                      backgroundColor: theme.card,
                      borderColor: isSelected ? theme.accent : 'transparent',
                    },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <CardBrandMark brand={c.brand} tint={c.tint} />
                  <View style={styles.textCol}>
                    <ThemedText type="cardTitle" numberOfLines={1}>
                      {c.brand} ···{c.last4}
                    </ThemedText>
                    <ThemedText type="body" themeColor="mut" numberOfLines={1} style={styles.subtitle}>
                      {c.bank} · expires {c.exp}
                      {c.primary ? ' · default' : ''}
                    </ThemedText>
                  </View>
                  {isSelected ? (
                    <View style={[styles.check, { backgroundColor: theme.accent }]}>
                      <Icon name="check" size={14} color={theme.onAccent} strokeWidth={3} />
                    </View>
                  ) : (
                    <View style={[styles.ring, { borderColor: theme.line }]} />
                  )}
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={() => router.push('/cards/debit/new')}
            style={({ pressed }) => [styles.dashedRow, { borderColor: theme.line }, pressed && { opacity: 0.7 }]}
          >
            <Icon name="plus" size={20} color={theme.mut} strokeWidth={2} />
            <ThemedText type="bodyLg" themeColor="mut">
              Add a debit card
            </ThemedText>
          </Pressable>

          <InfoBanner text="Card details are tokenised by our PCI-DSS processor. Vertex never stores your full card number or CVV." />
        </ScrollView>
        <View style={styles.footer}>
          <ButtonPrimary label="Top up with this card" disabled={!selected} onPress={onTopUp} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: Screen.horizontal, paddingBottom: Screen.bottom, gap: Spacing.three },
  intro: { lineHeight: 21 },

  rows: { gap: Screen.rowGap },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: Radius.card,
    borderWidth: 1.5,
  },
  textCol: { flex: 1, minWidth: 0 },
  subtitle: { marginTop: 3 },
  check: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  ring: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, flexShrink: 0 },

  dashedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderRadius: Radius.card,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },

  footer: { paddingHorizontal: Screen.horizontal, paddingBottom: Screen.bottom, paddingTop: Spacing.two },
});
