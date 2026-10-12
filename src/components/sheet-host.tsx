import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';

import { AppBottomSheet } from '@/components/ui/bottom-sheet';
import { ButtonGhost } from '@/components/ui/button-ghost';
import { ButtonPrimary } from '@/components/ui/button-primary';
import { Chip } from '@/components/ui/chip';
import { Icon, type IconProps } from '@/components/ui/icon';
import { NumericKeypad } from '@/components/ui/numeric-keypad';
import { CurrencyBadge, PickerField } from '@/components/ui/picker-field';
import { QrPlaceholder } from '@/components/ui/qr-placeholder';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemedText } from '@/components/themed-text';
import { useToast } from '@/components/ui/toast';
import { AvatarTints, Radius, Spacing, withAlpha } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { isLoading } from '@/lib/api-status';
import {
  currencyName,
  decimalsFor,
  formatMoney,
  formatMoneyCompact,
  groupDigits,
  keypadExtraFor,
  symbolFor,
} from '@/lib/format';
import { walletOptions } from '@/lib/picker-options';
import { useCardsStore } from '@/stores/cards-store';
import { useCashbackStore } from '@/stores/cashback-store';
import { usePendingTxStore } from '@/stores/pending-tx-store';
import { useUiStore, type PickerOption, type SheetEntry } from '@/stores/ui-store';
import { useWalletStore } from '@/stores/wallet-store';

/**
 * The amount sheet behind both `design/virtual card/fund-1.png` and
 * `design/security/rewards-move-to-naira-1.png` — the same construction with different copy: a
 * gradient hero holding the figure and a conversion or availability line, three quick chips, the
 * source or destination wallet, the keypad, and a CTA that names the amount once there is one.
 *
 * It does not commit. Both flows are PIN-gated in the references, so this writes a draft and hands
 * over to `(money)/card-topup/pin` or `(money)/cashback-withdraw/pin`.
 *
 * It stays mounted while the "Fund it from" picker is open — `design/virtual card/fund-2.png` layers
 * that picker over this sheet rather than replacing it — so the typed amount survives choosing a
 * funding wallet. It used to re-open itself from the picker's `onSelect`, which remounted it and
 * threw the figure away.
 */
