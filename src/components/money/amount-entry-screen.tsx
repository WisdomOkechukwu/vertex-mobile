import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonPrimary } from '@/components/ui/button-primary';
import { Chip } from '@/components/ui/chip';
import { CircleButton } from '@/components/ui/circle-button';
import { NumericKeypad } from '@/components/ui/numeric-keypad';
import { ThemedText } from '@/components/themed-text';
import { Radius, Screen } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { appendKey, backspace } from '@/lib/amount-entry';
import { decimalsFor, formatMoney, groupDigits, keypadExtraFor, symbolFor } from '@/lib/format';

/** The fallback chips, for a screen with no balance to scale against. */
const QUICK_AMOUNTS = [5_000, 20_000, 50_000];

/**
 * The shared amount-entry screen, matching the design exactly: a centred header, the target line,
 * the amount inside a `120deg wash1 → wash2` gradient card at `28px` radius (accent-coloured
 * currency symbol at `700 26px`, figure at `700 36px / -.035em`), quick-amount chips, the
 * balance-after/fee line, then the keypad and CTA.
 *
 * The entry is kept as a verbatim string and parsed on read — see `src/lib/amount-entry.ts` for why.
 */
export function AmountEntryScreen({
  title,
  currencyCode = 'NGN',
  balance,
  feeLabel = 'Free',
  ctaLabel = 'Continue',
  target,
  /** Defaults to `decimalsFor(currencyCode)`; pass it only to override that. */
  maxDecimals: maxDecimalsProp,
  /** Seeds the figure — the swap confirm step arrives with the converted amount already in place. */
  initialEntry,
  /**
   * Overrides the balance-derived chips. The swap confirm step needs it: its balance is the wallet
   * being *credited*, so fractions of it mean nothing, and
   * `design/add money/swap amount display.png` shows the fixed ₦5,000 / ₦20,000 / ₦50,000 set there.
   */
  quickAmounts: quickAmountsProp,
  /**
   * `credit` money lands in the wallet instead of leaving it, so the footnote adds rather than
   * subtracts and there is no balance ceiling — `design/add money/top up via card.png` reads
   * "Balance after ₦5,001,371,538.00" on a ₦482,650 wallet, and its CTA is live.
   */
  direction = 'debit',
  onContinue,
}: {
  title: string;
  currencyCode?: string;
  balance?: number;
  feeLabel?: string;
  ctaLabel?: string;
  target?: string;
  maxDecimals?: number;
  initialEntry?: string;
  quickAmounts?: number[];
  direction?: 'debit' | 'credit';
  onContinue: (amount: number) => void;
}) {
  const theme = useTheme();
  const [entry, setEntry] = useState(initialEntry ?? '');

  // Naira is whole, crypto goes to eight — and the keypad's bottom-left cell follows from the same
  // decision, so callers cannot end up with a `.` key on a screen that refuses decimals.
  const maxDecimals = maxDecimalsProp ?? decimalsFor(currencyCode);
  const extraKey = maxDecimals > 0 ? 'decimal' : keypadExtraFor(currencyCode);

  const amount = Number(entry || '0');
  const overLimit = direction === 'debit' && balance != null && amount > balance;
  const shown = groupDigits(entry);

  /** Quick chips are fractions of the balance in the reference ($42.10 / $84.20 / $168.40). */
  const quickAmounts =
    quickAmountsProp ?? (balance && direction === 'debit' ? [balance / 4, balance / 2, balance] : QUICK_AMOUNTS);

  const onKey = (key: string) => setEntry((prev) => appendKey(prev, key, maxDecimals));

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex}>
        <View style={styles.header}>
          <CircleButton icon="chevronLeft" onPress={() => router.back()} />
          <ThemedText type="sectionHeader" style={styles.headerTitle} numberOfLines={1}>
            {title}
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        {target && (
          <ThemedText type="label" themeColor="mut" style={styles.target} numberOfLines={1}>
            {target}
          </ThemedText>
        )}

        <LinearGradient
          colors={[theme.wash1, theme.wash2]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={styles.amountCard}
        >
          <View style={styles.amountRow}>
            <ThemedText type="amountSymbol" themeColor="accent">
              {symbolFor(currencyCode)}
            </ThemedText>
            <ThemedText type="amountFigure">{shown}</ThemedText>
          </View>
        </LinearGradient>

        <View style={styles.chipsRow}>
          {quickAmounts.map((qa) => (
            <Chip
              key={qa}
              label={formatMoney(qa, currencyCode)}
              onPress={() => setEntry(String(Number(qa.toFixed(maxDecimals))))}
            />
          ))}
        </View>

        {overLimit ? (
          <ThemedText type="label" themeColor="neg" style={styles.footnote}>
            That is more than your {currencyCode} balance
          </ThemedText>
        ) : (
          <ThemedText type="label" themeColor="mut" style={styles.footnote}>
            {balance != null
              ? `Balance after ${formatMoney(
                  direction === 'credit' ? balance + amount : balance - amount,
                  currencyCode
                )} · fee ${feeLabel}`
              : `Fee ${feeLabel}`}
          </ThemedText>
        )}

        <NumericKeypad
          extraKey={extraKey}
          onDigit={onKey}
          onBackspace={() => setEntry(backspace)}
        />

        <View style={styles.footer}>
          <ButtonPrimary
            label={ctaLabel}
            disabled={amount <= 0 || overLimit}
            onPress={() => onContinue(amount)}
          />
        </View>
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
    marginBottom: 18,
  },
  headerTitle: { flex: 1, textAlign: 'center' },
  headerSpacer: { width: 42 },
  target: { textAlign: 'center', marginBottom: 14, paddingHorizontal: Screen.horizontal },
  amountCard: {
    marginHorizontal: Screen.horizontal,
    borderRadius: Radius.hero,
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 },
  chipsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 16 },
  footnote: { textAlign: 'center', marginBottom: 16, paddingHorizontal: Screen.horizontal },
  footer: { paddingHorizontal: Screen.horizontal, paddingBottom: Screen.bottom, paddingTop: 8 },
});
