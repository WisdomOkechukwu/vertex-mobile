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
 * No reference exists for the send review step — only the Vertex and bills ones. It follows their
 * grammar rather than inventing a third: a `wash1 → wash2` hero carrying the figure and the wallet it
 * leaves, the shared hairline `DetailCard`, then the warning the rail deserves. It used to be the one
 * review screen in the app built from ad-hoc rows, and read visibly plainer than its neighbours.
 */
export default function SendReviewScreen() {
  const theme = useTheme();
  const draft = usePendingTxStore((s) => s.draft);
  const getAsset = useWalletStore((s) => s.getAsset);

  const code = draft?.asset ?? 'NGN';
  const asset = getAsset(code);
  const amount = draft?.amount ?? 0;
  const isCrypto = draft?.kind === 'cryptoSend';

  const rows = [
    { label: 'To', value: draft?.target ?? '' },
    { label: 'From', value: `${code} wallet` },
    { label: 'Via', value: draft?.label ?? '' },
    { label: 'Fee', value: draft?.fee ?? 'Free' },
    { label: 'Arrives', value: isCrypto ? 'After network confirmation' : 'Within a few minutes' },
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
              {formatMoneyCompact(amount, code)}
            </ThemedText>
            <ThemedText type="label" themeColor="mut">
              Leaves your {code} wallet
            </ThemedText>
          </LinearGradient>

          <DetailCard rows={rows} />

          <AlertBanner
            tone="accent"
            icon="alert"
            iconStyle="bare"
            title="Check the recipient"
            body={
              isCrypto
                ? 'Crypto transfers cannot be reversed. Confirm the address and network before you send.'
                : asset
                  ? `Bank transfers can only be recalled with the receiving bank's help. Your ${code} wallet holds ${formatMoneyCompact(asset.bal, code)}.`
                  : "Bank transfers can only be recalled with the receiving bank's help."
            }
          />
        </View>

        <View style={styles.footer}>
          <ButtonPrimary label="Confirm with PIN" onPress={() => router.push('/(money)/send/pin')} />
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
