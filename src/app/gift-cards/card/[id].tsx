import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { ButtonGhost } from '@/components/ui/button-ghost';
import { ButtonPrimary } from '@/components/ui/button-primary';
import { DetailCard } from '@/components/ui/detail-card';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { FadeReveal } from '@/components/ui/reveal';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import { Radius, Screen } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { isLoading } from '@/lib/api-status';
import { formatMoney, formatMoneyCompact } from '@/lib/format';
import { initialsFor } from '@/lib/picker-options';
import { useGiftCardsStore } from '@/stores/gift-cards-store';

/**
 * A card you own. The code is hidden until you ask for it — it is a bearer instrument, so it should
 * not be sitting on screen the moment anyone opens the app over your shoulder.
 */
export default function PurchasedGiftCardScreen() {
  const theme = useTheme();
  const { show } = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { purchased, status, fetchGiftCards, markRedeemed } = useGiftCardsStore();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (purchased.length === 0) fetchGiftCards();
  }, [purchased.length, fetchGiftCards]);

  const loading = purchased.length === 0 && isLoading(status);
  const card = purchased.find((c) => c.id === id);

  if (loading) {
    return (
      <View style={[styles.flex, { backgroundColor: theme.background }]}>
        <SafeAreaView style={styles.flex} edges={['top']}>
          <ScreenHeader title="Gift card" />
          <View style={styles.loadingWrap}>
            <Skeleton height={170} radius={Radius.hero} />
            <Skeleton height={72} radius={Radius.tile} />
            <Skeleton height={200} radius={Radius.cardLg} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!card) {
    return (
      <View style={[styles.flex, { backgroundColor: theme.background }]}>
        <SafeAreaView style={styles.flex} edges={['top']}>
          <ScreenHeader title="Gift card" />
          <EmptyState
            icon="giftCard"
            title="We cannot find that gift card"
            description="It may belong to another account."
            action={{ label: 'Back to gift cards', onPress: () => router.replace('/gifts') }}
          />
        </SafeAreaView>
      </View>
    );
  }

  const onCopy = async () => {
    await Clipboard.setStringAsync(card.code);
    show('Code copied', 'success');
  };

  const rows = [
    { label: 'Face value', value: formatMoney(card.amount, card.currency) },
    { label: 'You paid', value: formatMoney(card.paid, card.paidCurrency) },
    { label: 'Bought', value: card.purchased },
    { label: 'Redeem at', value: card.redeemAt },
    ...(card.pin ? [{ label: 'PIN', value: revealed ? card.pin : '••••' }] : []),
  ];

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScreenHeader title={card.brandName} />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={[theme.wash1, theme.wash2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <Avatar label={initialsFor(card.brandName)} tint={card.tint} size={52} />
            <ThemedText type="screenTitle" style={styles.heroFigure}>
              {formatMoneyCompact(card.amount, card.currency)}
            </ThemedText>
            <StatusBadge
              status={card.status === 'active' ? 'success' : 'pending'}
              label={card.status === 'active' ? 'Ready to redeem' : 'Marked redeemed'}
              align="center"
            />
          </LinearGradient>

          <View style={styles.block}>
            <ThemedText type="fieldLabel" themeColor="mut">
              Your code
            </ThemedText>
            {revealed ? (
              <FadeReveal>
                <PressableScale onPress={onCopy} style={[styles.codeRow, { backgroundColor: theme.key }]}>
                  <ThemedText type="codeLabel" style={styles.code} numberOfLines={1}>
                    {card.code}
                  </ThemedText>
                  <Icon name="copy" size={17} color={theme.accent} strokeWidth={2} />
                </PressableScale>
              </FadeReveal>
            ) : (
              <PressableScale
                onPress={() => setRevealed(true)}
                style={[styles.codeRow, styles.codeHidden, { borderColor: theme.line }]}
              >
                <Icon name="eye" size={17} color={theme.accent} strokeWidth={2} />
                <ThemedText type="inputText" themeColor="accent">
                  Tap to reveal
                </ThemedText>
              </PressableScale>
            )}
          </View>

          <DetailCard rows={rows} />

          {card.status === 'active' && (
            <ButtonGhost
              variant="fill"
              label="Mark as redeemed"
              leftIcon="check"
              onPress={async () => {
                await markRedeemed(card.id);
                show('Marked as redeemed', 'success');
              }}
            />
          )}
        </ScrollView>

        <View style={styles.footer}>
          <ButtonPrimary label="Done" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: Screen.horizontal, paddingBottom: Screen.bottom, gap: 20 },
  loadingWrap: { paddingHorizontal: Screen.horizontal, gap: 16, paddingTop: 8 },

  hero: { borderRadius: Radius.hero, padding: 22, alignItems: 'center', gap: 8 },
  heroFigure: { marginTop: 2 },

  block: { gap: 8 },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    minHeight: 62,
    paddingHorizontal: 18,
    borderRadius: Radius.tile,
  },
  codeHidden: { borderWidth: 1.5, borderStyle: 'dashed' },
  code: { flex: 1, minWidth: 0 },

  footer: { paddingHorizontal: Screen.horizontal, paddingBottom: Screen.bottom, paddingTop: 8 },
});
