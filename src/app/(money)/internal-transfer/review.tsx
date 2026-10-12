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
import { formatMoneyCompact } from '@/lib/format';
import { usePendingTxStore } from '@/stores/pending-tx-store';
import { useWalletStore } from '@/stores/wallet-store';

/**
 * `design/vertex transfer/vertex-send review transfer.png` — the step that was missing between the
 * amount screen and the PIN.
 *
 * A gradient hero states what the recipient gets and which wallet it leaves, then a hairline-ruled
 * `To / From / Fee / Arrives` breakdown, a warning, and "Confirm with PIN". Same construction as
 * `bills/review.tsx`.
 */
export default function InternalTransferReviewScreen() {
  const theme = useTheme();
  const draft = usePendingTxStore((s) => s.draft);
  const getAsset = useWalletStore((s) => s.getAsset);

  const fromCode = draft?.asset ?? 'NGN';
  const toCode = draft?.meta?.toCode ?? fromCode;
  const amount = draft?.amount ?? 0;
  const recipient = draft?.target ?? 'Your recipient';
  // `MOCK_VERTEX_USERS` already stores the tag with its leading "@".
  const tag = draft?.meta?.tag;
  const fromAsset = getAsset(fromCode);

  /**
   * Taken off the draft, not recomputed. Either leg may have been typed exactly on the amount screen,
   * and re-deriving the receiving figure through the rate would drift from what the user actually saw
   * and agreed to. The fallback covers a same-currency transfer and a cold deep link.
   */
  const received = Number(draft?.meta?.receiveAmount ?? 0) || amount;

  const rows = [
    { label: 'To', value: tag ? `${recipient} · ${tag}` : recipient },
    { label: 'From', value: `${fromCode} wallet` },
    { label: 'Fee', value: draft?.fee ?? 'Free' },
    { label: 'Arrives', value: 'Instantly' },
  ];

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScreenHeader title="Review transfer" />

        <View style={styles.content}>
          <LinearGradient
            colors={[theme.wash1, theme.wash2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <ThemedText type="label" themeColor="mut">
              Recipient gets
            </ThemedText>
            <ThemedText type="screenTitle" style={styles.heroFigure}>
              {formatMoneyCompact(received, toCode)}
            </ThemedText>
            <ThemedText type="label" themeColor="mut">
              {fromCode === toCode
                ? `Leaves your ${fromCode} wallet`
                : `${formatMoneyCompact(amount, fromCode)} leaves your ${fromCode} wallet`}
            </ThemedText>
          </LinearGradient>

          <DetailCard rows={rows} />

          <AlertBanner
            tone="accent"
            icon="alert"
            iconStyle="bare"
            title="Check the recipient"
            body={
              fromAsset
                ? `Vertex transfers land instantly and cannot be recalled. Your ${fromCode} wallet holds ${formatMoneyCompact(fromAsset.bal, fromCode)}.`
                : 'Vertex transfers land instantly and cannot be recalled.'
            }
          />
        </View>

        <View style={styles.footer}>
          <ButtonPrimary
            label="Confirm with PIN"
            onPress={() => router.push('/(money)/internal-transfer/pin')}
          />
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