function AmountSheetBody({
  type,
  cardId,
  onDone,
}: {
  type: 'withdraw-cashback' | 'card-topup';
  cardId?: string;
  onDone: () => void;
}) {
  const theme = useTheme();
  const setDraft = usePendingTxStore((s) => s.setDraft);
  const openSheet = useUiStore((s) => s.openSheet);
  const cashbackBalance = useCashbackStore((s) => s.balance);
  const card = useCardsStore((s) => s.virtualCards.find((c) => c.id === cardId));
  const assets = useWalletStore((s) => s.assets);
  const walletStatus = useWalletStore((s) => s.status);
  const fetchAssets = useWalletStore((s) => s.fetchAssets);
  const [entry, setEntry] = useState('');
  const [fromCode, setFromCode] = useState('NGN');

  // The rewards screen never loads wallets, so the sheet's currency discs had no tint to use.
  useEffect(() => {
    if (assets.length === 0) fetchAssets();
  }, [assets.length, fetchAssets]);

  const isWithdraw = type === 'withdraw-cashback';
  // Cashback moves in naira; a card is funded in the currency the card is denominated in.
  const code = isWithdraw ? 'NGN' : (card?.currency ?? 'USD');
  const amount = Number(entry || '0');
  const fromAsset = assets.find((a) => a.code === fromCode);
  const targetAsset = assets.find((a) => a.code === code);
  /** Naira per unit of the card's currency — the *target* rate, not the funding wallet's. */
  const rate = targetAsset?.rate ?? 1;
  /**
   * The ceiling. Cashback cannot exceed the rewards balance; a card top-up cannot exceed the funding
   * wallet, converted into the card's currency — an earlier build left this `undefined` for top-ups,
   * so a $10,000 charge against a ₦482,650 wallet went through.
   */
  const available = isWithdraw
    ? cashbackBalance
    : fromAsset && targetAsset
      ? (fromAsset.bal * fromAsset.rate) / targetAsset.rate
      : undefined;
  const overLimit = available != null && amount > available;
  // While the wallets are in flight `available` is undefined, so `overLimit` is false and the amount
  // validation is silently off. Hold the CTA until the ceiling is real.
  const walletsLoading = assets.length === 0 && isLoading(walletStatus);

  const quick = isWithdraw
    ? [
        { label: '25%', value: cashbackBalance * 0.25 },
        { label: '50%', value: cashbackBalance * 0.5 },
        { label: 'All of it', value: cashbackBalance },
      ]
    : [20, 50, 100].map((v) => ({ label: formatMoneyCompact(v, code), value: v }));
  const decimals = decimalsFor(code);

  const onKey = (key: string) => {
    setEntry((prev) => {
      if (key === '.') return prev.includes('.') || !decimals ? prev : `${prev || '0'}.`;
      if (key === '00' && (prev === '' || prev === '0')) return prev;
      const [, tail] = prev.split('.');
      if (tail != null && tail.length + key.length > decimals) return prev;
      if (prev.replace('.', '').length + key.length > 12) return prev;
      return prev === '0' ? key : prev + key;
    });
  };

  const onConfirm = () => {
    if (amount <= 0 || overLimit) return;
    setDraft(
      isWithdraw
        ? {
            kind: 'cashbackWithdraw',
            label: 'Rewards balance → NGN wallet',
            target: 'Moved to NGN wallet',
            amount,
            fee: 'Free',
            ctaLabel: 'Move',
            needPin: true,
            asset: 'NGN',
          }
        : {
            kind: 'cardTopup',
            label: `${fromCode} wallet → ${card?.name ?? 'card'}`,
            target: `Top up ${card?.name ?? 'card'}`,
            amount,
            fee: 'Free',
            ctaLabel: 'Top up',
            needPin: true,
            asset: code,
            meta: { cardId: cardId ?? '', fromCode },
          }
    );
    onDone();
    router.push(isWithdraw ? '/(money)/cashback-withdraw/pin' : '/(money)/card-topup/pin');
  };

  return (
    <View style={styles.amountBody}>
      <LinearGradient
        colors={[theme.wash1, theme.wash2]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.amountHero}
      >
        <ThemedText type="label" themeColor="mut">
          {isWithdraw ? 'How much to move' : `Amount in ${targetAsset?.name ?? currencyName(code)}s`}
        </ThemedText>
        <View style={styles.amountRow}>
          <ThemedText type="amountSymbol" themeColor="accent">
            {symbolFor(code)}
          </ThemedText>
          <ThemedText type="amountFigure">{groupDigits(entry)}</ThemedText>
          <View style={[styles.caret, { backgroundColor: theme.accent }]} />
        </View>
        <ThemedText type="label" themeColor={overLimit ? 'neg' : 'mut'}>
          {overLimit
            ? isWithdraw
              ? `That is more than the ${formatMoneyCompact(available ?? 0, code)} available`
              : `Your ${fromCode} wallet only covers ${formatMoneyCompact(available ?? 0, code)}`
            : isWithdraw
              ? `${formatMoneyCompact(cashbackBalance, 'NGN')} available to move`
              : `Converted at ${formatMoneyCompact(rate, 'NGN')} to the ${currencyName(code).toLowerCase()}`}
        </ThemedText>
      </LinearGradient>

      <View style={styles.amountChips}>
        {quick.map((q) => (
          <Chip
            key={q.label}
            label={q.label}
            style={styles.amountChip}
            onPress={() => setEntry(String(Number(q.value.toFixed(decimals))))}
          />
        ))}
      </View>

      {isWithdraw ? (
        <PickerField
          badge={<CurrencyBadge code="NGN" tint={assets.find((a) => a.code === 'NGN')?.tint} />}
          caption="Moving into"
          value="NGN wallet"
        />
      ) : walletsLoading ? (
        <Skeleton height={62} radius={Radius.tile} />
      ) : (
        <PickerField
          badge={<CurrencyBadge code={fromCode} tint={fromAsset?.tint} />}
          caption="Fund it from"
          value={`${fromCode} wallet`}
          // `fund-1.png` carries the balance under the wallet name, as the picker rows do.
          sublabel={fromAsset ? `${formatMoney(fromAsset.bal, fromCode)} available` : undefined}
          onPress={() =>
            openSheet('picker', {
              title: 'Fund the card from',
              options: walletOptions(assets),
              selected: fromCode,
              onSelect: setFromCode,
            })
          }
        />
      )}

      <NumericKeypad
        extraKey={keypadExtraFor(code)}
        onDigit={onKey}
        onBackspace={() => setEntry((prev) => prev.slice(0, -1))}
      />

      <ButtonPrimary
        label={
          amount > 0
            ? `${isWithdraw ? 'Move' : 'Top up'} ${formatMoneyCompact(amount, code)}`
            : 'Enter an amount'
        }
        disabled={amount <= 0 || overLimit || walletsLoading}
        onPress={onConfirm}
      />
    </View>
  );
}

