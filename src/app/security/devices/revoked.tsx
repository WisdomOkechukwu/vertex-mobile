import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonGhost } from '@/components/ui/button-ghost';
import { ButtonPrimary } from '@/components/ui/button-primary';
import { Icon } from '@/components/ui/icon';
import { PopIn } from '@/components/ui/reveal';
import { ThemedText } from '@/components/themed-text';
import { Radius, Screen, withAlpha } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * `design/security/revoke-session-b.png`: a green wash down from the top, a **solid** `pos` disc with
 * a white check, the device named in the body, and the two follow-ups side by side inside the "Worth
 * doing next" card under its own line of copy.
 *
 * The name arrives as a route param — by the time this renders, `revokeDevice` has already dropped
 * the row from the store.
 */
export default function SessionRevokedScreen() {
  const theme = useTheme();
  const { name } = useLocalSearchParams<{ name?: string }>();

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={[withAlpha(theme.pos, 0.13), withAlpha(theme.pos, 0)]}
        style={styles.wash}
        pointerEvents="none"
      />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <View style={styles.content}>
          <PopIn style={[styles.badge, { backgroundColor: theme.pos }]}>
            <Icon name="check" size={30} color={theme.onAccent} strokeWidth={2.8} />
          </PopIn>

          <ThemedText type="stepHeader" style={styles.centred}>
            Session revoked
          </ThemedText>
          <ThemedText type="bodyLg" themeColor="mut" style={[styles.centred, styles.blurb]}>
            {name ?? 'That device'} has been signed out. We have emailed you a record of this change.
          </ThemedText>

          <View style={[styles.suggestCard, { backgroundColor: theme.card }]}>
            <ThemedText type="cardTitle">Worth doing next</ThemedText>
            <ThemedText type="body" themeColor="mut" style={styles.suggestBody}>
              If you did not recognise that device, change your password and turn on two-factor
              authentication.
            </ThemedText>
            <View style={styles.suggestActions}>
              {/* `outline` on a `card`, as the reference draws them, and a tighter inset than the
                  default 20pt — at half the card's width, "Change password" wraps otherwise. */}
              <View style={styles.suggestAction}>
                <ButtonGhost
                  label="Change password"
                  style={styles.suggestButton}
                  onPress={() => router.replace('/security/change-password')}
                />
              </View>
              <View style={styles.suggestAction}>
                <ButtonGhost
                  label="Set up 2FA"
                  style={styles.suggestButton}
                  onPress={() => router.replace('/security/two-factor-setup/method')}
                />
              </View>
            </View>
          </View>
        </View>
        <View style={styles.footer}>
          <ButtonPrimary label="Back to security" onPress={() => router.replace('/profile')} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wash: { position: 'absolute', top: 0, left: 0, right: 0, height: 360 },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: Screen.horizontal, paddingTop: 40, gap: 14 },
  badge: { width: 75, height: 75, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  centred: { textAlign: 'center' },
  blurb: { lineHeight: 21 },

  suggestCard: { width: '100%', borderRadius: Radius.card, padding: 16, gap: 10, marginTop: 14 },
  suggestBody: { lineHeight: 19 },
  suggestActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  suggestAction: { flex: 1 },
  suggestButton: { paddingHorizontal: 12 },

  footer: { paddingHorizontal: Screen.horizontal, paddingBottom: Screen.bottom },
});
