import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { ButtonPrimary } from '@/components/ui/button-primary';
import { Icon } from '@/components/ui/icon';
import { Reveal } from '@/components/ui/reveal';
import { ScreenHeader } from '@/components/ui/screen-header';
import { TextField } from '@/components/ui/text-field';
import { ThemedText } from '@/components/themed-text';
import { Radius, Screen } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { MOCK_VERTEX_USERS } from '@/services/mock/data/bills';
import { usePendingTxStore } from '@/stores/pending-tx-store';

/**
 * Vertex transfer, from `design/send money/to vertex user.png`. Reached both from Home's "Move"
 * action and from the "Vertex user" rail on Send.
 *
 * This screen is now only about *who*: search resolves a Vertex account and recent contacts sit below
 * with the selected one ringed. The currency pair used to be picked here too, which put it a screen
 * away from the amounts it governs and duplicated the pickers the next screen now carries.
 */
export default function VertexTransferScreen() {
  const theme = useTheme();
  const setDraft = usePendingTxStore((s) => s.setDraft);

  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const matched =
    MOCK_VERTEX_USERS.find((u) => u.tag === selectedTag) ??
    (query.length > 2
      ? MOCK_VERTEX_USERS.find(
          (u) =>
            u.tag.toLowerCase().includes(query.toLowerCase().replace('@', '')) ||
            u.name.toLowerCase().startsWith(query.toLowerCase())
        ) ?? null
      : null);

  const onContinue = () => {
    if (!matched) return;
    setDraft({
      kind: 'vertex',
      label: 'Vertex transfer',
      target: matched.name,
      amount: 0,
      fee: 'Free',
      ctaLabel: 'Send',
      needPin: true,
      // Seeds only — the amount screen owns the pair and overwrites both.
      asset: 'NGN',
      meta: { toCode: 'NGN', tag: matched.tag },
    });
    router.push('/(money)/internal-transfer/amount');
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex}>
        <View style={{ paddingTop: Screen.top }}>
          <ScreenHeader title="Vertex transfer" />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TextField
            label="Vertex tag, phone or account number"
            value={query}
            onChangeText={(v) => {
              setQuery(v);
              setSelectedTag(null);
            }}
            placeholder="@nkem, 0801 234 5678 or 8012345678"
            leadingIcon="search"
          />

          {matched && (
            <Reveal>
              <View style={[styles.matchCard, { backgroundColor: theme.card }]}>
                <Avatar label={matched.mark} tint={matched.tint} size={56} />
                <View style={styles.matchText}>
                  <ThemedText type="tileValue" numberOfLines={1}>
                    {matched.name}
                  </ThemedText>
                  <ThemedText type="body" themeColor="mut" numberOfLines={1} style={styles.spaced}>
                    {matched.tag} · Vertex account
                  </ThemedText>
                </View>
                <View style={[styles.verified, { backgroundColor: theme.accent }]}>
                  <Icon name="check" size={12} color={theme.onAccent} strokeWidth={3.4} />
                  <ThemedText type="labelStrong" style={styles.onAccent}>
                    Vertex
                  </ThemedText>
                </View>
              </View>

              <View style={styles.instantRow}>
                <Icon name="bolt" size={15} color={theme.accent} strokeWidth={1.9} />
                <ThemedText type="body" themeColor="mut">
                  Instant and free between Vertex accounts
                </ThemedText>
              </View>
            </Reveal>
          )}

          <ThemedText type="label" themeColor="mut" style={styles.sectionLabel}>
            Recent Vertex contacts
          </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.contactRow}>
            {MOCK_VERTEX_USERS.map((user) => {
              const isSelected = matched?.tag === user.tag;
              return (
                <Pressable
                  key={user.tag}
                  style={styles.contact}
                  onPress={() => {
                    setSelectedTag(user.tag);
                    setQuery(user.tag);
                  }}
                >
                  {/* The reference rings the chosen contact in the accent. */}
                  <View style={[styles.contactRing, isSelected && { borderColor: theme.accent }]}>
                    <Avatar label={user.mark} tint={user.tint} size={56} />
                  </View>
                  <ThemedText type="micro" numberOfLines={1} style={styles.contactName}>
                    {user.name.split(' ')[0]}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>

        </ScrollView>

        <View style={styles.footer}>
          <ButtonPrimary label="Enter amount" onPress={onContinue} disabled={!matched} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: Screen.horizontal, paddingBottom: 16 },

  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: Radius.tile,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 14,
  },
  matchText: { flex: 1, minWidth: 0 },
  spaced: { marginTop: 3 },
  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.pill,
    paddingVertical: 9,
    paddingHorizontal: 13,
  },
  /** Ink on an accent fill — the same value in both schemes, hence a static style. */
  onAccent: { color: '#ffffff' },
  instantRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 14, paddingHorizontal: 4 },

  sectionLabel: { marginTop: 24, marginBottom: 12 },
  contactRow: { gap: 18, paddingBottom: 4 },
  contact: { alignItems: 'center', gap: 9, width: 64 },
  contactRing: { borderRadius: Radius.pill, borderWidth: 2, borderColor: 'transparent', padding: 2 },
  contactName: { maxWidth: 64, textAlign: 'center' },


  footer: { paddingHorizontal: Screen.horizontal, paddingBottom: Screen.bottom, paddingTop: 10 },
});
