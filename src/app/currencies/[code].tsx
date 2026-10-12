import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonGhost } from '@/components/ui/button-ghost';
import { EmptyState } from '@/components/ui/empty-state';
import { ButtonPrimary } from '@/components/ui/button-primary';
import { Icon } from '@/components/ui/icon';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Skeleton, SkeletonRows } from '@/components/ui/skeleton';
import { TransactionRow } from '@/components/ui/transaction-row';
import { ThemedText } from '@/components/themed-text';
import { Radius, Screen, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useToast } from '@/components/ui/toast';
import { formatMoney, symbolFor } from '@/lib/format';
import { useTransactionsStore } from '@/stores/transactions-store';
import { isLoading } from '@/lib/api-status';
import { useWalletStore } from '@/stores/wallet-store';

export default function CurrencyDetailScreen() {
  const theme = useTheme();
  const { show } = useToast();
  const { code } = useLocalSearchParams<{ code: string }>();
  const { assets, fetchAssets, status: walletStatus } = useWalletStore();
  const { recent, fetchRecent, status: txStatus } = useTransactionsStore();

  useEffect(() => {
    if (assets.length === 0) fetchAssets();
    if (recent.length === 0) fetchRecent();
  }, [assets.length, fetchAssets, recent.length, fetchRecent]);

  /**
   * This wallet's own activity. The ledger has no currency column, but every `amt` is written with
   * its own symbol, so the symbol is the filter — an earlier build showed the global recent list on
   * every currency, so the BTC wallet listed naira transfers.
   */
  const activity = recent.filter((t) => t.amt.replace(/^[+−-]/, '').startsWith(symbolFor(code)));

  const asset = assets.find((a) => a.code === code);
  const loadingWallet = assets.length === 0 && isLoading(walletStatus);

  /**
   * Loading and not-found used to share one branch, so a bad `code` shimmered forever instead of
   * saying so.
   */
  if (!asset) {
    return (
      <View style={[styles.flex, { backgroundColor: theme.background }]}>
        <SafeAreaView style={styles.flex}>
          <ScreenHeader title={loadingWallet ? 'Currency' : 'Not found'} />
          {loadingWallet ? (
            <View style={styles.loadingWrap}>
              <Skeleton height={132} radius={Radius.hero} />
              <SkeletonRows count={3} />
            </View>
          ) : (
            <EmptyState
              icon="grid"
              title="We cannot find that wallet"
              description="It may have been renamed or is not one of yours."
              action={{ label: 'Back to wallets', onPress: () => router.replace('/currencies') }}
            />
          )}
        </SafeAreaView>
      </View>
    );
  }

  const address = `${asset.code.toLowerCase()}1q9x8y7z6w5v4u3t2s1r0q`;

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex}>
        <ScreenHeader title={asset.name} />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.hero}>
            <View style={[styles.badge, { backgroundColor: asset.tint }]}>
              <ThemedText type="cardTitle" style={{ color: theme.onPastel }}>{asset.code}</ThemedText>
            </View>
            <ThemedText type="display">{formatMoney(asset.bal, asset.code)}</ThemedText>
            <ThemedText type="label" themeColor="mut">≈ {formatMoney(asset.bal * asset.rate, 'NGN')}</ThemedText>
            {asset.change && (
              <ThemedText type="label" themeColor={asset.change.startsWith('-') || asset.change.startsWith('−') ? 'neg' : 'pos'}>
                {asset.change}
              </ThemedText>
            )}
          </View>

          <View style={styles.actionsRow}>
            <ButtonPrimary label="Send" leftIcon="send" onPress={() => router.push('/(money)/send')} style={{ flex: 1 }} />
            <ButtonGhost label="Swap" leftIcon="swap" onPress={() => router.push('/(money)/swap')} style={{ flex: 1 }} />
          </View>

          {asset.kind === 'crypto' && (
            <Pressable
              style={[styles.addressCard, { backgroundColor: theme.card }]}
              onPress={async () => {
                await Clipboard.setStringAsync(address);
                show('Address copied', 'success');
              }}
            >
              <ThemedText type="label" themeColor="mut">Receive address</ThemedText>
              <View style={styles.addressRow}>
                <ThemedText type="cardTitle" numberOfLines={1} style={{ flex: 1 }}>{address}</ThemedText>
                <Icon name="copy" size={16} color={theme.mut} />
              </View>
            </Pressable>
          )}

          <ThemedText type="sectionLabel">Recent activity</ThemedText>
          {recent.length === 0 && isLoading(txStatus) ? (
            <SkeletonRows count={3} />
          ) : activity.length === 0 ? (
            <EmptyState
              icon="grid"
              title={`No ${asset.code} activity yet`}
              description={`Add money to your ${asset.code} wallet to get started.`}
            />
          ) : (
            <View style={styles.activity}>
              {activity.slice(0, 4).map((tx) => (
                <TransactionRow key={tx.id} tx={tx} onPress={() => router.push(`/transactions/${tx.id}`)} />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loadingWrap: { paddingHorizontal: Screen.horizontal, gap: Spacing.three, paddingTop: Spacing.two },
  content: { paddingHorizontal: Screen.horizontal, gap: Spacing.three, paddingBottom: Spacing.four },
  activity: { gap: Screen.rowGap },
  hero: { alignItems: 'center', gap: 6, paddingVertical: Spacing.two },
  badge: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  actionsRow: { flexDirection: 'row', gap: Spacing.two },
  addressCard: { borderRadius: Radius.rounded, padding: Spacing.three, gap: 6 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
});
