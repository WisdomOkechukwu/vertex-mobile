import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonPrimary } from '@/components/ui/button-primary';
import { DebitCardPreview } from '@/components/ui/debit-card-preview';
import { ScreenHeader } from '@/components/ui/screen-header';
import { TextField } from '@/components/ui/text-field';
import { ThemedText } from '@/components/themed-text';
import { Screen, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth-store';
import { useCardsStore } from '@/stores/cards-store';

/** "0812" → "08/12"; the slash appears as soon as the month is complete, as the mask implies. */
function maskExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

/** "4000000000000000" → "4000 0000 0000 0000", matching the placeholder's grouping. */
function maskNumber(raw: string): string {
  return raw
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

/**
 * `design/add money/add debit card.png`: the card face fills in as you type, expiry and CVV share a
 * row, and the footnote explains the ₦50 hold rather than hedging about it.
 */
export default function AddDebitCardScreen() {
  const theme = useTheme();
  const addDebitCard = useCardsStore((s) => s.addDebitCard);
  const fullName = useAuthStore((s) => s.user?.fullName);
  const [number, setNumber] = useState('');
  const [exp, setExp] = useState('');
  const [cvv, setCvv] = useState('');
  // The reference shows the holder's own name already in the field — it is the one value we know.
  const [name, setName] = useState(fullName ?? '');
  const [saving, setSaving] = useState(false);

  const digits = number.replace(/\D/g, '');
  const ready = digits.length >= 15 && exp.length === 5 && cvv.length === 3 && name.trim().length > 1;

  const onAdd = async () => {
    setSaving(true);
    try {
      await addDebitCard({ number: digits, exp, cvv, name });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScreenHeader title="Add a debit card" />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <DebitCardPreview number={number} exp={exp} cvv={cvv} name={name} />

          <TextField
            label="Card number"
            value={number}
            onChangeText={(v) => setNumber(maskNumber(v))}
            keyboardType="number-pad"
            placeholder="0000 0000 0000 0000"
          />

          {/* The reference sets these two side by side — they are short enough that a full-width
              field each pushed the footnote and CTA off the fold. */}
          <View style={styles.pair}>
            <View style={styles.pairItem}>
              <TextField
                label="Expiry"
                value={exp}
                onChangeText={(v) => setExp(maskExpiry(v))}
                keyboardType="number-pad"
                placeholder="MM/YY"
              />
            </View>
            <View style={styles.pairItem}>
              <TextField
                label="CVV"
                value={cvv}
                onChangeText={(v) => setCvv(v.replace(/\D/g, '').slice(0, 3))}
                keyboardType="number-pad"
                secureTextEntry
                placeholder="•••"
              />
            </View>
          </View>

          <TextField label="Name on card" value={name} onChangeText={setName} autoCapitalize="words" />

          <ThemedText type="body" themeColor="mut" style={styles.note}>
            We will charge ₦50 and refund it immediately to confirm the card is yours.
          </ThemedText>
        </ScrollView>
        <View style={styles.footer}>
          <ButtonPrimary label="Add card" onPress={onAdd} loading={saving} disabled={!ready} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: Screen.horizontal, paddingBottom: Screen.bottom, gap: Screen.fieldGap },
  pair: { flexDirection: 'row', gap: 12 },
  pairItem: { flex: 1 },
  note: { lineHeight: 20, marginTop: Spacing.one },
  footer: { paddingHorizontal: Screen.horizontal, paddingBottom: Screen.bottom, paddingTop: Spacing.two },
});
