import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { ButtonPrimary } from '@/components/ui/button-primary';
import { CircleButton } from '@/components/ui/circle-button';
import { Icon } from '@/components/ui/icon';
import { CurrencyBadge, PickerField } from '@/components/ui/picker-field';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Skeleton } from '@/components/ui/skeleton';
import { TextField } from '@/components/ui/text-field';
import { ThemedText } from '@/components/themed-text';
import { Radius, Screen, Typography, washTint } from '@/constants/theme';
import { useToast } from '@/components/ui/toast';
import { useResolvedScheme, useTheme } from '@/hooks/use-theme';
import { isLoading } from '@/lib/api-status';
import { formatMoney } from '@/lib/format';
import { initialsFor, namedOptions, networkOptions, walletOptions } from '@/lib/picker-options';
import { MOCK_BANKS, resolveAccountName } from '@/services/mock/data/bills';
import { usePendingTxStore } from '@/stores/pending-tx-store';
import { useUiStore } from '@/stores/ui-store';
import { networksFor } from '@/services/mock/data/assets';
import { useWalletStore } from '@/stores/wallet-store';
import type { Asset } from '@/services/types/wallets';
import { useFirstRunTour } from '@/hooks/use-first-run-tour';

/**
 * The external rail, which is whichever one isn't "Vertex user". Its label and fields depend on the
 * wallet you're sending from: a Nigerian bank for NGN, SWIFT for other fiat, on-chain for crypto.
 */
function externalRail(asset: Asset | undefined) {
  if (!asset) return { key: 'bank', label: 'Bank account' } as const;
  if (asset.kind === 'crypto') return { key: 'crypto', label: 'Wallet address' } as const;
  if (asset.code === 'NGN') return { key: 'bank', label: 'Bank account' } as const;
  return { key: 'abroad', label: 'Bank abroad' } as const;
}

/**
 * Send money, from `design/send money/sending-*.png`. One screen: the wallet you're sending from,
 * two rails, then that rail's fields. The "Vertex user" rail hands off to the Vertex transfer
 * screen, which is the same screen Home's "Move" action opens.
 */
