import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonPrimary } from '@/components/ui/button-primary';
import { Icon, type IconProps } from '@/components/ui/icon';
import { PopIn, Reveal } from '@/components/ui/reveal';
import { ThemedText } from '@/components/themed-text';
import { withAlpha } from '@/constants/colors';
import { Radius, Screen } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { usePendingTxStore, type SettlementStatus } from '@/stores/pending-tx-store';

export type ResultCopy = { title: string; note: string; status: string; cta?: string };

const DEFAULT_COPY: Record<SettlementStatus, ResultCopy> = {
  success: {
    title: 'Sent instantly',
    note: 'Done. The money has landed and the receipt is saved to your history.',
    status: 'Completed',
    cta: 'Done',
  },
  pending: {
    title: 'Payment pending',
    note: 'The provider has the request and is confirming it. This usually clears within 15 minutes.',
    status: 'Pending confirmation',
    cta: 'Back to home',
  },
  failed: {
    title: 'Didn’t go through',
    note: 'Nothing left your wallet, so you can try again whenever you are ready.',
    status: 'Failed',
    cta: 'Back to home',
  },
};

const ICON: Record<SettlementStatus, IconProps['name']> = { success: 'check', pending: 'clock', failed: 'close' };

/**
 * Shared receipt screen, from `design/vertex transfer/vertex-send success screen.png` and
 * `design/utility/reciept.png`: a tone-tinted wash fading to white, a 75pt filled status disc, the
 * outcome and amount, then a hairline-ruled detail card ending in the status row.
 *
 * The status is not passed in per-flow — it is derived from the settlement rail the draft used (see
 * `settlementStatusFor`). A flow can still override the wording via `copy`.
 */
export function ResultScreen({ copy: override }: { copy?: Partial<Record<SettlementStatus, Partial<ResultCopy>>> }) {
  const theme = useTheme();
  const result = usePendingTxStore((s) => s.lastResult);
  const status = usePendingTxStore((s) => s.lastStatus);
  const clear = usePendingTxStore((s) => s.clear);

  const tone = status === 'failed' ? theme.neg : status === 'pending' ? theme.pendingTone : theme.pos;
  // Success and failure keep the accent CTA; only the pending receipt takes the status tint.
  const ctaTone = status === 'pending' ? theme.pendingTone : theme.accent;
  const copy = { ...DEFAULT_COPY[status], ...override?.[status] };

  const onDone = () => {
    clear();
    router.dismissAll();
    router.replace('/(tabs)');
  };

  const rows = result
    ? [
        { label: 'Reference', value: result.ref },
        { label: 'Destination', value: result.name },
        { label: 'Fee', value: result.fee },
        { label: 'Date', value: result.date },
        { label: 'Status', value: copy.status, tone },
      ]
    : [];

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={[withAlpha(tone, 0.13), withAlpha(tone, 0)]}
        style={styles.wash}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.flex}>
        <View style={styles.content}>
          <PopIn style={[styles.disc, { backgroundColor: tone }]}>
            <Icon name={ICON[status]} size={30} color={theme.onAccent} strokeWidth={2.6} />
          </PopIn>

          <ThemedText type="stepHeader" style={[styles.centered, styles.title]}>
            {copy.title}
          </ThemedText>
          <ThemedText type="body" themeColor="mut" style={[styles.centered, styles.note]}>
            {copy.note}
          </ThemedText>
          <ThemedText type="display" style={[styles.centered, styles.amount]}>
            {result?.amt?.replace('−', '') ?? '—'}
          </ThemedText>

          {status === 'pending' && (
            <View style={[styles.hint, { backgroundColor: theme.card }]}>
              <Icon name="clock" size={18} color={tone} strokeWidth={2} />
              <ThemedText type="body" themeColor="mut" style={styles.hintText}>
                We will push you a notification the moment it settles. No action needed from you.
              </ThemedText>
            </View>
          )}

          <Reveal delay={90} style={styles.receiptWrap}>
            <View style={[styles.receipt, { backgroundColor: theme.card }]}>
              {rows.map((row, i) => (
                <View
                  key={row.label}
                  style={[styles.receiptRow, i > 0 && { borderTopWidth: 1, borderTopColor: theme.line }]}
                >
                  <ThemedText type="body" themeColor="mut">
                    {row.label}
                  </ThemedText>
                  <ThemedText
                    type="labelStrong"
                    numberOfLines={1}
                    style={[styles.receiptValue, row.tone ? { color: row.tone } : null]}
                  >
                    {row.value}
                  </ThemedText>
                </View>
              ))}
            </View>
          </Reveal>
        </View>

        <View style={styles.footer}>
          <ButtonPrimary label={copy.cta ?? 'Done'} tone={ctaTone} onPress={onDone} style={styles.cta} />
          <Pressable
            onPress={() => result && router.replace(`/transactions/${result.id}`)}
            style={[styles.share, { backgroundColor: theme.card }]}
          >
            <Icon name="upload" size={19} color={theme.fg} strokeWidth={2} />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  /** The tint reaches white by ~360pt in both references. */
  wash: { position: 'absolute', top: 0, left: 0, right: 0, height: 360 },

  content: { flex: 1, paddingHorizontal: Screen.horizontal, paddingTop: 24, alignItems: 'center' },
  disc: { width: 75, height: 75, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  centered: { textAlign: 'center' },
  title: { marginTop: 20 },
  note: { marginTop: 14, paddingHorizontal: 10 },
  amount: { marginTop: 18 },

  hint: { flexDirection: 'row', gap: 12, borderRadius: Radius.cardLg, padding: 16, marginTop: 22, alignSelf: 'stretch' },
  hintText: { flex: 1, lineHeight: 18.4 },

  receiptWrap: { width: '100%', marginTop: 22 },
  receipt: { borderRadius: Radius.cardLg, paddingHorizontal: 18 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 14, paddingVertical: 15 },
  receiptValue: { flex: 1, textAlign: 'right' },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Screen.horizontal,
    paddingBottom: Screen.bottom,
  },
  cta: { flex: 1 },
  share: { width: 56, height: 56, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
});
