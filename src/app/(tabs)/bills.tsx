import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlertBanner } from '@/components/ui/alert-banner';
import { ButtonPrimary } from '@/components/ui/button-primary';
import { CircleButton } from '@/components/ui/circle-button';
import { Icon } from '@/components/ui/icon';
import { CurrencyBadge, PickerField } from '@/components/ui/picker-field';
import { Skeleton } from '@/components/ui/skeleton';
import { TextField } from '@/components/ui/text-field';
import { PressableScale } from '@/components/ui/pressable-scale';
import { ThemedText } from '@/components/themed-text';
import { Radius, Screen } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { LOYALTY } from '@/constants/content';
import { isLoading } from '@/lib/api-status';
import { formatMoney } from '@/lib/format';
import { initialsFor, namedOptions, walletOptions } from '@/lib/picker-options';
import { BILL_FEE_LABEL } from '@/services/mock/data/bills';
import { useBillsStore } from '@/stores/bills-store';
import { usePendingTxStore } from '@/stores/pending-tx-store';
import { useUiStore } from '@/stores/ui-store';
import { useWalletStore } from '@/stores/wallet-store';
import { useFirstRunTour } from '@/hooks/use-first-run-tour';

const GRID_GAP = 10;
/**
 * Three across: percentage widths plus gaps overflow and wrap to two, so the cell width is derived
 * from the viewport instead.
 */
const CELL = (Dimensions.get('window').width - Screen.horizontal * 2 - GRID_GAP * 2) / 3;

/**
 * Pay a bill, from `design/utility/default.png`: a 2×3 grid of categories with the chosen one
 * filled in the accent, then that category's provider, funding wallet and reference field, the
 * cashback note, and the CTA.
 */