export default function SendMoneyScreen() {
  useFirstRunTour('send');
  const theme = useTheme();
  const scheme = useResolvedScheme();
  const { show } = useToast();
  const openSheet = useUiStore((s) => s.openSheet);
  const setDraft = usePendingTxStore((s) => s.setDraft);
  const { assets, fetchAssets, status } = useWalletStore();

  const [assetCode, setAssetCode] = useState('NGN');
  const [bank, setBank] = useState(MOCK_BANKS[0]);
  const [account, setAccount] = useState('');
  const [resolvedFor, setResolvedFor] = useState('');
  const [networkChoice, setNetworkChoice] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [holder, setHolder] = useState('');
  const [iban, setIban] = useState('');
  const [swift, setSwift] = useState('');

  useEffect(() => {
    if (assets.length === 0) fetchAssets();
  }, [assets.length, fetchAssets]);

  /**
   * The rail is derived from the wallet, so an unloaded `asset` falls through `externalRail` and the
   * *wrong* rail's fields render first — a bank form for what turns out to be a crypto wallet.
   */
  const loading = assets.length === 0 && isLoading(status);
  const asset = assets.find((a) => a.code === assetCode);
  const rail = externalRail(asset);

  // The account name resolves before the CTA unlocks; derived from which number the lookup finished
  // for, so the effect only writes state from its timer.
  const awaitingLookup = rail.key === 'bank' && account.length === 10;
  const resolving = awaitingLookup && resolvedFor !== account;
  const resolvedName = awaitingLookup && resolvedFor === account ? resolveAccountName(account) : '';

  useEffect(() => {
    if (!awaitingLookup) return;
    const timer = setTimeout(() => setResolvedFor(account), 800);
    return () => clearTimeout(timer);
  }, [awaitingLookup, account]);

  const networks = networksFor(assetCode);
  // Derived rather than stored: a stored default goes stale the moment the wallet changes, which is
  // how a USDT send ended up offering "Bitcoin". `null` means "whatever this asset's first one is".
  const network = networks.some((n) => n.label === networkChoice) ? (networkChoice as string) : networks[0].label;

  const ready =
    rail.key === 'bank' ? !!resolvedName : rail.key === 'crypto' ? address.length > 6 : !!holder && !!iban && !!swift;

  // The design gives the blocked CTA its own copy rather than just greying out "Enter amount".
  const ctaLabel = ready
    ? 'Enter amount'
    : rail.key === 'crypto'
      ? 'Add an address to continue'
      : rail.key === 'abroad'
        ? 'Fill in the account details'
        : 'Enter an account number';

  const onPasteAddress = async () => {
    const clip = (await Clipboard.getStringAsync()).trim();
    if (!clip) {
      show('Nothing to paste', 'neutral');
      return;
    }
    setAddress(clip);
    show('Address pasted', 'success');
  };

  /**
   * No camera dependency is in the project yet, so this says so rather than pretending. It keeps the
   * control live — a dead `Pressable` reads as a broken button.
   */
  const onScanQr = () => show('QR scanning needs the camera — paste the address for now', 'neutral');

  const onContinue = () => {
    if (!asset) return;
    setDraft({
      kind: rail.key === 'crypto' ? 'cryptoSend' : 'send',
      label:
        rail.key === 'bank'
          ? `${bank} · ${account}`
          : rail.key === 'crypto'
            ? `${network} · on-chain`
            : 'SWIFT · international',
      target: rail.key === 'bank' ? resolvedName : rail.key === 'crypto' ? address : holder,
      amount: 0,
      fee: rail.key === 'bank' ? '₦10' : rail.key === 'crypto' ? 'Network fee applies' : 'SWIFT fee applies',
      ctaLabel: 'Send',
      needPin: true,
      asset: assetCode,
    });
    router.push('/(money)/send/amount');
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex}>
        <View style={{ paddingTop: Screen.top }}>
          <ScreenHeader title="Send money" right={<CircleButton icon="scan" onPress={onScanQr} />} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {loading ? (
            <>
              <Skeleton height={62} radius={Radius.tile} />
              <View style={styles.rails}>
                <Skeleton height={54} radius={Radius.pill} style={styles.railSkeleton} />
                <Skeleton height={54} radius={Radius.pill} style={styles.railSkeleton} />
              </View>
              <Skeleton height={62} radius={Radius.tile} />
              <Skeleton height={110} radius={Radius.tile} />
            </>
          ) : null}

          {!loading && (
          <PickerField
            badge={<CurrencyBadge code={asset?.code ?? 'NGN'} tint={asset?.tint} />}
            caption="Send from"
            value={asset ? `${asset.code} wallet · ${formatMoney(asset.bal, asset.code)}` : 'NGN wallet'}
            onPress={() =>
              openSheet('picker', {
                title: 'Send from',
                options: walletOptions(assets),
                selected: assetCode,
                onSelect: setAssetCode,
              })
            }
          />
          )}

          {!loading && (
          <View style={styles.rails}>
            <Pressable style={[styles.rail, { backgroundColor: theme.accent }]}>
              <ThemedText type="buttonGhost" style={styles.onAccent}>
                {rail.label}
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.rail, { backgroundColor: theme.key }]}
              onPress={() => router.push('/(money)/internal-transfer/recipient')}
            >
              <ThemedText type="buttonGhost" themeColor="mut">
                Vertex user
              </ThemedText>
            </Pressable>
          </View>
          )}

          {!loading && rail.key === 'bank' && (
            <>
              <PickerField
                badge={
                  <View style={[styles.monogram, { backgroundColor: theme.chip }]}>
                    <ThemedText type="nano" themeColor="accent">
                      {initialsFor(bank)}
                    </ThemedText>
                  </View>
                }
                value={bank}
                onPress={() =>
                  openSheet('picker', {
                    title: 'Choose a bank',
                    options: namedOptions(MOCK_BANKS, 'Nigerian bank'),
                    selected: bank,
                    onSelect: setBank,
                  })
                }
              />
              <TextField
                value={account}
                onChangeText={(v) => setAccount(v.replace(/[^0-9]/g, '').slice(0, 10))}
                placeholder="10-digit account number"
                keyboardType="number-pad"
              />

              {resolving && (
                <View style={styles.resolveRow}>
                  <ThemedText type="label" themeColor="mut">
                    Looking up the account name…
                  </ThemedText>
                </View>
              )}

              {!!resolvedName && (
                <View style={[styles.resolved, { backgroundColor: washTint(theme.accent, scheme) }]}>
                  <Avatar label={resolvedName} size={52} tint="#e2f4e6" />
                  <View style={styles.resolvedText}>
                    <ThemedText type="cardTitle" numberOfLines={2}>
                      {resolvedName}
                    </ThemedText>
                    <ThemedText type="body" themeColor="mut" numberOfLines={1} style={styles.spaced}>
                      {bank} · {account}
                    </ThemedText>
                  </View>
                  <Icon name="check" size={20} color={theme.accent} strokeWidth={3} />
                </View>
              )}
            </>
          )}

          {!loading && rail.key === 'crypto' && (
            <>
              <PickerField
                badge={
                  <View style={[styles.monogram, { backgroundColor: theme.chip }]}>
                    <Icon name="menu" size={18} color={theme.accent} strokeWidth={2.2} />
                  </View>
                }
                caption="Network"
                value={network}
                onPress={() =>
                  openSheet('picker', {
                    title: 'Send over',
                    options: networkOptions(networks),
                    selected: network,
                    onSelect: setNetworkChoice,
                  })
                }
              />

              <View>
                <ThemedText type="fieldLabel" themeColor="mut" style={styles.addressLabel}>
                  Recipient address
                </ThemedText>
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder={assetCode === 'BTC' ? 'bc1… or 1… address' : '0x… or T… address'}
                  placeholderTextColor={theme.mut}
                  multiline
                  style={[styles.addressInput, Typography.inputText, { backgroundColor: theme.key, color: theme.fg }]}
                />
              </View>

              <View style={styles.pasteRow}>
                <Pressable
                  onPress={onPasteAddress}
                  style={({ pressed }) => [
                    styles.pasteBtn,
                    { backgroundColor: theme.key, opacity: pressed ? 0.75 : 1 },
                  ]}
                >
                  <ThemedText type="buttonGhost">Paste</ThemedText>
                </Pressable>
                <Pressable
                  onPress={onScanQr}
                  style={({ pressed }) => [
                    styles.pasteBtn,
                    { backgroundColor: theme.key, opacity: pressed ? 0.75 : 1 },
                  ]}
                >
                  <ThemedText type="buttonGhost">Scan QR</ThemedText>
                </Pressable>
              </View>

              <View style={[styles.note, { backgroundColor: washTint(theme.accent, scheme) }]}>
                <Icon name="alert" size={18} color={theme.accent} strokeWidth={1.9} />
                <ThemedText type="body" themeColor="mut" style={styles.noteText}>
                  Crypto transfers cannot be reversed. Check the address and confirm the recipient
                  accepts {assetCode} on {network}.
                </ThemedText>
              </View>
            </>
          )}

          {!loading && rail.key === 'abroad' && (
            <>
              <TextField
                label="Account holder"
                value={holder}
                onChangeText={setHolder}
                autoCapitalize="words"
                placeholder="Name as it appears on the account"
              />
              <TextField
                label="IBAN or account number"
                value={iban}
                onChangeText={setIban}
                placeholder={assetCode === 'GBP' ? 'GB29 NWBK 6016 1331 9268 19' : 'DE89 3704 0044 0532 0130 00'}
              />
              <TextField
                label="SWIFT / BIC"
                value={swift}
                onChangeText={setSwift}
                placeholder="e.g. BARCGB22"
              />
              <View style={[styles.note, { backgroundColor: theme.card }]}>
                <Icon name="info" size={18} color={theme.mut} strokeWidth={1.8} />
                <ThemedText type="body" themeColor="mut" style={styles.noteText}>
                  Sent by SWIFT in {assetCode}. Most transfers land within one business day; the
                  receiving bank may add its own fee.
                </ThemedText>
              </View>
            </>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <ButtonPrimary label={ctaLabel} onPress={onContinue} disabled={!ready} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: Screen.horizontal, gap: 12, paddingBottom: 16 },

  rails: { flexDirection: 'row', gap: 12 },
  railSkeleton: { flex: 1 },
  rail: { flex: 1, minHeight: 54, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  /** Ink on an accent fill — the same value in both schemes, hence a static style. */
  onAccent: { color: '#ffffff' },

  monogram: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },

  resolveRow: { paddingHorizontal: 4, paddingVertical: 6 },
  resolved: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: Radius.tile,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  resolvedText: { flex: 1, minWidth: 0 },
  spaced: { marginTop: 3 },

  addressLabel: { marginBottom: 8 },
  addressInput: {
    minHeight: 110,
    borderRadius: Radius.tile,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 18,
    textAlignVertical: 'top',
  },
  pasteRow: { flexDirection: 'row', gap: 12 },
  pasteBtn: { flex: 1, minHeight: 54, borderRadius: Radius.tile, alignItems: 'center', justifyContent: 'center' },

  note: { flexDirection: 'row', gap: 12, borderRadius: Radius.tile, paddingVertical: 16, paddingHorizontal: 16 },
  noteText: { flex: 1 },

  footer: { paddingHorizontal: Screen.horizontal, paddingBottom: Screen.bottom, paddingTop: 10 },
});