/** One 56pt tinted disc under a `micro` label. The glyph is either an icon or a short string —
 * `share.png` sets WhatsApp, Email and More apps in type rather than line art. */
function ShareTarget({
  label,
  tint,
  icon,
  glyph,
  onPress,
}: {
  label: string;
  tint: string;
  icon?: IconProps['name'];
  glyph?: string;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.target, pressed && { opacity: 0.7 }]}>
      <View style={[styles.disc, { backgroundColor: tint }]}>
        {icon ? (
          <Icon name={icon} size={22} color={theme.onPastel} strokeWidth={2} />
        ) : (
          // `onPastel`, not the default `fg`: these discs keep their light tint in dark mode, so
          // near-white ink on them is unreadable.
          <ThemedText type="cardTitle" style={{ color: theme.onPastel }}>
            {glyph}
          </ThemedText>
        )}
      </View>
      <ThemedText type="micro" numberOfLines={1}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

/**
 * A destructive confirmation: the question, one line on what it costs, then the action over a
 * neutral "Cancel". No reference screen — the app's other destructive steps are full routes with a
 * PIN, and a sign-out does not warrant one — so this follows their colour grammar: `neg` for the
 * action, `key` for the way out.
 */
function ConfirmSheetBody({
  body,
  confirmLabel,
  tone = 'destructive',
  onConfirm,
  onDone,
}: {
  body: string;
  confirmLabel: string;
  tone?: 'destructive' | 'accent';
  onConfirm: () => void | Promise<void>;
  onDone: () => void;
}) {
  const theme = useTheme();
  const [working, setWorking] = useState(false);

  const run = async () => {
    setWorking(true);
    try {
      await onConfirm();
      onDone();
    } finally {
      setWorking(false);
    }
  };

  return (
    <View style={styles.confirm}>
      <ThemedText type="body" themeColor="mut">
        {body}
      </ThemedText>
      <ButtonPrimary
        label={confirmLabel}
        onPress={run}
        loading={working}
        tone={tone === 'destructive' ? theme.neg : undefined}
      />
      <ButtonGhost variant="fill" label="Cancel" onPress={onDone} disabled={working} />
    </View>
  );
}

/**
 * The share sheet from `design/payment links/share.png`: the URL, then five tinted targets. The
 * tints are the app's `AvatarTints`, in the reference's order.
 */
