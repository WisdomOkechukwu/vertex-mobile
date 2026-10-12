import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonPrimary } from '@/components/ui/button-primary';
import { CircleButton } from '@/components/ui/circle-button';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusPill } from '@/components/ui/status-pill';
import { PressableScale } from '@/components/ui/pressable-scale';
import { ThemedText } from '@/components/themed-text';
import { accentDiscGradient, Radius, Screen } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { isLoading } from '@/lib/api-status';
import { formatMoneyCompact, initialsOf } from '@/lib/format';
import { useLinksStore } from '@/stores/links-store';
import { useFirstRunTour } from '@/hooks/use-first-run-tour';

/**
 * Payment links, from `design/payment links/home.png`: the collected-total hero, the create CTA,
 * then each link with a solid initial disc, its state, URL and what it has taken.
 */
export default function PaymentLinksScreen() {
  useFirstRunTour('links');
  const theme = useTheme();
  const { links, status, fetchLinks } = useLinksStore();

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const collected = links.reduce((sum, l) => sum + l.paid, 0);
  const activeCount = links.filter((l) => l.active).length;
  const loading = isLoading(status);

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex}>
        <View style={styles.header}>
          <CircleButton icon="chevronLeft" onPress={() => router.back()} />
          <ThemedText type="sectionHeader" style={styles.headerTitle}>
            Payment links
          </ThemedText>
          <CircleButton icon="plus" iconTone="accent" onPress={() => router.push('/links/new')} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <LinearGradient
            colors={[theme.wash1, theme.wash2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <ThemedText type="bodyLg" themeColor="mut">
              Collected through links
            </ThemedText>
            {loading ? (
              <Skeleton width={200} height={38} radius={Radius.crisp} />
            ) : (
              <ThemedText type="display">{formatMoneyCompact(collected, 'NGN')}</ThemedText>
            )}
            <ThemedText type="body" themeColor="mut">
              {activeCount} active of {links.length} links · paid straight into your NGN wallet
            </ThemedText>
          </LinearGradient>

          <ButtonPrimary
            compact
            label="Create a payment link"
            leftIcon="plus"
            onPress={() => router.push('/links/new')}
            style={styles.cta}
          />

          <ThemedText type="sectionLabel" style={styles.listHeading}>
            Your links
          </ThemedText>

          <View style={styles.list}>
            {loading ? (
              [0, 1, 2].map((i) => <Skeleton key={i} height={104} radius={Radius.card} />)
            ) : links.length === 0 ? (
              <EmptyState icon="link" title="No payment links yet" />
            ) : (
              links.map((link) => (
                <PressableScale
                  key={link.id}
                  style={[styles.row, { backgroundColor: theme.card }]}
                  onPress={() => router.push(`/links/${link.id}`)}
                >
                  {/* A solid disc rather than a pastel avatar: an accent ramp while active, flat
                      grey once paused. The paused grey is fixed rather than `theme.mut`, which is a
                      *light* grey in dark mode and would leave white initials unreadable. */}
                  <LinearGradient
                    colors={link.active ? accentDiscGradient(theme.accent) : [PAUSED_DISC, PAUSED_DISC]}
                    style={styles.disc}
                  >
                    <ThemedText type="cardTitle" style={{ color: theme.onAccent }}>
                      {initialsOf(link.title)}
                    </ThemedText>
                  </LinearGradient>

                  <View style={styles.rowText}>
                    <View style={styles.titleRow}>
                      <ThemedText type="tileValue" numberOfLines={1} style={styles.title}>
                        {link.title}
                      </ThemedText>
                      <StatusPill
                        label={link.active ? 'Active' : 'Paused'}
                        tone={link.active ? 'positive' : 'neutral'}
                      />
                    </View>
                    <ThemedText type="body" themeColor="mut" numberOfLines={1} style={styles.spaced}>
                      {link.slug}
                    </ThemedText>
                    <ThemedText type="micro" themeColor="mut" style={styles.spaced}>
                      {link.amount > 0 ? formatMoneyCompact(link.amount, 'NGN') : 'Open amount'} ·{' '}
                      {link.count} payment{link.count === 1 ? '' : 's'}
                    </ThemedText>
                  </View>

                  <View style={styles.trailing}>
                    <ThemedText type="tileValue" themeColor="pos">
                      {formatMoneyCompact(link.paid, 'NGN')}
                    </ThemedText>
                    <ThemedText type="micro" themeColor="mut" style={styles.spaced}>
                      received
                    </ThemedText>
                  </View>
                </PressableScale>
              ))
            )}
          </View>

          <View style={[styles.note, { backgroundColor: theme.card }]}>
            {/* The reference centres the glyph on the first text line, not on the whole block. */}
            <View style={styles.noteIcon}>
              <Icon name="info" size={15} color={theme.mut} strokeWidth={1.8} />
            </View>
            <ThemedText type="body" themeColor="mut" style={styles.noteText}>
              Anyone with a link can pay you by card or bank transfer without a Vertex account. Money
              lands in your NGN wallet and Vertex charges 1.4% per payment.
            </ThemedText>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

/** `body` at the design's 1.6 leading — the note and the row meta both run looser than 1.4. */
const NOTE_LEADING = 18.4;

/** The paused link disc, sampled off `design/payment links/home.png`. */
const PAUSED_DISC = '#8a8785';

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Screen.horizontal,
    paddingTop: Screen.top,
    paddingBottom: 10,
  },
  headerTitle: { flex: 1, textAlign: 'center' },

  content: { paddingHorizontal: Screen.horizontal, paddingBottom: 40 },
  hero: { borderRadius: Radius.hero, padding: 20, gap: 8 },
  cta: { marginTop: 14 },
  listHeading: { marginTop: 26, marginBottom: 14 },
  list: { gap: Screen.rowGap },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: Radius.card,
    paddingVertical: 13,
    paddingHorizontal: 18,
  },
  /** A 42pt rounded square (r16), not a circle — measured off the reference's straight edges. */
  disc: { width: 42, height: 42, borderRadius: Radius.rounded, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flexShrink: 1 },
  trailing: { alignItems: 'flex-end' },
  spaced: { marginTop: 4 },

  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: Radius.card,
    paddingVertical: 9,
    paddingHorizontal: 18,
    marginTop: 20,
  },
  noteIcon: { height: NOTE_LEADING, justifyContent: 'center' },
  noteText: { flex: 1, lineHeight: NOTE_LEADING },
});