export default function BillsScreen() {
  useFirstRunTour('bills');
  const theme = useTheme();
  const openSheet = useUiStore((s) => s.openSheet);
  const setDraft = usePendingTxStore((s) => s.setDraft);
  const { billTypes, status, fetchBillTypes } = useBillsStore();
  const { assets, fetchAssets, status: walletStatus } = useWalletStore();

  const [selectedKey, setSelectedKey] = useState('Electricity');
  // Provider and reference default to the chosen category's own values (as the design's `BILLS` map
  // does) until the user edits them, so switching category resets both without an effect.
  const [providerEdit, setProviderEdit] = useState<string | null>(null);
  const [walletCode, setWalletCode] = useState('NGN');
  const [referenceEdit, setReferenceEdit] = useState<string | null>(null);

  useEffect(() => {
    fetchBillTypes();
    if (assets.length === 0) fetchAssets();
  }, [fetchBillTypes, fetchAssets, assets.length]);

  const selected = billTypes.find((b) => b.key === selectedKey);
  const provider = providerEdit ?? selected?.providers[0] ?? '';
  const reference = referenceEdit ?? selected?.ref ?? '';
  const wallet = assets.find((a) => a.code === walletCode);
  const loading = isLoading(status);

  const ready = !!provider && reference.length > 3;

  const onContinue = () => {
    if (!selected) return;
    setDraft({
      kind: 'bill',
      label: selected.title,
      // The references write the whole line — `utility/amount-1.png` and `pin.png` both read
      // "Ikeja Electric · 4512 8890 231 · from USD wallet" — not just the provider.
      target: `${provider} · ${reference} · from ${walletCode} wallet`,
      amount: 0,
      fee: BILL_FEE_LABEL,
      ctaLabel: 'Pay bill',
      needPin: true,
      asset: walletCode,
      meta: { billKey: selected.key, billTitle: selected.title, fieldLabel: selected.field, provider, reference },
    });
    router.push('/(money)/bills/amount');
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex}>
        <View style={styles.header}>
          <CircleButton icon="chevronLeft" onPress={() => router.back()} />
          <ThemedText type="sectionHeader" style={styles.headerTitle}>
            Pay a bill
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Screen.bottomWithNav }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.grid}>
            {loading
              ? [0, 1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} width={CELL} height={104} radius={Radius.card} />
                ))
              : billTypes.map((bill) => {
                  const active = bill.key === selectedKey;
                  return (
                    <PressableScale
                      key={bill.key}
                      onPress={() => {
                        setSelectedKey(bill.key);
                        setProviderEdit(null);
                        setReferenceEdit(null);
                      }}
                      style={[styles.cell, { backgroundColor: active ? theme.accent : theme.card }]}
                    >
                      <Icon
                        name={bill.icon}
                        size={22}
                        color={active ? theme.onAccent : theme.fg}
                        strokeWidth={2}
                      />
                      <ThemedText type="labelStrong" style={active ? styles.onAccent : undefined}>
                        {bill.key}
                      </ThemedText>
                    </PressableScale>
                  );
                })}
          </View>

          {selected && (
            <View style={styles.form}>
              <ThemedText type="greeting">{selected.title}</ThemedText>

              <View style={styles.field}>
                <ThemedText type="fieldLabel" themeColor="mut">
                  Provider
                </ThemedText>
                <PickerField
                  badge={
                    <View style={[styles.monogram, { backgroundColor: theme.chip }]}>
                      <ThemedText type="nano" themeColor="accent">
                        {initialsFor(provider)}
                      </ThemedText>
                    </View>
                  }
                  value={provider || `Choose a provider`}
                  onPress={() =>
                    openSheet('picker', {
                      title: 'Choose a provider',
                      options: namedOptions(selected.providers, selected.key),
                      selected: provider,
                      onSelect: setProviderEdit,
                    })
                  }
                />
              </View>

              <View style={styles.field}>
                <ThemedText type="fieldLabel" themeColor="mut">
                  Pay from
                </ThemedText>
                {assets.length === 0 && isLoading(walletStatus) ? (
                  <Skeleton height={62} radius={Radius.tile} />
                ) : (
                <PickerField
                  badge={<CurrencyBadge code={walletCode} tint={wallet?.tint} />}
                  value={wallet ? `${wallet.code} wallet · ${formatMoney(wallet.bal, wallet.code)}` : 'NGN wallet'}
                  onPress={() =>
                    openSheet('picker', {
                      title: 'Pay from',
                      options: walletOptions(assets),
                      selected: walletCode,
                      onSelect: setWalletCode,
                    })
                  }
                />
                )}
              </View>

              <TextField
                label={selected.field}
                value={reference}
                onChangeText={setReferenceEdit}
                keyboardType="number-pad"
              />

              <ThemedText type="body" themeColor="mut" style={styles.hint}>
                {selected.hint}
              </ThemedText>

              <AlertBanner
                icon="star"
                iconStyle="bare"
                title={`Earn 1% cashback on ${selected.key.toLowerCase()} payments, paid on the ${LOYALTY.payoutDay}`}
              />

              <ButtonPrimary
                label="Enter amount"
                onPress={onContinue}
                disabled={!ready}
                style={styles.cta}
              />
            </View>
          )}
        </ScrollView>
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
    paddingBottom: 18,
  },
  headerTitle: { flex: 1, textAlign: 'center' },
  headerSpacer: { width: 42 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    paddingHorizontal: Screen.horizontal,
  },
  cell: {
    width: CELL,
    // Measured at 86pt off `design/utility/default.png`; it was 104, which pushed the whole form
    // 36pt down the screen across the two rows.
    height: 86,
    borderRadius: Radius.card,
    padding: 16,
    justifyContent: 'space-between',
  },
  /** Ink on an accent fill — the same value in both schemes, hence a static style. */
  onAccent: { color: '#ffffff' },

  form: { paddingHorizontal: Screen.horizontal, marginTop: 26, gap: 16 },
  field: { gap: 8 },
  monogram: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  hint: { marginTop: -6 },
  cta: { marginTop: 6 },
});
