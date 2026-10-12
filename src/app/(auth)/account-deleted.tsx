import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { PopIn } from '@/components/ui/reveal';
import { ThemedText } from '@/components/themed-text';
import { deleteTone, Radius, Screen, withAlpha } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Step three of account deletion, built like `design/payment links/delete-2.png`: a tinted wash
 * fading out, the coloured disc, and a **neutral** way onward — the reference reserves the accent
 * CTA for outcomes worth celebrating, which this is not.
 *
 * It lives in `(auth)`, not next to the other two steps under `profile/`, because `deleteAccount`
 * flips `isAuthenticated` and the root layout's `Stack.Protected` unmounts every signed-in group the
 * moment it does — a result screen inside `profile/` would never get to render.
 *
 * There is no back button: the account is gone, so there is nothing behind this screen.
 */
export default function AccountDeletedScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={[withAlpha(theme.neg, 0.13), withAlpha(theme.neg, 0)]}
        style={styles.wash}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.flex}>
        <View style={styles.content}>
          <PopIn style={[styles.disc, { backgroundColor: deleteTone(theme.accent) }]}>
            <Icon name="check" size={30} color={theme.onAccent} strokeWidth={2.6} />
          </PopIn>

          <ThemedText type="stepHeader" style={[styles.centered, styles.title]}>
            Account deleted
          </ThemedText>
          <ThemedText type="body" themeColor="mut" style={[styles.centered, styles.note]}>
            Your Vertex account is closed and this device has been signed out. We have emailed you a
            record of the closure. Regulations require us to keep your transaction history for seven
            years, after which it is destroyed.
          </ThemedText>
        </View>

        <View style={styles.footer}>
          <Pressable
            onPress={() => {
              // `canDismiss` first: after deletion the signed-in stack is already gone, and
              // `dismissAll` on an empty stack logs a POP_TO_TOP warning.
              if (router.canDismiss()) router.dismissAll();
              router.replace('/(auth)/onboarding');
            }}
            style={({ pressed }) => [
              styles.cta,
              { backgroundColor: theme.key },
              pressed && { opacity: 0.8 },
            ]}
          >
            <ThemedText type="button">Back to start</ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  /** The tint reaches the page colour by ~360pt, as on the shared receipt screen. */
  wash: { position: 'absolute', top: 0, left: 0, right: 0, height: 360 },

  content: { flex: 1, paddingHorizontal: Screen.horizontal, paddingTop: 42, alignItems: 'center' },
  disc: { width: 75, height: 75, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  centered: { textAlign: 'center' },
  title: { marginTop: 22 },
  note: { marginTop: 14, paddingHorizontal: 10, lineHeight: 18.4 },

  footer: { paddingHorizontal: Screen.horizontal, paddingBottom: Screen.bottom },
  cta: { height: 56, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
});
