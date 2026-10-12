import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonPrimary } from '@/components/ui/button-primary';
import { Icon } from '@/components/ui/icon';
import { NumericKeypad } from '@/components/ui/numeric-keypad';
import { CurrencyBadge } from '@/components/ui/picker-field';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemedText } from '@/components/themed-text';
import { Radius, Screen, washTint } from '@/constants/theme';
import { useShadows } from '@/hooks/use-shadows';
import { useResolvedScheme, useTheme } from '@/hooks/use-theme';
import { isLoading } from '@/lib/api-status';
import { appendKey, backspace, toEntry } from '@/lib/amount-entry';
import { decimalsFor, formatMoney, groupDigits, keypadExtraFor } from '@/lib/format';
import { currencyOptions } from '@/lib/picker-options';
import type { Asset } from '@/services/types/wallets';
import { useUiStore } from '@/stores/ui-store';
import { useWalletStore } from '@/stores/wallet-store';

const QUICK = [
  { label: '25%', fraction: 0.25 },
  { label: '50%', fraction: 0.5 },
  { label: '75%', fraction: 0.75 },
  { label: 'Max', fraction: 1 },
];

export type PairAmounts = { fromAmount: number; toAmount: number };

/**
 * The two-leg currency screen, from `design/add money/on click of swap.png`: a pay card and a receive
 * card with a flip button straddling the seam, an optional locked-rate summary, percentage shortcuts
 * and the keypad.
 *
 * Shared by Swap ("You pay" / "You receive") and Vertex transfer ("You send" / "They receive"). Vertex
 * used to send through the plain single-figure `AmountEntryScreen`, which could not show what actually
 * landed on the other side of a cross-currency transfer — the whole point of that flow.
 *
 * ## Both legs are editable
 *
 * Three pieces of state: the typed string, which leg it belongs to (`source`), and which leg has the
 * caret (`focus`). The keypad takes its bottom-left key from the focused leg's currency, so a naira
 * leg offers `00` and a dollar leg offers `.` on the same screen.
 *
 * `source` and `focus` are separate because moving the caret must not disturb the figure. If focusing
 * a leg re-derived its value through the rate, ₦50,000 became ₦50,004.48 just by tapping the other
 * card — the round trip through the receiving currency's two decimals and back. So the typed leg stays
 * the source of truth until the first keypress actually lands on the other one.
 */
