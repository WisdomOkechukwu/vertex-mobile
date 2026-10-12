import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CircleButton } from '@/components/ui/circle-button';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { ListRow } from '@/components/ui/list-row';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusPill } from '@/components/ui/status-pill';
import { ThemedText } from '@/components/themed-text';
import { useToast } from '@/components/ui/toast';
import { Radius, Screen, withAlpha } from '@/constants/theme';
import { useLinksHydrated } from '@/hooks/use-links-hydrated';
import { useTheme } from '@/hooks/use-theme';
import { formatMoneyCompact } from '@/lib/format';
import { useLinksStore } from '@/stores/links-store';
import { useUiStore } from '@/stores/ui-store';

/** Vertex takes 1.4% of every payment a link collects — stated on the reference's hero and note. */
const LINK_FEE = 0.014;

/**
 * A single payment link, from `design/payment links/view link.png` and its paused twin
 * `pause.png`: a gradient hero ending in the green total received, the copyable URL, three flat
 * actions, then everyone who has paid.
 */
export default function LinkDetailScreen() {
  const theme = useTheme();
  const { show } = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const hydrating = useLinksHydrated();
  const toggleActive = useLinksStore((s) => s.toggleActive);
  const link = useLinksStore((s) => s.links.find((l) => l.id === id));
  const openSheet = useUiStore((s) => s.openSheet);

  const onCopy = async () => {
    if (!link) return;
    await Clipboard.setStringAsync(link.slug);
    show('Link copied', 'success');
  };

  // Pausing has no reference of its own — `pause.png` is this screen restated — so it updates in
  // place rather than pushing an interstitial.
  const onToggle = async () => {
    if (!link) return;
    const wasActive = link.active;
    await toggleActive(link.id);
    show(wasActive ? 'Link paused' : 'Link activated', 'success');
  };

  const payments = link ? `${link.count} payment${link.count === 1 ? '' : 's'}` : '';

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex}>
        <ScreenHeader
          title="Link"
          right={
            <CircleButton
              icon="pencil"
              iconTone="accent"
              onPress={() => link && router.push(`/links/new?id=${link.id}`)}
            />
          }
        />

        {!link ? (
          <View style={styles.content}>
            {hydrating ? (
              <>
                <Skeleton height={180} radius={Radius.hero} />
                <Skeleton height={54} radius={Radius.card} />
                <Skeleton height={48} radius={Radius.pill} />
              </>
            ) : (
              <EmptyState icon="link" title="Link not found" />
            )}
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <LinearGradient
              colors={[theme.wash1, theme.wash2]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.hero}
            >
              <View style={styles.heroTop}>
                <ThemedText type="stepHeader" style={styles.heroTitle}>
                  {link.title}
                </ThemedText>
                <StatusPill
                  label={link.active ? 'Active' : 'Paused'}
                  tone={link.active ? 'positive' : 'plain'}
                />
              </View>
              <ThemedText type="micro" themeColor="mut" style={styles.heroMeta}>
                {link.amount > 0 ? `${formatMoneyCompact(link.amount, 'NGN')} fixed` : 'Open amount'} ·
                created {link.created}
              </ThemedText>

              <ThemedText type="body" themeColor="mut" style={styles.heroLabel}>
                Total received
              </ThemedText>
              <ThemedText type="display" themeColor="pos">
                {formatMoneyCompact(link.paid, 'NGN')}
              </ThemedText>
              <ThemedText type="micro" themeColor="mut" style={styles.heroFoot}>
                From {payments} · {formatMoneyCompact(Math.round(link.paid * (1 - LINK_FEE)), 'NGN')} net
                after the 1.4% fee
              </ThemedText>
            </LinearGradient>

            <Pressable
              onPress={onCopy}
              style={({ pressed }) => [
                styles.slugRow,
                { backgroundColor: theme.card },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Icon name="link" size={17} color={theme.mut} strokeWidth={2} />
              <ThemedText type="cardTitle" numberOfLines={1} style={styles.slug}>
                {link.slug}
              </ThemedText>
              <ThemedText type="buttonGhost" themeColor="accent">
                Copy
              </ThemedText>
            </Pressable>

            <View style={styles.actions}>
              <FlatAction label="Share" onPress={() => openSheet('share', { url: link.slug })} />
              <FlatAction label={link.active ? 'Pause' : 'Activate'} onPress={onToggle} />
              <FlatAction
                label="Delete"
                danger
                onPress={() => router.push(`/links/${link.id}/confirm-delete`)}
              />
            </View>

            <View style={styles.paidHead}>
              <ThemedText type="sectionLabel">Who has paid</ThemedText>
              <ThemedText type="body" themeColor="mut">
                {payments}
              </ThemedText>
            </View>

            {link.payers.length === 0 ? (
              <EmptyState icon="user" title="No payments yet" />
            ) : (
              <View style={styles.payers}>
                {link.payers.map((p, i) => (
                  <ListRow
                    key={`${p.name}-${i}`}
                    title={p.name}
                    subtitle={p.meta}
                    subtitleLines={1}
                    avatar={<Avatar label={p.name} size={38} tint={p.tint} />}
                    onPress={() => router.push(`/transactions/${p.ref}`)}
                    trailing={
                      <View style={styles.payerTrailing}>
                        {/* `codeLabel` (700 12.5), not the 14pt `amountValue` the transaction rows
                            use: the reference's "+₦250,000" measures 64pt wide, and anything larger
                            squeezes "Card payment · 02 Aug, 11:14" onto a second line. */}
                        <ThemedText type="codeLabel" themeColor="pos">
                          +{formatMoneyCompact(p.amt, 'NGN')}
                        </ThemedText>
                        <Icon name="chevronRight" size={16} color={theme.mut} strokeWidth={2.2} />
                      </View>
                    }
                  />
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

/**
 * One of the three actions under the URL. The reference fills them with `key` and no outline or
 * glyph, so this is not `ButtonGhost` (a hairline pill on `background` with a leading icon).
 * Delete takes an accent tint and accent ink.
 */
function FlatAction({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        { backgroundColor: danger ? withAlpha(theme.accent, 0.1) : theme.key },
        pressed && { opacity: 0.7 },
      ]}
    >
      <ThemedText type="buttonGhost" themeColor={danger ? 'accent' : 'fg'}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: Screen.horizontal, paddingBottom: 40, gap: 12 },

  hero: { borderRadius: Radius.hero, padding: 20 },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  heroTitle: { flex: 1 },
  heroMeta: { marginTop: 8 },
  heroLabel: { marginTop: 20 },
  heroFoot: { marginTop: 8 },

  slugRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: Radius.card,
    paddingVertical: 13,
    paddingHorizontal: 18,
  },
  slug: { flex: 1, minWidth: 0 },

  actions: { flexDirection: 'row', gap: 8 },
  action: { flex: 1, height: 40, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },

  paidHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 26,
  },
  payers: { gap: Screen.rowGap },
  payerTrailing: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
