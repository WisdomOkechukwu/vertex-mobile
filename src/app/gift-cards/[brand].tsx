import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { ButtonPrimary } from '@/components/ui/button-primary';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { CurrencyBadge, PickerField } from '@/components/ui/picker-field';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemedText } from '@/components/themed-text';
import { Radius, Screen } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { isLoading } from '@/lib/api-status';
import { formatMoney, formatMoneyCompact } from '@/lib/format';
import { initialsFor, walletOptions } from '@/lib/picker-options';
import { useGiftCardsStore } from '@/stores/gift-cards-store';
import { usePendingTxStore } from '@/stores/pending-tx-store';
import { useUiStore } from '@/stores/ui-store';
import { useWalletStore } from '@/stores/wallet-store';

/**
 * Pick a denomination and the wallet that pays for it.
 *
 * The face value is in the brand's own currency; the charge is whatever that converts to in the
 * chosen wallet. That conversion is the same one `AmountSheetBody` does for card top-ups — each
 * asset's `rate` is its value in naira, so the price goes to naira and back out at the payer's rate.
 */
export default function GiftCardBrandScreen() {
  const theme = useTheme();
  const { brand: brandId } = useLocalSearchParams<{ brand: string }>();
  const openSheet = useUiStore((s) => s.openSheet);
  const setDraft = usePendingTxStore((s) => s.setDraft);

  const { brands, status, fetchGiftCards } = useGiftCardsStore();
  const { assets, fetchAssets, status: walletStatus } = useWalletStore();

  const [denomination, setDenomination] = useState<number | null>(null);
  const [fromCode, setFromCode] = useState('NGN');

  useEffect(() => {
    if (brands.length === 0) fetchGiftCards();
    if (assets.length === 0) fetchAssets();
  }, [brands.length, fetchGiftCards, assets.length, fetchAssets]);

  const loading = (brands.length === 0 && isLoading(status)) || (assets.length === 0 && isLoading(walletStatus));
  const brand = brands.find((b) => b.id === brandId);

  const amount = denomination ?? brand?.denominations[0] ?? 0;
  const face = assets.find((a) => a.code === brand?.currency);
  const from = assets.find((a) => a.code === fromCode);
  const cost = face && from ? (amount * face.rate) / from.rate : amount;
  const overBalance = !!from && cost > from.bal;

  if (!loading && !brand) {
    return (
      <View style={[styles.flex, { backgroundColor: theme.background }]}>
        <SafeAreaView style={styles.flex} edges={['top']}>
          <ScreenHeader title="Gift card" />
          <EmptyState
            icon="giftCard"
            title="We cannot find that gift card"
            description="It may have been withdrawn from the catalogue."
            action={{ label: 'Back to gift cards', onPress: () => router.replace('/gifts') }}
          />
        </SafeAreaView>
      </View>
    );
  }

  const onContinue = () => {
    if (!brand) return;
    setDraft({
      kind: 'giftCard',
      label: `${brand.name} gift card`,
      target: `${formatMoneyCompact(amount, brand.currency)} ${brand.name}`,
      // The draft's amount is what actually leaves the wallet; the face value rides in `meta`.
      amount: cost,
      fee: 'Free',
      ctaLabel: 'Buy',
      needPin: true,
      asset: fromCode,
      meta: {
        brandId: brand.id,
        brandName: brand.name,
        face: String(amount),
        faceCurrency: brand.currency,
      },
    });
    router.push('/gift-cards/review');
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScreenHeader title={brand?.name ?? 'Gift card'} />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <>
              <Skeleton height={150} radius={Radius.hero} />
              <Skeleton height={44} radius={Radius.pill} />
              <Skeleton height={62} radius={Radius.tile} />
            </>
          ) : (
            <>
              <LinearGradient
                colors={[theme.wash1, theme.wash2]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.hero}
              >
                <Avatar label={initialsFor(brand!.name)} tint={brand!.tint} size={52} />
                <ThemedText type="screenTitle" style={styles.heroFigure}>
                  {formatMoney(amount, brand!.currency)}
                </ThemedText>
                <ThemedText type="body" themeColor="mut" style={styles.heroBlurb}>
                  {brand!.blurb}
                </ThemedText>
              </LinearGradient>

              <View style={styles.block}>
                <ThemedText type="fieldLabel" themeColor="mut">
                  Choose an amount
                </ThemedText>
                <View style={styles.denominations}>
                  {brand!.denominations.map((d) => (
                    <Chip
                      key={d}
                      label={formatMoneyCompact(d, brand!.currency)}
                      active={d === amount}
                      onPress={() => setDenomination(d)}
                      style={styles.denomination}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.block}>
                <ThemedText type="fieldLabel" themeColor="mut">
                  Pay from
                </ThemedText>
                <PickerField
                  badge={<CurrencyBadge code={fromCode} tint={from?.tint} />}
                  value={`${fromCode} wallet`}
                  sublabel={from ? `${formatMoney(from.bal, fromCode)} available` : undefined}
                  onPress={() =>
                    openSheet('picker', {
                      title: 'Pay from',
                      options: walletOptions(assets),
                      selected: fromCode,
                      onSelect: setFromCode,
                    })
                  }
                />
              </View>

              <ThemedText type="body" themeColor={overBalance ? 'neg' : 'mut'} style={styles.costLine}>
                {overBalance
                  ? `Your ${fromCode} wallet only holds ${formatMoney(from!.bal, fromCode)}`
                  : fromCode === brand!.currency
                    ? 'Charged to your wallet at face value.'
                    : `Costs ${formatMoney(cost, fromCode)} from your ${fromCode} wallet.`}
              </ThemedText>
            </>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <ButtonPrimary
            label={overBalance ? 'Not enough balance' : `Buy for ${formatMoneyCompact(cost, fromCode)}`}
            disabled={loading || overBalance || amount <= 0}
            onPress={onContinue}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: Screen.horizontal, paddingBottom: Screen.bottom, gap: 20 },

  hero: { borderRadius: Radius.hero, padding: 22, alignItems: 'center', gap: 8 },
  heroFigure: { marginTop: 2 },
  heroBlurb: { textAlign: 'center', lineHeight: 19 },

  block: { gap: 8 },
  denominations: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  denomination: { minWidth: 82, alignItems: 'center' },

  costLine: { lineHeight: 19 },
  footer: { paddingHorizontal: Screen.horizontal, paddingBottom: Screen.bottom, paddingTop: 8 },
});
