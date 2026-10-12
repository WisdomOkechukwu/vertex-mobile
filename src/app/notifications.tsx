import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/ui/empty-state';
import { Icon, type IconProps } from '@/components/ui/icon';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { SkeletonRow } from '@/components/ui/skeleton';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Stagger } from '@/components/ui/reveal';
import { ThemedText } from '@/components/themed-text';
import { Radius, Screen, withAlpha } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Notification } from '@/services/types/notifications';
import { useNotificationsStore } from '@/stores/notifications-store';
import { isLoading } from '@/lib/api-status';

const FILTERS = ['All', 'Money', 'Security'] as const;
type Filter = (typeof FILTERS)[number];

const GROUPS = ['Today', 'Yesterday', 'Earlier'] as const;

/** Rewards and card events sit under Money — the reference offers only the three filters above. */
const SECURITY_KINDS: Notification['kind'][] = ['security', 'verify'];

const KIND_ICON: Record<Notification['kind'], IconProps['name']> = {
  money: 'arrowDownLeft',
  security: 'shield',
  reward: 'star',
  verify: 'alert',
  card: 'card',
};

/**
 * Notifications, from `design/notifications/default.png`. Three filters on a segmented track with
 * "Mark read" beside it, then day-grouped cards. Unread cards carry an accent wash and a trailing
 * dot; the icon tile is the semantic colour at 13% with the icon itself at full strength.
 */
export default function NotificationsScreen() {
  const theme = useTheme();
  const { items, status, fetchNotifications, markRead } = useNotificationsStore();
  const [filter, setFilter] = useState<Filter>('All');

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filtered = items.filter((n) => {
    if (filter === 'All') return true;
    const isSecurity = SECURITY_KINDS.includes(n.kind);
    return filter === 'Security' ? isSecurity : !isSecurity;
  });
  const loading = isLoading(status);

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex}>
        <View style={{ paddingTop: Screen.top }}>
          <ScreenHeader title="Notifications" />
        </View>

        <View style={styles.filterRow}>
          <SegmentedControl options={FILTERS} value={filter} onChange={setFilter} style={styles.segments} />
          <Pressable onPress={() => filtered.forEach((n) => n.unread && markRead(n.id))} hitSlop={10}>
            <ThemedText type="fieldLabel" themeColor="accent">
              Mark read
            </ThemedText>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            [0, 1, 2].map((i) => <SkeletonRow key={i} style={styles.skeleton} />)
          ) : filtered.length === 0 ? (
            <EmptyState icon="bell" title="Nothing here yet" description="New activity on your account shows up here." />
          ) : (
            GROUPS.map((group, groupIndex) => {
              const rows = filtered.filter((n) => n.group === group);
              if (rows.length === 0) return null;
              return (
                // Re-keyed on the filter so switching tabs replays the entrance rather than swapping
                // one list of near-identical rows for another with no transition at all.
                <Stagger
                  key={`${filter}-${group}`}
                  index={groupIndex}
                  style={groupIndex > 0 ? styles.laterGroup : undefined}
                >
                  <ThemedText type="micro" themeColor="mut" style={styles.groupLabel}>
                    {group}
                  </ThemedText>
                  <View style={styles.cards}>
                    {rows.map((n) => {
                      const tone = theme[n.tone];
                      return (
                        <PressableScale
                          key={n.id}
                          onPress={() => markRead(n.id)}
                          style={[styles.card, { backgroundColor: n.unread ? theme.washAccent : theme.card }]}
                        >
                          <View style={[styles.tile, { backgroundColor: withAlpha(tone, 0.13) }]}>
                            <Icon name={KIND_ICON[n.kind]} size={18} color={tone} strokeWidth={1.9} />
                          </View>
                          <View style={styles.body}>
                            <View style={styles.titleRow}>
                              <ThemedText type="listTitle" style={styles.title}>
                                {n.title}
                              </ThemedText>
                              <ThemedText type="nano" themeColor="mut">
                                {n.time}
                              </ThemedText>
                              {n.unread && <View style={[styles.dot, { backgroundColor: theme.accent }]} />}
                            </View>
                            <ThemedText type="body" themeColor="mut" style={styles.bodyText}>
                              {n.body}
                            </ThemedText>
                          </View>
                        </PressableScale>
                      );
                    })}
                  </View>
                </Stagger>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: Screen.horizontal },
  segments: { flex: 1 },

  content: { paddingHorizontal: Screen.horizontal, paddingTop: 18, paddingBottom: Screen.bottom },
  skeleton: { marginBottom: 10 },

  laterGroup: { marginTop: 24 },
  groupLabel: { marginBottom: 9 },
  cards: { gap: 10 },

  card: { flexDirection: 'row', alignItems: 'flex-start', gap: 13, paddingVertical: 15, paddingHorizontal: 16, borderRadius: Radius.card },
  /** Measured at 14 — between `Radius.crisp` and `Radius.rounded`, so it is spelled out here. */
  tile: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },

  body: { flex: 1, minWidth: 0, gap: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { flex: 1 },
  /** The reference runs this body at the design's 1.6 leading, not `body`'s default 1.4. */
  bodyText: { alignSelf: 'stretch', lineHeight: 18.4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
