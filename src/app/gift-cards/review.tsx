import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlertBanner } from '@/components/ui/alert-banner';
import { Avatar } from '@/components/ui/avatar';
import { ButtonPrimary } from '@/components/ui/button-primary';
import { DetailCard } from '@/components/ui/detail-card';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ThemedText } from '@/components/themed-text';
import { Radius, Screen } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatMoney, formatMoneyCompact } from '@/lib/format';
import { initialsFor } from '@/lib/picker-options';
import { usePendingTxStore } from '@/stores/pending-tx-store';

/**
 * The confirmation step, in the grammar `send/review.tsx`, `bills/review.tsx` and
 * `internal-transfer/review.tsx` share: a `wash1 → wash2` hero, the shared `DetailCard`, then the one
 * thing worth warning about — here, that a code cannot be unsent.
 */
export default function GiftCardReviewScreen() {
  const theme = useTheme();
  const draft = usePendingTxStore((s) => s.draft);

  const brandName = draft?.meta?.brandName ?? 'Gift card';
  const faceCurrency = draft?.meta?.faceCurrency ?? 'USD';
  const face = Number(draft?.meta?.face ?? 0);
  const payCode = draft?.asset ?? 'NGN';
  const cost = draft?.amount ?? 0;

  const rows = [
    { label: 'Gift card', value: brandName },
    { label: 'Face value', value: formatMoney(face, faceCurrency) },
    { label: 'Paid from', value: `${payCode} wallet` },
    { label: 'You pay', value: formatMoney(cost, payCode) },
    { label: 'Fee', value: draft?.fee ?? 'Free' },
    { label: 'Delivery', value: 'Code shown instantly' },
  ];

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScreenHeader title="Check the details" />

        <View style={styles.content}>
          <LinearGradient
            colors={[theme.wash1, theme.wash2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <Avatar label={initialsFor(brandName)} size={48} />
            <ThemedText type="screenTitle" style={styles.heroFigure}>
              {formatMoneyCompact(face, faceCurrency)}
            </ThemedText>
            <ThemedText type="label" themeColor="mut">
              {formatMoneyCompact(cost, payCode)} leaves your {payCode} wallet
            </ThemedText>
          </LinearGradient>

          <DetailCard rows={rows} />

          <AlertBanner
            tone="accent"
            icon="alert"
            iconStyle="bare"
            title="Gift card codes are final"
            body="Once a code is issued it cannot be cancelled or refunded, so check the brand and amount."
          />
        </View>

        <View style={styles.footer}>
          <ButtonPrimary label="Confirm with PIN" onPress={() => router.push('/(money)/gift-card/pin')} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Screen.horizontal, gap: 20 },
  hero: { borderRadius: Radius.hero, padding: 22, alignItems: 'center', gap: 8 },
  heroFigure: { marginVertical: 2 },
  footer: { paddingHorizontal: Screen.horizontal, paddingBottom: Screen.bottom },
});
