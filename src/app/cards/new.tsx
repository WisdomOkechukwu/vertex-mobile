import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonPrimary } from '@/components/ui/button-primary';
import { CardVisual } from '@/components/ui/card-visual';
import { ScreenHeader } from '@/components/ui/screen-header';
import { TextField } from '@/components/ui/text-field';
import { CardGradients } from '@/constants/colors';
import { Screen, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCardsStore } from '@/stores/cards-store';

export default function NewCardScreen() {
  const theme = useTheme();
  const createVirtualCard = useCardsStore((s) => s.createVirtualCard);
  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(CardGradients[0]);
  const [creating, setCreating] = useState(false);

  const onCreate = async () => {
    setCreating(true);
    try {
      await createVirtualCard({ name, color });
      router.back();
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex}>
        <ScreenHeader title="New virtual card" />
        <View style={styles.content}>
          <CardVisual card={{ name: name || 'Your card', color, full: '5399 0000 0000 0000', exp: '••/••', cvv: '•••' }} revealed={false} />
          <TextField label="Card name" value={name} onChangeText={setName} placeholder="e.g. Subscriptions" autoCapitalize="words" />
          <View style={styles.swatchRow}>
            {CardGradients.map((c) => (
              <Pressable
                key={c}
                onPress={() => setColor(c)}
                style={[styles.swatch, { backgroundColor: c, borderColor: c === color ? theme.fg : 'transparent' }]}
              />
            ))}
          </View>
        </View>
        <View style={styles.footer}>
          <ButtonPrimary label="Create card" onPress={onCreate} loading={creating} disabled={!name} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Screen.horizontal, gap: Spacing.three },
  swatchRow: { flexDirection: 'row', gap: Spacing.two },
  swatch: { width: 34, height: 34, borderRadius: 17, borderWidth: 2 },
  footer: { paddingHorizontal: Screen.horizontal, paddingBottom: Screen.bottom },
});
