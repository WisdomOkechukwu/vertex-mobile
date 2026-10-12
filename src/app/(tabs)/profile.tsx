import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { CircleButton } from '@/components/ui/circle-button';
import { Icon } from '@/components/ui/icon';
import { SectionHeading } from '@/components/ui/section-heading';
import { SettingRow } from '@/components/ui/setting-row';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusPill } from '@/components/ui/status-pill';
import { ThemedText } from '@/components/themed-text';
import { COMPLIANCE, LOYALTY, THEME_CHOICES, THEME_SUBTITLES } from '@/constants/content';
import { RewardsGradient, UserAvatarTint } from '@/constants/colors';
import { Radius, Screen } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { isLoading } from '@/lib/api-status';
import { formatMoney, formatMoneyCompact } from '@/lib/format';
import { useAuthStore } from '@/stores/auth-store';
import { useSecurityStore } from '@/stores/security-store';
import { useThemeStore } from '@/stores/theme-store';
import { useUiStore } from '@/stores/ui-store';


/**
 * Security — the "You" tab, from `design/security/default-1.png` and `-2.png`. The profile summary,
 * the sign-in switches, verification progress, the rewards card, account actions, the device list
 * and the compliance note.
 */
export default function SecurityScreen() {
  const theme = useTheme();
  const openSheet = useUiStore((s) => s.openSheet);
  const logout = useAuthStore((s) => s.logout);

  /**
   * Sign-out is reversible, so it gets a confirmation sheet rather than the PIN-gated route the
   * app uses for destructive steps. Landing on onboarding rather than login keeps the signed-out
   * entry point consistent with a cold start.
   */
  const confirmLogout = () =>
    openSheet('confirm', {
      title: 'Log out?',
      body: 'You will need your PIN or Face ID to sign back in on this device.',
      confirmLabel: 'Log out',
      onConfirm: async () => {
        await logout();
        // `logout` flips the auth guard, so the signed-in stack may already be unmounted.
        if (router.canDismiss()) router.dismissAll();
        router.replace('/(auth)/onboarding');
      },
    });
  const themePreference = useThemeStore((s) => s.preference);
  const user = useAuthStore((s) => s.user);
  const biometricEnabled = useAuthStore((s) => s.biometricEnabled);
  const setBiometric = useAuthStore((s) => s.setBiometric);
  const {
    devices,
    verificationSteps,
    twoFactorEnabled,
    disableTwoFactor,
    fetchDevices,
    fetchVerification,
    status,
  } = useSecurityStore();

  useEffect(() => {
    fetchVerification();
    fetchDevices();
  }, [fetchVerification, fetchDevices]);

  /**
   * `total` falls back to 3 so the progress bar has a denominator — which meant an unloaded screen
   * confidently announced "3 left" before correcting itself to "2 left". Skeleton those figures
   * rather than guessing them.
   */
  const loadingSecurity = verificationSteps.length === 0 && isLoading(status);
  const done = verificationSteps.filter((s) => s.status === 'done').length;
  const total = verificationSteps.length || 3;
  const outstanding = total - done;

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex}>
        <View style={styles.header}>
          <CircleButton icon="chevronLeft" onPress={() => router.back()} />
          <ThemedText type="sectionHeader" style={styles.headerTitle}>
            Security
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Screen.bottomWithNav }}
        >
          <Pressable style={styles.section} onPress={() => router.push('/profile/edit')}>
            <LinearGradient
              colors={[theme.wash1, theme.wash2]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.profileCard}
            >
              <Avatar label={user?.avatarInitials ?? 'AO'} size={48} tint={UserAvatarTint} />
              <View style={styles.profileText}>
                <ThemedText type="sectionHeader" numberOfLines={1}>
                  {user?.fullName ?? 'Your account'}
                </ThemedText>
                <ThemedText type="label" themeColor="mut" style={styles.spaced}>
                  @{user?.profileTag ?? 'you'} · {user?.tier ?? 'Tier 1'}
                </ThemedText>
              </View>
              {loadingSecurity ? (
                <Skeleton width={44} height={22} radius={Radius.pill} />
              ) : (
                outstanding > 0 && <StatusPill label={`${outstanding} left`} tone="accentSoft" />
              )}
              <Icon name="chevronRight" size={16} color={theme.mut} strokeWidth={2.2} />
            </LinearGradient>
          </Pressable>

          <View style={styles.section}>
            <SectionHeading title="Sign-in" />
            <View style={styles.rows}>
              <SettingRow
                icon="shieldAlert"
                title="Two-factor authentication"
                subtitle={twoFactorEnabled ? 'On · required at sign-in' : 'Off · set it up in about a minute'}
                value={twoFactorEnabled}
                // Setting 2FA up is a four-step flow, so switching *on* navigates. Switching off is
                // a single call — the switch used to navigate either way, which meant a user who had
                // turned 2FA on could never turn it off from here.
                onValueChange={(next) =>
                  next ? router.push('/security/two-factor-setup/method') : disableTwoFactor()
                }
              />
              <SettingRow
                icon="face"
                title="Face ID login"
                subtitle="Replaces your password on this device"
                value={biometricEnabled}
                onValueChange={setBiometric}
              />
              <SettingRow
                icon="bell"
                title="Login alerts"
                subtitle="Push and email on new sign-ins"
                value
                onValueChange={() => {}}
              />
            </View>
          </View>

          <View style={styles.section}>
            <SectionHeading title="Appearance" />
            <SettingRow
              icon="eye"
              title="Theme"
              subtitle={THEME_SUBTITLES[themePreference]}
              // A dedicated screen rather than a sheet: a theme is a change you want to see before
              // committing to it, and a sheet covers the very screen it is changing.
              onPress={() => router.push('/profile/appearance')}
              trailing={
                <View style={styles.trailingGroup}>
                  <StatusPill
                    label={THEME_CHOICES.find((c) => c.value === themePreference)?.label ?? 'System'}
                    tone="neutral"
                  />
                  <Icon name="chevronRight" size={16} color={theme.mut} strokeWidth={2.2} />
                </View>
              }
            />
          </View>

          <View style={styles.section}>
            <SectionHeading
              title="Verification"
              meta={loadingSecurity ? undefined : `${done} of ${total} complete`}
            />
            <SettingRow
              icon="shield2"
              title={user?.tier ?? 'Tier 1'}
              subtitle="BVN and NIN, then Home address outstanding"
              onPress={() => router.push('/security')}
              trailing={
                <View style={styles.trailingGroup}>
                  {loadingSecurity ? (
                    <Skeleton width={52} height={22} radius={Radius.pill} />
                  ) : (
                    <StatusPill label={`${outstanding} to do`} tone="accent" />
                  )}
                  <Icon name="chevronRight" size={16} color={theme.mut} strokeWidth={2.2} />
                </View>
              }
            />
            <View style={[styles.track, { backgroundColor: theme.key }]}>
              <View style={[styles.fill, { backgroundColor: theme.accent, width: `${(done / total) * 100}%` }]} />
            </View>
          </View>

          <Pressable style={styles.section} onPress={() => router.push('/cashback')}>
            <LinearGradient
              colors={RewardsGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.rewards}
            >
              <View style={[styles.rewardsIcon, { backgroundColor: theme.onAccentFill }]}>
                <Icon name="star" size={22} color={theme.onAccent} strokeWidth={2} />
              </View>
              <View style={styles.rewardsText}>
                <ThemedText type="labelStrong" style={styles.onDark}>
                  Cashback and rewards
                </ThemedText>
                <ThemedText type="stepHeader" style={[styles.onDark, styles.rewardsValue]}>
                  {formatMoney(user?.cashbackBalance ?? 0, 'NGN').replace('.00', '')}
                </ThemedText>
                <ThemedText type="micro" style={styles.onDarkSoft}>
                  {formatMoneyCompact(LOYALTY.earnedThisMonth, 'NGN')} earned this month · {LOYALTY.tier}{' '}
                  member
                </ThemedText>
              </View>
              <Icon name="chevronRight" size={18} color={theme.onAccent} strokeWidth={2.2} />
            </LinearGradient>
          </Pressable>

          <View style={styles.section}>
            <SectionHeading title="Account security" />
            <View style={styles.rows}>
              <SettingRow
                icon="lock"
                title="Change password"
                subtitle="Last changed 3 months ago"
                onPress={() => router.push('/security/change-password')}
              />
              <SettingRow
                icon="keypad"
                title="Change transaction PIN"
                subtitle="4 digits, used for every transfer"
                onPress={() => router.push('/security/change-pin')}
              />
            </View>
          </View>

          <View style={styles.section}>
            <SectionHeading title="Devices and sessions" />
            <View style={styles.rows}>
              {devices.length === 0 && isLoading(status)
                ? [0, 1, 2].map((i) => <Skeleton key={i} height={72} radius={Radius.card} />)
                : null}
              {devices.map((device) => (
                <SettingRow
                  key={device.id}
                  title={device.name}
                  subtitle={device.meta}
                  trailing={
                    device.current ? (
                      <StatusPill label="Current" tone="accent" />
                    ) : (
                      <Pressable onPress={() => router.push({ pathname: '/security/devices/revoke', params: { id: device.id } })}>
                        <StatusPill
                          label={device.trusted ? 'Sign out' : 'Revoke'}
                          tone={device.trusted ? 'neutral' : 'accentSoft'}
                        />
                      </Pressable>
                    )
                  }
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={[styles.protected, { backgroundColor: theme.card }]}>
              <View style={styles.protectedTitle}>
                <Icon name="shield2" size={19} color={theme.accent} strokeWidth={2} />
                <ThemedText type="tileValue">Your money is protected</ThemedText>
              </View>
              <ThemedText type="body" themeColor="mut">
                AES-256 at rest, TLS 1.3 in transit. {COMPLIANCE.deposits}.
              </ThemedText>
            </View>
          </View>

          {/* No reference screen carries these two, so they follow the app's own row grammar: a
              chevron row for the reversible action, the destructive tone for the permanent one. */}
          <View style={styles.section}>
            <SectionHeading title="Account" />
            <View style={styles.rows}>
              <SettingRow
                icon="logout"
                title="Log out"
                subtitle="You will need your PIN or Face ID to sign back in"
                onPress={confirmLogout}
              />
              <SettingRow
                icon="trash"
                tone="destructive"
                title="Delete account"
                subtitle="Close your Vertex account permanently"
                onPress={() => router.push('/profile/delete')}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Screen.horizontal,
    paddingTop: Screen.top,
    paddingBottom: 18,
  },
  headerTitle: { flex: 1, textAlign: 'center' },
  headerSpacer: { width: 42 },

  section: { paddingHorizontal: Screen.horizontal, marginBottom: 24 },
  rows: { gap: Screen.rowGap },
  spaced: { marginTop: 3 },
  trailingGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: Radius.card,
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  profileText: { flex: 1, minWidth: 0 },

  track: { height: 6, borderRadius: Radius.pill, overflow: 'hidden', marginTop: 14 },
  fill: { height: 6, borderRadius: Radius.pill },

  rewards: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: Radius.card,
    paddingVertical: 15,
    paddingHorizontal: 18,
  },
  rewardsIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardsText: { flex: 1, minWidth: 0, gap: 4 },
  rewardsValue: { marginVertical: 2 },
  onDark: { color: '#ffffff' },
  onDarkSoft: { color: 'rgba(255,255,255,0.78)' },

  protected: { borderRadius: Radius.card, padding: 18, gap: 10 },
  protectedTitle: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