export function CurrencyPairEntry({
  title,
  target,
  payLabel,
  receiveLabel,
  fromCode,
  toCode,
  onFromChange,
  onToChange,
  showRate = true,
  /**
   * A swap between two of your own wallets needs two different currencies; a Vertex transfer in the
   * same currency is the ordinary case, not an error.
   */
  allowSameCurrency = false,
  /**
   * Whether the receive leg shows a balance. On a Vertex transfer it is *your* balance, which says
   * nothing about what the recipient ends up with — the reference's "They receive" sheet drops it for
   * the same reason.
   */
  showReceiveBalance = true,
  footnote,
  feeLabel = '0.5%',
  ctaLabel,
  sheetBadge = 'symbol',
  onContinue,
}: {
  title: string;
  /** A muted line under the header — the recipient on a Vertex transfer. */
  target?: string;
  payLabel: string;
  receiveLabel: string;
  fromCode: string;
  toCode: string;
  onFromChange: (code: string) => void;
  onToChange: (code: string) => void;
  /** The rate/fee/lock card. Vertex hides it and states its own terms in `footnote` instead. */
  showRate?: boolean;
  allowSameCurrency?: boolean;
  showReceiveBalance?: boolean;
  footnote?: string;
  feeLabel?: string;
  ctaLabel?: string;
  /**
   * The badge style in the *picker sheet*. The references differ: swap's sheets carry a tinted glyph
   * squircle, the Vertex pair's carry a grey code disc. The legs themselves always use the glyph —
   * a code badge beside the code label read as "NGN NGN".
   */
  sheetBadge?: 'code' | 'symbol';
  onContinue: (amounts: PairAmounts) => void;
}) {
  const theme = useTheme();
  const scheme = useResolvedScheme();
  const shadows = useShadows();
  const openSheet = useUiStore((s) => s.openSheet);
  const assets = useWalletStore((s) => s.assets);
  const status = useWalletStore((s) => s.status);
  const fetchAssets = useWalletStore((s) => s.fetchAssets);

  const [entry, setEntry] = useState('');
  /** The leg the typed string belongs to. */
  const [source, setSource] = useState<'from' | 'to'>('from');
  const [focus, setFocus] = useState<'from' | 'to'>('from');

  useEffect(() => {
    if (assets.length === 0) fetchAssets();
  }, [assets.length, fetchAssets]);

  const loading = assets.length === 0 && (isLoading(status));
  const from = assets.find((a) => a.code === fromCode);
  const to = assets.find((a) => a.code === toCode);

  /** Units of `to` per unit of `from`. Both directions are derived from this one number. */
  const rate = from && to ? from.rate / to.rate : 0;
  const typed = Number(entry || '0');
  const fromAmount = source === 'from' ? typed : rate ? typed / rate : 0;
  const toAmount = source === 'from' ? typed * rate : typed;

  const focusedCode = focus === 'from' ? fromCode : toCode;
  const focusedDecimals = decimalsFor(focusedCode);
  const overBalance = !!from && fromAmount > from.bal;

  const options = currencyOptions(assets, { variant: sheetBadge === 'symbol' ? 'symbol' : undefined });

  /** Moving the caret is free — the figure only changes once a key actually lands. */
  const focusLeg = (next: 'from' | 'to') => setFocus(next);

  /**
   * The first keypress on a leg that is not yet the source hands it the figure, converted, and the
   * other leg becomes the computed one from then on.
   */
  const onDigit = (key: string) => {
    if (focus !== source) {
      const seed = toEntry(focus === 'from' ? fromAmount : toAmount, decimalsFor(focusedCode));
      setSource(focus);
      setEntry(appendKey(seed, key, focusedDecimals));
      return;
    }
    setEntry((prev) => appendKey(prev, key, focusedDecimals));
  };

  const onBackspace = () => {
    if (focus !== source) {
      setSource(focus);
      setEntry(backspace(toEntry(focus === 'from' ? fromAmount : toAmount, decimalsFor(focusedCode))));
      return;
    }
    setEntry(backspace);
  };

  /**
   * Flip re-quotes as well as swapping the codes. It used to swap codes alone, so a figure typed as
   * "₦50,000 of naira" silently became "50,000 of USDC" — the same digits meaning something else.
   */
  const onFlip = () => {
    // The source leg keeps its figure's *meaning*, so it takes the value the other side was showing.
    const carried = source === 'from' ? toAmount : fromAmount;
    onFromChange(toCode);
    onToChange(fromCode);
    setEntry(toEntry(carried, decimalsFor(source === 'from' ? toCode : fromCode)));
  };

  const sameCurrency = fromCode === toCode && !allowSameCurrency;
  const ready = fromAmount > 0 && !overBalance && !sameCurrency;

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <View style={{ paddingTop: Screen.top }}>
          <ScreenHeader title={title} />
        </View>

        <View style={styles.body}>
          {target ? (
            <ThemedText type="label" themeColor="mut" style={styles.target} numberOfLines={1}>
              {target}
            </ThemedText>
          ) : null}

          <View style={styles.pair}>
            <Leg
              label={payLabel}
              code={fromCode}
              asset={from}
              loading={loading}
              focused={focus === 'from'}
              display={source === 'from' ? groupDigits(entry) : formatMoney(fromAmount, fromCode)}
              onFocus={() => focusLeg('from')}
              onPickCurrency={() =>
                openSheet('picker', { title: payLabel, options, selected: fromCode, onSelect: onFromChange })
              }
            />

            {/* The flip button straddles the seam between the two legs. */}
            <Pressable
              style={[styles.flip, { backgroundColor: theme.accent }, shadows.accentGlow(theme.accent)]}
              onPress={onFlip}
            >
              <Icon name="swapVertical" size={20} color={theme.onAccent} strokeWidth={2.2} />
            </Pressable>

            <Leg
              label={receiveLabel}
              code={toCode}
              asset={to}
              loading={loading}
              focused={focus === 'to'}
              accent
              showBalance={showReceiveBalance}
              display={source === 'to' ? groupDigits(entry) : formatMoney(toAmount, toCode)}
              onFocus={() => focusLeg('to')}
              onPickCurrency={() =>
                openSheet('picker', { title: receiveLabel, options, selected: toCode, onSelect: onToChange })
              }
            />
          </View>

          {showRate ? (
            <View style={[styles.rateCard, { backgroundColor: washTint(theme.accent, scheme) }]}>
              <RateRow
                label="Rate"
                value={loading ? '—' : `1 ${fromCode} = ${rate.toFixed(6)} ${toCode}`}
              />
              <RateRow label="Vertex fee" value={feeLabel} />
              <RateRow label="Rate locked for" value="60 seconds" />
            </View>
          ) : (
            footnote ? (
              <ThemedText type="body" themeColor="mut" style={styles.footnote}>
                {footnote}
              </ThemedText>
            ) : null
          )}

          <View style={styles.quickRow}>
            {QUICK.map((q) => (
              <Pressable
                key={q.label}
                style={[styles.quick, { backgroundColor: theme.key }]}
                // A percentage is a fraction of *your* balance, so it is always a pay-leg action —
                // tapping one moves the caret there rather than writing a share of what you receive.
                onPress={() => {
                  if (!from) return;
                  setFocus('from');
                  setSource('from');
                  setEntry(toEntry(from.bal * q.fraction, decimalsFor(fromCode)));
                }}
              >
                <ThemedText type="buttonGhost">{q.label}</ThemedText>
              </Pressable>
            ))}
          </View>

          <NumericKeypad
            extraKey={keypadExtraFor(focusedCode)}
            onDigit={onDigit}
            onBackspace={onBackspace}
          />
        </View>

        <View style={styles.footer}>
          <ButtonPrimary
            label={
              sameCurrency
                ? 'Pick two different currencies'
                : fromAmount <= 0
                  ? 'Enter an amount'
                  : overBalance
                    ? 'Not enough balance'
                    : // The reference spells the exchange out on the button itself.
                      (ctaLabel ?? `Swap ${formatMoney(fromAmount, fromCode)} to ${toCode}`)
            }
            onPress={() => onContinue({ fromAmount, toAmount })}
            disabled={!ready}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

/**
 * One leg. The whole card is pressable to take the caret; the currency block inside it opens the
 * picker instead, so the two taps do not fight over the same area.
 */
function Leg({
  label,
  code,
  asset,
  loading,
  focused,
  accent,
  showBalance = true,
  display,
  onFocus,
  onPickCurrency,
}: {
  label: string;
  code: string;
  asset?: Asset;
  loading: boolean;
  focused: boolean;
  accent?: boolean;
  showBalance?: boolean;
  display: string;
  onFocus: () => void;
  onPickCurrency: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onFocus}
      style={[
        styles.leg,
        {
          backgroundColor: theme.key,
          // The focused leg is ringed rather than filled: a fill would compete with the accent figure
          // it already carries, and both legs sit on the same `key` surface.
          borderColor: focused ? theme.accent : 'transparent',
        },
      ]}
    >
      <View style={styles.legTop}>
        <ThemedText type="label" themeColor="mut">
          {label}
        </ThemedText>
        {!showBalance ? null : loading ? (
          <Skeleton width={96} height={12} />
        ) : (
          <ThemedText type="label" themeColor="mut">
            Balance {asset ? formatMoney(asset.bal, asset.code) : '—'}
          </ThemedText>
        )}
      </View>
      <View style={styles.legRow}>
        <CurrencyBadge code={code} tint={asset?.tint} size={40} variant="symbol" />
        <Pressable
          style={styles.legPicker}
          onPress={onPickCurrency}
          // Named so the two legs' pickers are distinguishable — to a screen reader and to `walk.mjs`,
          // which otherwise has four identical currency codes on screen to choose between.
          accessibilityRole="button"
          accessibilityLabel={`Change ${label} currency`}
        >
          <ThemedText type="tileValue">{code}</ThemedText>
          <Icon name="chevronDown" size={16} color={theme.mut} strokeWidth={2} />
        </Pressable>
        <ThemedText
          type="tileValue"
          numberOfLines={1}
          style={[styles.legValue, accent && { color: theme.accent }]}
        >
          {display}
        </ThemedText>
        {focused && <View style={[styles.caret, { backgroundColor: theme.accent }]} />}
      </View>
    </Pressable>
  );
}

function RateRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.rateRow}>
      <ThemedText type="label" themeColor="mut">
        {label}
      </ThemedText>
      <ThemedText type="labelStrong">{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { flex: 1, paddingHorizontal: Screen.horizontal, gap: 14 },
  target: { textAlign: 'center' },

  pair: { gap: 10 },
  leg: {
    borderRadius: Radius.tile,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
    borderWidth: 1.5,
  },
  legTop: { flexDirection: 'row', justifyContent: 'space-between' },
  legRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  legPicker: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legValue: { flex: 1, textAlign: 'right' },
  /** The reference draws a text caret beside a live figure, so the field reads as editable. */
  caret: { width: 2.5, height: 20, borderRadius: 2, marginLeft: 4 },
  flip: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    marginTop: -24,
    width: 48,
    height: 48,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  rateCard: { borderRadius: Radius.tile, paddingVertical: 14, paddingHorizontal: 16, gap: 8 },
  rateRow: { flexDirection: 'row', justifyContent: 'space-between' },
  footnote: { textAlign: 'center' },

  quickRow: { flexDirection: 'row', gap: 10 },
  quick: { flex: 1, height: 44, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },

  footer: { paddingHorizontal: Screen.horizontal, paddingBottom: Screen.bottom, paddingTop: 12 },
});