function ShareSheetBody({ url, onDone }: { url: string; onDone: () => void }) {
  const { show } = useToast();
  const [qr, setQr] = useState(false);
  const [peach, blue, green, pink, amber] = AvatarTints;

  const copy = async () => {
    await Clipboard.setStringAsync(url);
    show('Link copied', 'success');
    onDone();
  };

  const open = async (target: string) => {
    try {
      await Linking.openURL(target);
    } catch {
      show('Nothing here can open that', 'error');
    }
    onDone();
  };

  const more = async () => {
    try {
      await Share.share({ message: url });
      onDone();
    } catch {
      // react-native-web has no share sheet; falling back to the clipboard keeps the tap useful.
      await copy();
    }
  };

  return (
    <View style={styles.shareBody}>
      <ThemedText type="body" themeColor="mut" numberOfLines={1}>
        {url}
      </ThemedText>

      {qr ? (
        <View style={styles.qrWrap}>
          <QrPlaceholder size={150} />
          <Pressable onPress={() => setQr(false)}>
            <ThemedText type="buttonGhost" themeColor="accent">
              Back to sharing
            </ThemedText>
          </Pressable>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.targets}>
          <ShareTarget
            label="WhatsApp"
            tint={green}
            glyph="WA"
            onPress={() => open(`https://wa.me/?text=${encodeURIComponent(url)}`)}
          />
          <ShareTarget label="Copy link" tint={blue} icon="copy" onPress={copy} />
          <ShareTarget
            label="Email"
            tint={amber}
            glyph="@"
            onPress={() => open(`mailto:?body=${encodeURIComponent(url)}`)}
          />
          <ShareTarget label="QR code" tint={pink} icon="grid" onPress={() => setQr(true)} />
          <ShareTarget label="More apps" tint={peach} glyph="…" onPress={more} />
        </ScrollView>
      )}
    </View>
  );
}

/**
 * One row in a picker sheet.
 *
 * Measured off `design/utility/provider.png` (and matching `pay from.png`, `send from dropdown.png`
 * and the three `sending *-2.png` network sheets): a 64pt `card` row at `Radius.card` with an 8pt
 * gap, a 44pt `key` disc holding the caller's badge, a bold title over a muted sublabel, and — when
 * selected — an accent-tinted fill plus a filled accent check disc. The previous single line of text
 * with a `✓` character matched none of the six references that use this sheet.
 */
function PickerRow({
  option,
  selected,
  onPress,
}: {
  option: PickerOption;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        { backgroundColor: selected ? withAlpha(theme.accent, 0.09) : theme.card },
        pressed && { opacity: 0.8 },
      ]}
    >
      {/* `badge` replaces the disc outright (a tinted `CurrencyBadge`); `badgeLabel` fills the
          default `key` disc with accent initials, which is what the bank and provider rows show. */}
      {option.badge ??
        (option.badgeIcon || option.badgeLabel ? (
          <View style={[styles.optionBadge, { backgroundColor: theme.key }]}>
            {option.badgeIcon ? (
              <Icon name={option.badgeIcon} size={19} color={theme.accent} strokeWidth={2} />
            ) : (
              <ThemedText type="nano" themeColor="accent">
                {option.badgeLabel}
              </ThemedText>
            )}
          </View>
        ) : null)}
      <View style={styles.optionText}>
        <ThemedText type="cardTitle" numberOfLines={1}>
          {option.label}
        </ThemedText>
        {option.sublabel && (
          <ThemedText type="body" themeColor="mut" numberOfLines={1} style={styles.optionSub}>
            {option.sublabel}
          </ThemedText>
        )}
      </View>
      {selected && (
        <View style={[styles.optionCheck, { backgroundColor: theme.accent }]}>
          <Icon name="check" size={14} color={theme.onAccent} strokeWidth={3} />
        </View>
      )}
    </Pressable>
  );
}

/**
 * One mounted layer of the sheet stack.
 *
 * Each layer owns its own imperative handle and presents itself on mount, so a layer's body — and its
 * local state — lives exactly as long as its entry does. `design/virtual card/fund-2.png` needs that:
 * the wallet picker sits over a still-visible top-up sheet, and the amount typed into the sheet
 * underneath has to still be there when the picker closes.
 */
