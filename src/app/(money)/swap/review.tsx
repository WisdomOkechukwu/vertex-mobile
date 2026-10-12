import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlertBanner } from '@/components/ui/alert-banner';
import { ButtonPrimary } from '@/components/ui/button-primary';
import { DetailCard } from '@/components/ui/detail-card';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ThemedText } from '@/components/themed-text';
import { Radius, Screen } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatMoney, formatMoneyCompact } from '@/lib/format';
import { usePendingTxStore } from '@/stores/pending-tx-store';
import { useWalletStore } from '@/stores/wallet-store';

/**
 * The confirmation step swap never had. It follows the grammar of `send/review.tsx` and
 * `internal-transfer/review.tsx` — a `wash1 → wash2` hero carrying what lands, the shared hairline
 * `DetailCard`, then the one thing worth warning about.
 *
 * Both amounts come off the draft rather than being recomputed: with both legs editable on the entry
 * screen, either figure may have been typed exactly, and re-deriving it through the rate would drift.
 */
export default function SwapReviewScreen() {
  const theme = useTheme();
  const draft = usePendingTxStore((s) => s.draft);
  const getAsset = useWalletStore((s) => s.getAsset);

  const fromCode = draft?.meta?.fromCode ?? draft?.asset ?? 'NGN';
  const toCode = draft?.meta?.toCode ?? fromCode;
  const paid = draft?.amount ?? 0;
  const received = Number(draft?.meta?.receiveAmount ?? 0);

  const from = getAsset(fromCode);
  const to = getAsset(toCode);
  const rate = from && to ? from.rate / to.rate : 0;

  const rows = [
    { label: 'You pay', value: formatMoney(paid, fromCode) },
    { label: 'You receive', value: formatMoney(received, toCode) },
    { label: 'Rate', value: `1 ${fromCode} = ${rate.toFixed(6)} ${toCode}` },
    { label: 'Vertex fee', value: draft?.fee ?? '0.5%' },
    { label: 'Arrives', value: 'Instantly' },
  ];

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScreenHeader title="Review swap" />

        <View style={styles.content}>
          <LinearGradient
            colors={[theme.wash1, theme.wash2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <ThemedText type="label" themeColor="mut">
              You receive
            </ThemedText>
            <ThemedText type="screenTitle" style={styles.heroFigure}>
              {formatMoneyCompact(received, toCode)}
            </ThemedText>
            <ThemedText type="label" themeColor="mut">
              {formatMoneyCompact(paid, fromCode)} leaves your {fromCode} wallet
            </ThemedText>
          </LinearGradient>

          <DetailCard rows={rows} />

          <AlertBanner
            tone="accent"
            icon="clock"
            iconStyle="bare"
            title="The rate is held for 60 seconds"
            body="Confirm within a minute or the swap is re-quoted at the rate current when you do."
          />
        </View>

        <View style={styles.footer}>
          <ButtonPrimary label="Confirm with PIN" onPress={() => router.push('/(money)/swap/pin')} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Screen.horizontal, gap: 20 },
  hero: { borderRadius: Radius.hero, padding: 22, alignItems: 'center', gap: 6 },
  heroFigure: { marginVertical: 2 },
  footer: { paddingHorizontal: Screen.horizontal, paddingBottom: Screen.bottom },
});
