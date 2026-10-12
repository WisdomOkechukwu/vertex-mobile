import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlertBanner } from '@/components/ui/alert-banner';
import { ButtonPrimary } from '@/components/ui/button-primary';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ThemedText } from '@/components/themed-text';
import { Radius, Screen } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { LOYALTY } from '@/constants/content';
import { formatMoney, formatMoneyCompact } from '@/lib/format';
import { initialsFor } from '@/lib/picker-options';
import { BILL_CASHBACK_RATE, BILL_FEE } from '@/services/mock/data/bills';
import { usePendingTxStore } from '@/stores/pending-tx-store';
import { useWalletStore } from '@/stores/wallet-store';

/**
 * `design/utility/review-payment.png`: a gradient hero holding the provider monogram, the provider
 * and bill title, then the amount left-aligned beneath them; a green cashback call-out; a
 * hairline-ruled six-row breakdown; and a plain footnote rather than a warning banner.
 */
export default function BillReviewScreen() {
  const theme = useTheme();
  const draft = usePendingTxStore((s) => s.draft);
  const getAsset = useWalletStore((s) => s.getAsset);

  const code = draft?.asset ?? 'NGN';
  const wallet = getAsset(code);
  const amount = draft?.amount ?? 0;
  const provider = draft?.meta?.provider ?? '';
  const reference = draft?.meta?.reference ?? '';
  const billTitle = draft?.meta?.billTitle ?? draft?.label ?? 'Bill';
  const cashback = amount * BILL_CASHBACK_RATE;

  const rows = [
    { label: draft?.meta?.fieldLabel ?? 'Meter number', value: reference },
    { label: 'Provider', value: provider },
    { label: 'Amount', value: formatMoneyCompact(amount, code) },
    // The fee is charged in naira whatever the funding wallet, as the reference shows.
    { label: 'Service fee', value: formatMoneyCompact(BILL_FEE, 'NGN') },
    // The bill is charged in the wallet's currency but the fee is always naira, so a non-NGN wallet
    // cannot be summed into one figure. The reference's own example happens to be all-naira.
    {
      label: 'Total to pay',
      value:
        code === 'NGN'
          ? formatMoneyCompact(amount + BILL_FEE, 'NGN')
          : `${formatMoneyCompact(amount, code)} + ${formatMoneyCompact(BILL_FEE, 'NGN')}`,
    },
    {
      label: 'Paid from',
      value: wallet ? `${wallet.code} wallet · ${formatMoney(wallet.bal, wallet.code)}` : `${code} wallet`,
    },
  ];

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex}>
        <ScreenHeader title="Check the details" />

        <View style={styles.content}>
          <LinearGradient
            colors={[theme.wash1, theme.wash2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroTop}>
              <View style={[styles.monogram, { backgroundColor: theme.chip }]}>
                <ThemedText type="nano" themeColor="accent">
                  {initialsFor(provider)}
                </ThemedText>
              </View>
              <View style={styles.heroText}>
                <ThemedText type="tileValue" numberOfLines={1}>
                  {provider}
                </ThemedText>
                <ThemedText type="body" themeColor="mut" numberOfLines={1} style={styles.heroSub}>
                  {billTitle}
                </ThemedText>
              </View>
            </View>
            <ThemedText type="screenTitle" style={styles.heroAmount}>
              {formatMoneyCompact(amount, code)}
            </ThemedText>
          </LinearGradient>

          <AlertBanner
            tone="positive"
            icon="star"
            iconStyle="bare"
            title={`${formatMoneyCompact(cashback, code)} cashback`}
            body={`Earned at 1% on ${billTitle.toLowerCase()} and paid into your wallet on the ${LOYALTY.payoutDay}.`}
          />

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            {rows.map((r, i) => (
              <View
                key={r.label}
                style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: theme.line }]}
              >
                <ThemedText type="body" themeColor="mut">
                  {r.label}
                </ThemedText>
                <ThemedText type="labelStrong" numberOfLines={1} style={styles.rowValue}>
                  {r.value}
                </ThemedText>
              </View>
            ))}
          </View>

          <ThemedText type="body" themeColor="mut" style={styles.footnote}>
            Check the {billTitle} details carefully. Payments to the wrong meter or number cannot be
            reversed.
          </ThemedText>
        </View>

        <View style={styles.footer}>
          <ButtonPrimary label="Confirm and pay" onPress={() => router.push('/(money)/bills/pin')} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Screen.horizontal, gap: 20 },

  hero: { borderRadius: Radius.hero, padding: 20 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  monogram: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  heroText: { flex: 1, minWidth: 0 },
  heroSub: { marginTop: 3 },
  heroAmount: { marginTop: 18 },

  card: { borderRadius: Radius.cardLg, paddingHorizontal: 18 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 14, paddingVertical: 14 },
  rowValue: { flex: 1, textAlign: 'right' },

  footnote: { lineHeight: 18.4 },
  footer: { paddingHorizontal: Screen.horizontal, paddingBottom: Screen.bottom },
});
