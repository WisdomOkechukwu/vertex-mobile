import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CircleButton } from '@/components/ui/circle-button';
import { Icon } from '@/components/ui/icon';
import { NumericKeypad } from '@/components/ui/numeric-keypad';
import { PinDotEntry } from '@/components/ui/pin-dot-entry';
import { Spinner } from '@/components/ui/spinner';
import { ThemedText } from '@/components/themed-text';
import { COMPLIANCE } from '@/constants/content';
import { Screen } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useNumericKeypad } from '@/lib/use-numeric-keypad';
import type { Transaction } from '@/services/types/transactions';
import { usePendingTxStore } from '@/stores/pending-tx-store';

/**
 * The shared PIN step, from `design/utility/pin.png`: a lock tile, the prompt, a one-line summary of
 * what's being authorised, the four dots, the keypad, and the standing warning.
 */
export function TransactionPinScreen({
  summary,
  onSuccess,
}: {
  /** One-line recap of the transaction, e.g. "$84.20 · Ikeja Electric · from USD wallet". */
  summary?: string;
  onSuccess: (result: Transaction) => void;
}) {
  const theme = useTheme();
  const submit = usePendingTxStore((s) => s.submit);
  const draft = usePendingTxStore((s) => s.draft);
  const [authorising, setAuthorising] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { value, append, backspace, clear } = useNumericKeypad(4);

  useEffect(() => {
    if (value.length !== 4) return;
    let cancelled = false;
    (async () => {
      setAuthorising(true);
      setError(null);
      try {
        const result = await submit(value);
        if (!cancelled) onSuccess(result);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Something went wrong.');
          clear();
        }
      } finally {
        if (!cancelled) setAuthorising(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Bills set target and label to the same provider — don't print it twice.
  const line =
    summary ??
    (draft ? [draft.target, draft.label].filter((part, i, all) => part && all.indexOf(part) === i).join(' · ') : '');

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex}>
        <View style={styles.header}>
          <CircleButton icon="chevronLeft" onPress={() => router.back()} />
        </View>

        <View style={styles.content}>
          <View style={[styles.lockTile, { backgroundColor: theme.card }]}>
            <Icon name="lock" size={30} color={theme.accent} strokeWidth={2} />
          </View>

          <ThemedText type="stepHeader" style={styles.centred}>
            Enter your PIN
          </ThemedText>
          {!!line && (
            <ThemedText type="bodyLg" themeColor="mut" style={styles.centred}>
              {line}
            </ThemedText>
          )}

          <View style={styles.dots}>
            {authorising ? <Spinner size={22} /> : <PinDotEntry value={value} error={!!error} />}
          </View>

          {error && (
            <ThemedText type="body" themeColor="neg" style={styles.centred}>
              {error}
            </ThemedText>
          )}
        </View>

        {!authorising && <NumericKeypad onDigit={append} onBackspace={backspace} />}

        <ThemedText type="micro" themeColor="mut" style={styles.footer}>
          {COMPLIANCE.pin}
        </ThemedText>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingHorizontal: Screen.horizontal, paddingTop: Screen.top },
  // Claims the space above the keypad so the dots sit centred rather than crowding it.
  content: { flex: 1, alignItems: 'center', paddingHorizontal: Screen.horizontal, paddingTop: 26, gap: 10 },
  lockTile: {
    width: 92,
    height: 92,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  centred: { textAlign: 'center' },
  dots: { marginTop: 26, minHeight: 24, justifyContent: 'center' },
  footer: { textAlign: 'center', paddingTop: 22, paddingBottom: Screen.bottom },
});
