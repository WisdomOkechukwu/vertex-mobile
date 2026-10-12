import { router } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonPrimary } from '@/components/ui/button-primary';
import { HeroGradientPanel } from '@/components/ui/hero-gradient-panel';
import { ScreenHeader } from '@/components/ui/screen-header';
import { PressableScale } from '@/components/ui/pressable-scale';
import { SkeletonRow } from '@/components/ui/skeleton';
import { ThemedText } from '@/components/themed-text';
import { Screen, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { isLoading } from '@/lib/api-status';
import { formatMoney } from '@/lib/format';
import type { Asset } from '@/services/types/wallets';
import { useWalletStore } from '@/stores/wallet-store';

function AssetSection({ title, list }: { title: string; list: Asset[] }) {
  const theme = useTheme();

  return (
    <View style={{ gap: Spacing.one }}>
      <ThemedText type="sectionLabel">{title}</ThemedText>
      {list.map((a) => (
        <PressableScale key={a.code} style={styles.row} onPress={() => router.push(`/currencies/${a.code}`)}>
          <View style={[styles.badge, { backgroundColor: a.tint }]}>
            <ThemedText type="micro" style={{ color: theme.onPastel }}>{a.code}</ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText type="cardTitle">{a.name}</ThemedText>
            <ThemedText type="micro" themeColor="mut">1 {a.code} ≈ {formatMoney(a.rate, 'NGN')}</ThemedText>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <ThemedText type="cardTitle">{formatMoney(a.bal, a.code)}</ThemedText>
            {a.change && (
              <ThemedText type="micro" themeColor={a.change.startsWith('-') || a.change.startsWith('−') ? 'neg' : 'pos'}>
                {a.change}
              </ThemedText>
            )}
          </View>
        </PressableScale>
      ))}
    </View>
  );
}

export default function CurrenciesScreen() {
  const theme = useTheme();
  const { assets, status, fetchAssets } = useWalletStore();

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const fiat = assets.filter((a) => a.kind === 'fiat');
  const crypto = assets.filter((a) => a.kind === 'crypto');
  const total = assets.reduce((sum, a) => sum + a.bal * a.rate, 0);
  const loading = isLoading(status);

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex}>
        <ScreenHeader title="Currencies" />
        <ScrollView contentContainerStyle={styles.content}>
          <HeroGradientPanel>
            <ThemedText type="label" themeColor="mut">Portfolio total</ThemedText>
            {loading ? <SkeletonRow style={{ marginTop: Spacing.two }} /> : <ThemedText type="display">{formatMoney(total, 'NGN')}</ThemedText>}
            <ButtonPrimary label="Swap currencies" onPress={() => router.push('/(money)/swap')} style={{ marginTop: Spacing.two }} />
          </HeroGradientPanel>

          {loading ? (
            [0, 1, 2].map((i) => <SkeletonRow key={i} style={{ marginBottom: Spacing.two }} />)
          ) : (
            <>
              <AssetSection title="Cash" list={fiat} />
              <AssetSection title="Crypto" list={crypto} />
              <ThemedText type="micro" themeColor="mut">
                Rates refresh periodically and may vary at execution. Crypto balances are not covered by NDIC insurance.
              </ThemedText>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: Screen.horizontal, gap: Spacing.three, paddingBottom: Spacing.four },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.one },
  badge: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
