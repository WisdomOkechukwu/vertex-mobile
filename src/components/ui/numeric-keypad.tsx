import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PressableScale } from '@/components/ui/pressable-scale';

import { Icon } from '@/components/ui/icon';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/radius';
import { useTheme } from '@/hooks/use-theme';

/**
 * The keypad used by the PIN, OTP, amount and swap screens.
 *
 * Measured off `design/utility/pin.png`: keys are wide, squat `key`-filled rounded rectangles —
 * 99×51pt at a 24pt radius with a 10pt gap — not the bare circular hit areas the earlier build had.
 *
 * Only the bottom-left cell varies, and the references are specific about it: a decimal point where
 * the amount can have one (`design/utility/amount.png`, `design/virtual card/fund-1.png`, the swap
 * screens), `00` where it cannot (`design/add money/top up via card.png`,
 * `design/security/rewards-move-to-naira-1.png` — both whole-naira), and blank on PIN and OTP.
 */
export function NumericKeypad({
  onDigit,
  onBackspace,
  extraKey,
}: {
  onDigit: (d: string) => void;
  onBackspace: () => void;
  extraKey?: 'decimal' | 'double-zero';
}) {
  const rows: (string | null)[][] = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    [extraKey === 'decimal' ? '.' : extraKey === 'double-zero' ? '00' : null, '0', 'back'],
  ];

  return (
    <View style={styles.pad}>
      {rows.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((key, i) =>
            key === null ? (
              // Namespaced so the blank cell can't collide with the "0" key's own key.
              <View key={`blank-${r}-${i}`} style={styles.key} />
            ) : (
              <Key
                key={key}
                label={key}
                onPress={() => (key === 'back' ? onBackspace() : onDigit(key))}
              />
            )
          )}
        </View>
      ))}
    </View>
  );
}

/**
 * A key keeps the accent inversion — the most emphatic feedback in the app, and right for a target
 * you hit repeatedly without looking — and gains the shared scale on top of it. The inversion has to
 * stay a synchronous style swap rather than an animation: a fast typist outruns any easing curve, and
 * a key that is still fading up when the next one goes down reads as lag.
 */
function Key({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();
  const [pressed, setPressed] = useState(false);
  const isBackspace = label === 'back';

  return (
    <PressableScale
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[styles.key, { backgroundColor: pressed ? theme.accent : theme.key }]}
    >
      {isBackspace ? (
        <Icon name="backspace" size={22} color={pressed ? theme.onAccent : theme.fg} strokeWidth={1.9} />
      ) : (
        <ThemedText type="keypadDigit" style={pressed ? { color: theme.onAccent } : undefined}>
          {label}
        </ThemedText>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  pad: { gap: 10, paddingHorizontal: 12 },
  row: { flexDirection: 'row', gap: 10 },
  key: {
    flex: 1,
    height: 52,
    borderRadius: Radius.veryRound,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
