import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { PopIn } from '@/components/ui/reveal';
import { ThemedText } from '@/components/themed-text';
import { deleteTone, Radius, Screen, withAlpha } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * `design/payment links/delete-2.png`: the tinted wash fading to white, a red trash disc, and a
 * neutral — not accent — way back to the list.
 *
 * The title arrives as a param rather than off the store, because by the time this renders the link
 * is gone from it.
 */
export default function LinkDeletedScreen() {
  const theme = useTheme();
  const { title } = useLocalSearchParams<{ title?: string }>();
  const tone = deleteTone(theme.accent);

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={[withAlpha(theme.accent, 0.13), withAlpha(theme.accent, 0)]}
        style={styles.wash}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.flex}>
        <View style={styles.content}>
          <PopIn style={[styles.disc, { backgroundColor: tone }]}>
            <Icon name="trash" size={30} color={theme.onAccent} strokeWidth={2.4} />
          </PopIn>

          <ThemedText type="stepHeader" style={[styles.centered, styles.title]}>
            Link deleted
          </ThemedText>
          <ThemedText type="body" themeColor="mut" style={[styles.centered, styles.note]}>
            “{title ?? 'This link'}” no longer accepts payments. Payments already received stay in
            your history.
          </ThemedText>
        </View>

        <View style={styles.footer}>
          <Pressable
            onPress={() => {
              router.dismissAll();
              router.replace('/links');
            }}
            style={({ pressed }) => [
              styles.cta,
              { backgroundColor: theme.key },
              pressed && { opacity: 0.8 },
            ]}
          >
            <ThemedText type="button">All payment links</ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  /** The tint reaches white by ~360pt, as on the shared receipt screen. */
  wash: { position: 'absolute', top: 0, left: 0, right: 0, height: 360 },

  content: { flex: 1, paddingHorizontal: Screen.horizontal, paddingTop: 42, alignItems: 'center' },
  disc: { width: 75, height: 75, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  centered: { textAlign: 'center' },
  title: { marginTop: 22 },
  note: { marginTop: 14, paddingHorizontal: 10, lineHeight: 18.4 },

  footer: { paddingHorizontal: Screen.horizontal, paddingBottom: Screen.bottom },
  cta: { height: 56, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
});
