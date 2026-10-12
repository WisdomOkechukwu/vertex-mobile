import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonPrimary } from '@/components/ui/button-primary';
import { Icon } from '@/components/ui/icon';
import { PopIn } from '@/components/ui/reveal';
import { ScreenHeader } from '@/components/ui/screen-header';
import { TextField } from '@/components/ui/text-field';
import { ThemedText } from '@/components/themed-text';
import { deleteTone, Radius, Screen, withAlpha } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useDeleteAccountStore } from '@/stores/delete-account-store';

/** The reasons offered before the account can be closed. "Other" requires the free-text box. */
const REASONS = [
  'I am not using it',
  'It is too expensive',
  'I am switching to another app',
  'I had a bad experience',
  'I have privacy concerns',
  'Other',
] as const;

const OTHER = 'Other';

/**
 * Step one of closing an account: ask why.
 *
 * No design reference exists for this flow, so it borrows the app's destructive grammar from
 * `design/payment links/delete.png` — red squircle badge, the question, muted stakes — and puts the
 * reason list where that screen puts its PIN. The PIN comes next, on `delete/confirm`.
 */
export default function DeleteAccountScreen() {
  const theme = useTheme();
  const setReason = useDeleteAccountStore((s) => s.set);
  const [reason, setLocalReason] = useState<string | null>(null);
  const [detail, setDetail] = useState('');

  const needsDetail = reason === OTHER;
  const canContinue = !!reason && (!needsDetail || detail.trim().length > 0);

  const onContinue = () => {
    if (!reason) return;
    setReason({ reason, detail: detail.trim() || undefined });
    router.push('/profile/delete/confirm');
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        {/* The back button alone, as every other destructive step in the app draws it. */}
        <ScreenHeader title="" />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.head}>
            <PopIn style={[styles.badge, { backgroundColor: deleteTone(theme.accent) }]}>
              <Icon name="trash" size={26} color={theme.onAccent} strokeWidth={2.2} />
            </PopIn>

            <ThemedText type="stepHeader" style={[styles.centered, styles.title]}>
              Delete your account?
            </ThemedText>
            <ThemedText type="body" themeColor="mut" style={[styles.centered, styles.note]}>
              This closes your Vertex account for good. Move your money out first — anything left
              in your wallets or rewards balance is forfeited. Tell us why you are leaving and we
              will take you through it.
            </ThemedText>
          </View>

          <View style={styles.reasons}>
            {REASONS.map((r) => {
              const active = r === reason;
              return (
                <Pressable
                  key={r}
                  onPress={() => setLocalReason(r)}
                  style={({ pressed }) => [
                    styles.reason,
                    {
                      backgroundColor: active ? withAlpha(theme.accent, 0.09) : theme.card,
                      borderColor: active ? theme.accent : 'transparent',
                    },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <ThemedText type="rowTitle" style={styles.reasonLabel}>
                    {r}
                  </ThemedText>
                  <View
                    style={[
                      styles.radio,
                      { borderColor: active ? theme.accent : theme.line },
                      active && { backgroundColor: theme.accent },
                    ]}
                  >
                    {active && <Icon name="check" size={12} color={theme.onAccent} strokeWidth={3} />}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <TextField
            label={needsDetail ? 'Tell us more' : 'Tell us more (optional)'}
            value={detail}
            onChangeText={setDetail}
            placeholder="What made you decide to leave?"
            autoCapitalize="sentences"
          />
        </ScrollView>

        <View style={styles.footer}>
          <ButtonPrimary
            label="Continue"
            onPress={onContinue}
            disabled={!canContinue}
            tone={theme.neg}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  // Clear of the sticky footer (56pt CTA + its own padding), or the CTA covers the text field.
  content: { paddingHorizontal: Screen.horizontal, paddingBottom: 100, gap: 24 },

  head: { alignItems: 'center' },
  badge: { width: 60, height: 60, borderRadius: Radius.tile, alignItems: 'center', justifyContent: 'center' },
  centered: { textAlign: 'center' },
  title: { marginTop: 22 },
  note: { marginTop: 12, paddingHorizontal: 4, lineHeight: 18.4 },

  reasons: { gap: Screen.rowGap },
  reason: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 58,
    paddingHorizontal: 17,
    borderRadius: Radius.card,
    borderWidth: 1.5,
  },
  reasonLabel: { flex: 1 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  footer: { paddingHorizontal: Screen.horizontal, paddingBottom: Screen.bottom, paddingTop: 8 },
});