function SheetLayer({ entry, isTop }: { entry: SheetEntry; isTop: boolean }) {
  const ref = useRef<BottomSheetModal>(null);
  const closeSheet = useUiStore((s) => s.closeSheet);
  /**
   * A layer pops at most once. Every dismissal path funnels through here — the close button, a swipe,
   * a backdrop tap, a picker row committing its choice — and the library also fires `onDismiss` while
   * the layer is unmounting, which without this flag popped the *parent* off the stack too.
   */
  const popped = useRef(false);

  useEffect(() => {
    ref.current?.present();
    return () => {
      popped.current = true;
    };
  }, []);

  const close = useCallback(() => {
    if (popped.current) return;
    popped.current = true;
    closeSheet();
  }, [closeSheet]);

  const props = entry.props ?? {};

  return (
    <AppBottomSheet
      ref={ref}
      onClose={close}
      isTop={isTop}
      // The share sheet is a short one in the reference — two rows of content, not a scroller.
      snapPoints={
        entry.type === 'share'
          ? ['44%']
          : entry.type === 'confirm'
            ? ['40%']
            : entry.type === 'withdraw-cashback' || entry.type === 'card-topup'
              ? // The amount sheets carry a hero, chips, a wallet row, a keypad and a CTA.
                ['92%']
              : undefined
      }
      title={
        entry.type === 'picker'
          ? props.title ?? 'Choose'
          : entry.type === 'share'
            ? 'Share this link'
            : entry.type === 'withdraw-cashback'
              ? 'Move cashback out'
              : entry.type === 'card-topup'
                ? // The reference titles this with the card's own name.
                  `Top up ${props.cardName ?? 'card'}`
                : entry.type === 'confirm'
                  ? props.title
                  : undefined
      }
    >
      {entry.type === 'picker' && (
        <View style={styles.optionList}>
          {(props.options ?? []).map((opt: PickerOption) => (
            <PickerRow
              key={opt.value}
              option={opt}
              selected={props.selected === opt.value}
              onPress={() => {
                props.onSelect?.(opt.value);
                close();
              }}
            />
          ))}
        </View>
      )}
      {entry.type === 'share' && <ShareSheetBody url={props.url ?? props.text ?? ''} onDone={close} />}
      {(entry.type === 'withdraw-cashback' || entry.type === 'card-topup') && (
        <AmountSheetBody type={entry.type} cardId={props.cardId} onDone={close} />
      )}
      {entry.type === 'confirm' && (
        <ConfirmSheetBody
          body={props.body ?? ''}
          confirmLabel={props.confirmLabel ?? 'Confirm'}
          tone={props.tone}
          onConfirm={props.onConfirm ?? (() => undefined)}
          onDone={close}
        />
      )}
    </AppBottomSheet>
  );
}

/**
 * Single root-mounted sheet host: screens call `useUiStore().openSheet(type, props)` instead of
 * mounting their own `BottomSheetModal`. Renders one layer per stack entry, bottom first, so a sheet
 * can open another over itself without either losing state.
 */
export function SheetHost() {
  const sheetStack = useUiStore((s) => s.sheetStack);

  return (
    <>
      {sheetStack.map((entry, i) => (
        <SheetLayer key={entry.id} entry={entry} isTop={i === sheetStack.length - 1} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  confirm: { gap: 12, paddingTop: Spacing.one },

  amountBody: { gap: 14, paddingBottom: Spacing.two },
  amountHero: { borderRadius: Radius.hero, paddingVertical: 24, paddingHorizontal: 20, alignItems: 'center', gap: 6 },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  /** The reference draws a text caret beside the figure, so the field reads as live. */
  caret: { width: 3, height: 30, borderRadius: 2, marginLeft: 4 },
  amountChips: { flexDirection: 'row', gap: 10 },
  amountChip: { flex: 1, alignItems: 'center' },
  optionList: { gap: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 64,
    paddingHorizontal: 13,
    borderRadius: Radius.card,
  },
  optionBadge: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  optionText: { flex: 1, minWidth: 0 },
  optionSub: { marginTop: 2 },
  optionCheck: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

  shareBody: { gap: 22 },
  targets: { gap: 15, paddingRight: Spacing.three },
  target: { width: 56, alignItems: 'center', gap: 10 },
  disc: { width: 56, height: 56, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  qrWrap: { alignItems: 'center', gap: 16 },
});
