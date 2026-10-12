import { router, useLocalSearchParams } from 'expo-router';
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
import { useLinksHydrated } from '@/hooks/use-links-hydrated';
import { useTheme } from '@/hooks/use-theme';
import { useNumericKeypad } from '@/lib/use-numeric-keypad';
import { useAuthStore } from '@/stores/auth-store';
import { useLinksStore } from '@/stores/links-store';

/**
 * `design/payment links/delete.png`: a bare back button, a red trash badge, the question, then the
 * link's own name inside the copy so you cannot delete the wrong one by muscle memory.
 */
export default function ConfirmDeleteLinkScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  useLinksHydrated();
  const verifyTransactionPin = useAuthStore((s) => s.verifyTransactionPin);
  const deleteLink = useLinksStore((s) => s.deleteLink);
  const link = useLinksStore((s) => s.links.find((l) => l.id === id));
  const [deleting, setDeleting] = useState(false);
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
      setDeleting(true);
      const title = link?.title ?? 'This link';
      await deleteLink(id);
      router.replace(`/links/deleted?title=${encodeURIComponent(title)}`);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex}>
        {/* The reference header is the back button alone — no title beside it. */}
        <ScreenHeader title="" />

        <View style={styles.content}>
          <PopIn style={[styles.badge, { backgroundColor: deleteTone(theme.accent) }]}>
            <Icon name="trash" size={26} color={theme.onAccent} strokeWidth={2.2} />
          </PopIn>

          <ThemedText type="stepHeader" style={[styles.centered, styles.title]}>
            Delete this link?
          </ThemedText>
          <ThemedText type="body" themeColor="mut" style={[styles.centered, styles.note]}>
            Enter your PIN to permanently delete “{link?.title ?? 'this link'}”. Payments already
            received stay in your history.
          </ThemedText>

          {deleting ? (
            <View style={styles.deleting}>
              <Spinner size={20} />
              <ThemedText type="label" themeColor="mut">
                Deleting the link…
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

        {!deleting && (
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
  deleting: { marginTop: 26, alignItems: 'center', gap: 10 },
  keypadWrap: { marginTop: 'auto', paddingBottom: 8 },
});
