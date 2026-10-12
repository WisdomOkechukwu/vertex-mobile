import { StyleSheet, View } from 'react-native';
import { PressableScale } from '@/components/ui/pressable-scale';

import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/radius';
import { useTheme } from '@/hooks/use-theme';
import { currencyName, formatMoney } from '@/lib/format';
import type { Asset } from '@/services/types/wallets';

/**
 * A wallet tile on Home's horizontal rail, from `design/home/default.png`: a small tinted disc
 * holding the currency symbol beside the bold code, the balance beneath, and a third line that is
 * either a plain description ("Naira balance") or the day's move ("+0.4% today", "−0.2% today")
 * tinted green/red.
 */
export function WalletCard({ asset, onPress }: { asset: Asset; onPress?: () => void }) {
  const theme = useTheme();
  const isDown = !!asset.change && (asset.change.startsWith('−') || asset.change.startsWith('-'));

  return (
    <PressableScale onPress={onPress} style={[styles.card, { backgroundColor: theme.card }]}
    >
      <View style={styles.top}>
        <View style={[styles.badge, { backgroundColor: asset.tint }]}>
          <ThemedText type="nano" style={{ color: theme.onPastel }}>
            {asset.sym}
          </ThemedText>
        </View>
        <ThemedText type="codeLabel">{asset.code}</ThemedText>
      </View>

      <ThemedText type="tileValue" numberOfLines={1} style={styles.balance}>
        {formatMoney(asset.bal, asset.code)}
      </ThemedText>

      <ThemedText type="nano" themeColor={asset.change ? (isDown ? 'neg' : 'pos') : 'mut'}>
        {asset.change ? `${asset.change} today` : `${currencyName(asset.code)} balance`}
      </ThemedText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  // Measured off `design/home/default.png`: tiles are 132px wide with a 10px gap.
  card: { width: 132, borderRadius: Radius.tile, paddingVertical: 16, paddingHorizontal: 14 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    width: 24,
    height: 24,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },

  balance: { marginTop: 14, marginBottom: 6 },
});
