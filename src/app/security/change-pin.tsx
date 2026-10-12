import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NumericKeypad } from '@/components/ui/numeric-keypad';
import { PinDotEntry } from '@/components/ui/pin-dot-entry';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Screen, Spacing } from '@/constants/theme';
import { useNumericKeypad } from '@/lib/use-numeric-keypad';
import { useAuthStore } from '@/stores/auth-store';

type Stage = 'old' | 'new' | 'confirm';

const COPY: Record<Stage, string> = {
  old: 'Enter your current PIN',
  new: 'Choose a new PIN',
  confirm: 'Confirm your new PIN',
};

export default function ChangePinScreen() {
  const theme = useTheme();
  const verifyTransactionPin = useAuthStore((s) => s.verifyTransactionPin);
  const setTransactionPin = useAuthStore((s) => s.setTransactionPin);
  const [stage, setStage] = useState<Stage>('old');
  const [newPin, setNewPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { value, append, backspace, clear } = useNumericKeypad(4);

  useEffect(() => {
    if (value.length !== 4) return;
    const pin = value;
    (async () => {
      if (stage === 'old') {
        const ok = await verifyTransactionPin(pin);
        if (!ok) {
          setError('Incorrect PIN. Try again.');
          clear();
          return;
        }
        setError(null);
        setStage('new');
        clear();
      } else if (stage === 'new') {
        setNewPin(pin);
        setStage('confirm');
        clear();
      } else {
        if (pin !== newPin) {
          setError('PINs did not match. Try again.');
          clear();
          setStage('new');
          setNewPin('');
          return;
        }
        await setTransactionPin(pin);
        router.back();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex}>
        <ScreenHeader title="Change PIN" />
        <View style={styles.content}>
          <ThemedText type="stepHeader" style={{ textAlign: 'center' }}>
            {COPY[stage]}
          </ThemedText>
          <View style={styles.pinWrap}>
            <PinDotEntry value={value} error={!!error} />
          </View>
          {error && (
            <ThemedText type="label" themeColor="neg" style={{ textAlign: 'center' }}>
              {error}
            </ThemedText>
          )}
        </View>
        <View style={styles.keypadWrap}>
          <NumericKeypad onDigit={append} onBackspace={backspace} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: Screen.horizontal, paddingTop: Spacing.five, gap: Spacing.two },
  pinWrap: { marginTop: Spacing.three },
  keypadWrap: { marginTop: 'auto', paddingBottom: Spacing.two },
});
