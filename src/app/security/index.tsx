import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { RowCard } from '@/components/ui/row-card';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionHeading } from '@/components/ui/section-heading';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusPill } from '@/components/ui/status-pill';
import { ThemedText } from '@/components/themed-text';
import { Radius, Screen, withAlpha } from '@/constants/theme';
import { useResolvedScheme, useTheme } from '@/hooks/use-theme';
import { isLoading } from '@/lib/api-status';
import { useAuthStore } from '@/stores/auth-store';
import { useSecurityStore } from '@/stores/security-store';

/**
 * `design/home/verification-1 on click of the verifications.png` (and its identical twin under
 * `design/security/`): a gradient tier card carrying the tier, "1 of 3 complete" and the limit that
 * is still capped, then a "Steps" list where each unfinished row is blush-tinted and carries a solid
 * accent "Verify" pill, and finally a note explaining why they keep nagging.
 */
export default function VerificationScreen() {
  const theme = useTheme();
  const scheme = useResolvedScheme();
  const tier = useAuthStore((s) => s.user?.tier);
  const verificationSteps = useSecurityStore((s) => s.verificationSteps);
  const status = useSecurityStore((s) => s.status);
  const fetchVerification = useSecurityStore((s) => s.fetchVerification);

  useEffect(() => {
    fetchVerification();
  }, [fetchVerification]);

  // Without this the screen printed "0 of 0 complete" over an empty progress bar and an empty list
  // for the first half-second, then snapped to the real numbers.
  const loading = verificationSteps.length === 0 && isLoading(status);
  const total = verificationSteps.length;
  const done = verificationSteps.filter((s) => s.status === 'done').length;
  const progress = total ? done / total : 0;

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScreenHeader title="Verification" />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={[theme.wash1, theme.wash2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tierCard}
          >
            <View style={styles.tierHead}>
              {/* The user's own tier, not a count — an earlier build showed "Tier 2" here. */}
              <ThemedText type="stepHeader">{tier ?? 'Tier 1'}</ThemedText>
              {loading ? (
                <Skeleton width={92} height={13} />
              ) : (
                <ThemedText type="label" themeColor="mut">
                  {done} of {total} complete
                </ThemedText>
              )}
            </View>
            <View style={[styles.track, { backgroundColor: theme.key }]}>
              <View
                style={[styles.fill, { backgroundColor: theme.accent, width: `${progress * 100}%` }]}
              />
            </View>
            <ThemedText type="body" themeColor="mut" style={styles.tierNote}>
              {tier ?? 'Tier 1'}. Daily transfer limit ₦50,000 until you link your BVN and NIN.
            </ThemedText>
          </LinearGradient>

          <View>
            <SectionHeading title="Steps" />
            <View style={styles.rows}>
              {loading
                ? [0, 1, 2].map((i) => <Skeleton key={i} height={74} radius={Radius.card} />)
                : null}
              {verificationSteps.map((step) => {
                const isDone = step.status === 'done';
                const inReview = step.status === 'in_review';
                return (
                  <RowCard
                    key={step.key}
                    onPress={
                      isDone
                        ? undefined
                        : () => router.push({ pathname: '/security/verify-step', params: { key: step.key } })
                    }
                    style={
                      isDone
                        ? undefined
                        : // The reference tints every outstanding step, so the list reads at a glance.
                          { backgroundColor: withAlpha(theme.accent, scheme === 'dark' ? 0.14 : 0.06) }
                    }
                  >
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: isDone ? theme.accent : withAlpha(theme.accent, 0.14) },
                      ]}
                    >
                      <Icon
                        name={isDone ? 'check' : 'alert'}
                        size={17}
                        color={isDone ? theme.onAccent : theme.accent}
                        strokeWidth={2.4}
                      />
                    </View>

                    <View style={styles.textCol}>
                      <ThemedText type="rowTitle" numberOfLines={1}>
                        {step.label}
                      </ThemedText>
                      <ThemedText type="body" themeColor="mut" numberOfLines={1} style={styles.subtitle}>
                        {isDone ? step.desc : inReview ? 'In review' : 'Not verified yet'}
                      </ThemedText>
                    </View>

                    {isDone ? (
                      <StatusPill label="Verified" tone="neutral" />
                    ) : inReview ? (
                      <StatusPill label="In review" tone="accentSoft" />
                    ) : (
                      <StatusPill label="Verify" tone="accent" />
                    )}
                  </RowCard>
                );
              })}
            </View>
          </View>

          <View style={[styles.note, { backgroundColor: theme.card }]}>
            <Icon name="alert" size={17} color={theme.mut} strokeWidth={1.9} />
            <ThemedText type="body" themeColor="mut" style={styles.noteText}>
              Each completed step raises your daily limit. Unverified steps stay marked here and on
              your home screen until you finish them.
            </ThemedText>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: Screen.horizontal, paddingBottom: Screen.bottom, gap: 24 },

  tierCard: { borderRadius: Radius.hero, padding: 22, gap: 12 },
  tierHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  tierNote: { lineHeight: 18.4 },

  rows: { gap: Screen.rowGap },
  badge: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  textCol: { flex: 1, minWidth: 0 },
  subtitle: { marginTop: 3 },

  note: {
    flexDirection: 'row',
    gap: 10,
    padding: 18,
    borderRadius: Radius.card,
    alignItems: 'flex-start',
  },
  noteText: { flex: 1, lineHeight: 18.4 },
});
