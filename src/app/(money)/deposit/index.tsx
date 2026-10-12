import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { IconTile } from '@/components/ui/icon-tile';
import { PickerField } from '@/components/ui/picker-field';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { ThemedText } from '@/components/themed-text';
import { Radius, Screen } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { isLoading } from '@/lib/api-status';
import { networkOptions } from '@/lib/picker-options';
import { networksFor } from '@/services/mock/data/assets';
import { useAuthStore } from '@/stores/auth-store';
import { useCardsStore } from '@/stores/cards-store';
import { useUiStore } from '@/stores/ui-store';
import { useWalletStore } from '@/stores/wallet-store';
import { useFirstRunTour } from '@/hooks/use-first-run-tour';

/** Stand-in deposit addresses; a real build would fetch these per wallet and network. */
const DEPOSIT_ADDRESS: Record<string, string> = {
  BTC: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
  DEFAULT: '0x7Ac41f9bE2d5cA8371eD0b449Fc2a6E93D8b21Ce',
};

/**
 * Add money, from `design/add money/send-*.png`. One screen for every wallet: pick which one you're
 * funding, then either your dedicated account number (fiat) or a network plus deposit address
 * (crypto), with the other funding routes listed beneath.
 */
export default function AddMoneyScreen() {
  useFirstRunTour('deposit');
  const theme = useTheme();
  const { show } = useToast();
  const openSheet = useUiStore((s) => s.openSheet);
  const user = useAuthStore((s) => s.user);
  const { assets, fetchAssets, status } = useWalletStore();
  const debitCards = useCardsStore((s) => s.debitCards);
  const fetchCards = useCardsStore((s) => s.fetchCards);

  const [assetCode, setAssetCode] = useState('NGN');
  const [networkChoice, setNetwork] = useState<string | null>(null);

  useEffect(() => {
    if (assets.length === 0) fetchAssets();
  }, [assets.length, fetchAssets]);

  // The "My debit cards" row states how many are saved, so the list has to be loaded here too.
  useEffect(() => {
    if (debitCards.length === 0) fetchCards();
  }, [debitCards.length, fetchCards]);

  // Until the wallets land, `asset` is undefined and `isCrypto` reads false — so the screen rendered
  // as a *fiat* deposit, network picker hidden, then reflowed once the real asset arrived.
  const loading = assets.length === 0 && isLoading(status);
  const asset = assets.find((a) => a.code === assetCode);
  const isCrypto = asset?.kind === 'crypto';
  const networks = networksFor(assetCode);
  // The default follows the asset rather than a hardcoded 'ERC-20', which BTC never offered.
  const network = networks.some((n) => n.label === networkChoice) ? (networkChoice as string) : networks[0].label;
  /**
   * The confirmation wording is the chosen network's own sublabel, so BTC no longer claims the
   * stablecoin figure — the reference reads "2 confirmations, ~10 min" on `send-btc-1.png`.
   */
  const confirmations = networks.find((n) => n.label === network)?.sublabel ?? 'a few confirmations';
  const address = DEPOSIT_ADDRESS[assetCode] ?? DEPOSIT_ADDRESS.DEFAULT;
  const value = isCrypto ? address : '8012345678';

  const onCopy = async () => {
    await Clipboard.setStringAsync(value);
    show(isCrypto ? 'Address copied' : 'Account number copied', 'success');
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex}>
        <View style={{ paddingTop: Screen.top }}>
          <ScreenHeader title="Add money" />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ThemedText type="label" themeColor="mut" style={styles.question}>
            Which wallet are you funding?
          </ThemedText>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {loading ? [0, 1, 2, 3].map((i) => <Skeleton key={i} width={104} height={48} radius={Radius.pill} />) : null}
            {assets.map((a) => {
              const active = a.code === assetCode;
              return (
                <Pressable
                  key={a.code}
                  onPress={() => setAssetCode(a.code)}
                  style={[styles.chip, { backgroundColor: active ? theme.accent : theme.card }]}
                >
                  <View
                    style={[
                      styles.chipBadge,
                      { backgroundColor: active ? theme.onAccentFill : a.tint },
                    ]}
                  >
                    <ThemedText type="nano" style={active ? styles.onAccent : styles.badgeInk}>
                      {a.sym}
                    </ThemedText>
                  </View>
                  <ThemedText type="buttonGhost" style={active ? styles.onAccent : undefined}>
                    {a.code}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>

          {loading ? (
            <>
              <Skeleton height={168} radius={Radius.hero} />
              <Skeleton width={160} height={17} style={styles.orHeading} />
              <View style={styles.methods}>
                {[0, 1].map((i) => (
                  <Skeleton key={i} height={78} radius={Radius.card} />
                ))}
              </View>
            </>
          ) : null}

          {!loading && isCrypto && (
            <PickerField
              badge={
                <View style={[styles.netTile, { backgroundColor: theme.chip }]}>
                  <Icon name="menu" size={18} color={theme.accent} strokeWidth={2.2} />
                </View>
              }
              caption="Network"
              value={network}
              onPress={() =>
                openSheet('picker', {
                  title: 'Choose a network',
                  options: networkOptions(networks),
                  selected: network,
                  onSelect: setNetwork,
                })
              }
              style={styles.networkField}
            />
          )}

          {!loading && (
          <LinearGradient
            colors={[theme.wash1, theme.wash2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.destination}
          >
            <ThemedText type="label" themeColor="mut">
              {isCrypto ? `${assetCode} deposit address · ${network}` : 'Your dedicated account number'}
            </ThemedText>

            <View style={styles.destinationRow}>
              <ThemedText type={isCrypto ? 'stepHeader' : 'stepHeader'} style={styles.destinationValue}>
                {value}
              </ThemedText>
              <Pressable onPress={onCopy} style={[styles.copyBtn, { backgroundColor: theme.chip }]}>
                <Icon name="copy" size={17} color={theme.accent} strokeWidth={2} />
                <ThemedText type="buttonGhost" themeColor="accent">
                  Copy
                </ThemedText>
              </Pressable>
            </View>

            <ThemedText type="body" themeColor="mut">
              {isCrypto
                ? `Send only ${assetCode} on ${network}. Anything else is lost permanently. Credits after ${confirmations}.`
                : `Vertex MFB · ${user?.fullName ?? 'Your account'} · transfers credit instantly`}
            </ThemedText>
          </LinearGradient>
          )}

          {!loading && (
          <ThemedText type="sectionLabel" style={styles.orHeading}>
            Or fund {assetCode} with
          </ThemedText>
          )}

          {!loading && (
          <View style={styles.methods}>
            <Pressable
              style={[styles.method, { backgroundColor: theme.card }]}
              onPress={() => router.push({ pathname: '/cards/debit', params: { asset: assetCode } })}
            >
              <IconTile icon="card" />
              <View style={styles.methodText}>
                <ThemedText type="tileValue">My debit cards</ThemedText>
                <ThemedText type="body" themeColor="mut" style={styles.spaced}>
                  {debitCards.length === 1 ? '1 card saved' : `${debitCards.length} cards saved`} ·{' '}
                  {isCrypto ? `buys ${assetCode} instantly` : 'instant credit'}
                </ThemedText>
              </View>
              <ThemedText type="label" themeColor="mut">
                1.4%
              </ThemedText>
            </Pressable>

            <Pressable
              style={[styles.method, { backgroundColor: theme.card }]}
              onPress={() => router.push('/(money)/swap')}
            >
              <IconTile icon="swap" />
              <View style={styles.methodText}>
                <ThemedText type="tileValue">
                  {isCrypto ? `Swap into ${assetCode}` : 'Swap from another wallet'}
                </ThemedText>
                <ThemedText type="body" themeColor="mut" style={styles.spaced}>
                  {isCrypto
                    ? 'Convert from any wallet you already hold'
                    : 'Convert any currency you already hold'}
                </ThemedText>
              </View>
              <ThemedText type="label" themeColor="mut">
                0.5%
              </ThemedText>
            </Pressable>
          </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingBottom: 40 },

  question: { paddingHorizontal: Screen.horizontal, marginBottom: 12 },
  chipRow: { gap: 10, paddingHorizontal: Screen.horizontal, paddingBottom: 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: Radius.pill,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 20,
  },
  chipBadge: { width: 30, height: 30, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  /** Ink on a pastel asset tint — the same value in both schemes. */
  badgeInk: { color: '#1b1917' },
  /** Ink on an accent fill — the same value in both schemes, hence a static style. */
  onAccent: { color: '#ffffff' },

  networkField: { marginHorizontal: Screen.horizontal, marginTop: 18 },
  netTile: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },

  destination: {
    marginHorizontal: Screen.horizontal,
    marginTop: 18,
    borderRadius: Radius.hero,
    padding: 20,
    gap: 10,
  },
  destinationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  destinationValue: { flex: 1 },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: Radius.pill,
    paddingVertical: 11,
    paddingHorizontal: 16,
  },

  orHeading: { paddingHorizontal: Screen.horizontal, marginTop: 26, marginBottom: 14 },
  methods: { paddingHorizontal: Screen.horizontal, gap: 12 },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: Radius.tile,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  methodText: { flex: 1, minWidth: 0 },
  spaced: { marginTop: 3 },
});
