import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { NumericKeypad } from '@/components/ui/numeric-keypad';
import { PinDotEntry } from '@/components/ui/pin-dot-entry';
import { PopIn } from '@/components/ui/reveal';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Spinner } from '@/components/ui/spinner';
import { ThemedText } from '@/components/themed-text';
import { deleteTone, Radius, Screen } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useNumericKeypad } from '@/lib/use-numeric-keypad';
import { useAuthStore } from '@/stores/auth-store';
import { useDeleteAccountStore } from '@/stores/delete-account-store';

/**
 * Step two: the same PIN gate `design/payment links/delete.png` puts on deleting a link, because
 * closing an account is the more permanent of the two.
 */
export default function ConfirmDeleteAccountScreen() {
  const theme = useTheme();
  const verifyTransactionPin = useAuthStore((s) => s.verifyTransactionPin);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const reason = useDeleteAccountStore((s) => s.reason);
  const detail = useDeleteAccountStore((s) => s.detail);
  const clearDraft = useDeleteAccountStore((s) => s.clear);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { value, append, backspace, clear } = useNumericKeypad(4);

  useEffect(() => {
    if (value.length !== 4) return;
    (async () => {
      const ok = await verifyTransactionPin(value);
      if (!ok) {
        setError('Incorrect PIN. Try again.');
        clear();
        return;
      }
      setWorking(true);
      try {
        await deleteAccount({ reason: reason ?? 'Not given', detail });
        clearDraft();
        // The result screen lives in `(auth)`: `deleteAccount` has just flipped `isAuthenticated`,
        // so every signed-in group — this one included — is already being unmounted.
        router.replace('/(auth)/account-deleted');
      } catch {
        setError('We could not close your account. Try again in a moment.');
        setWorking(false);
        clear();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScreenHeader title="" />

        <View style={styles.content}>
          <PopIn style={[styles.badge, { backgroundColor: deleteTone(theme.accent) }]}>
            <Icon name="trash" size={26} color={theme.onAccent} strokeWidth={2.2} />
          </PopIn>

          <ThemedText type="stepHeader" style={[styles.centered, styles.title]}>
            Delete your account?
          </ThemedText>
          <ThemedText type="body" themeColor="mut" style={[styles.centered, styles.note]}>
            Enter your PIN to close this account permanently. Your transaction history, cards and
            payment links go with it, and this cannot be undone.
          </ThemedText>

          {working ? (
            <View style={styles.working}>
              <Spinner size={20} />
              <ThemedText type="label" themeColor="mut">
                Closing your account…
              </ThemedText>
            </View>
          ) : (
            <View style={styles.pinWrap}>
              <PinDotEntry value={value} error={!!error} />
              {error && (
                <ThemedText type="label" themeColor="neg" style={styles.centered}>
                  {error}
                </ThemedText>
              )}
            </View>
          )}
        </View>

        {!working && (
          <View style={styles.keypadWrap}>
            <NumericKeypad onDigit={append} onBackspace={backspace} />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: Screen.horizontal, alignItems: 'center' },
  badge: { width: 60, height: 60, borderRadius: Radius.tile, alignItems: 'center', justifyContent: 'center' },
  centered: { textAlign: 'center' },
  title: { marginTop: 22 },
  note: { marginTop: 12, paddingHorizontal: 4, lineHeight: 18.4 },
  pinWrap: { marginTop: 26, gap: 16, alignItems: 'center' },
  working: { marginTop: 26, alignItems: 'center', gap: 10 },
  keypadWrap: { marginTop: 'auto', paddingBottom: 8 },
});
