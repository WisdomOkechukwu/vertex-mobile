import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { PopIn } from '@/components/ui/reveal';
import { VertexMark } from '@/components/ui/vertex-mark';
import { ThemedText } from '@/components/themed-text';
import { useShadows } from '@/hooks/use-shadows';
import { useTheme } from '@/hooks/use-theme';

/**
 * Splash, from `design/splash/splash-screen.png`: a warm glow washing down from the crown, the
 * accent app tile centred with the Vertex mark, the wordmark, and the tagline. Advances on its own
 * after a beat, or on tap.
 */
export default function SplashScreen() {
  const theme = useTheme();
  const shadows = useShadows();

  useEffect(() => {
    const timer = setTimeout(() => router.replace('/(auth)/onboarding'), 1900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Pressable style={styles.flex} onPress={() => router.replace('/(auth)/onboarding')}>
      <LinearGradient
        colors={[theme.wash1, theme.background]}
        locations={[0, 0.55]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.flex}
      >
        <View style={styles.center}>
          <PopIn style={[styles.tile, { backgroundColor: theme.accent }, shadows.accentGlow(theme.accent)]}>
            <VertexMark size={46} color={theme.onAccent} />
          </PopIn>
          <ThemedText type="logoWord" style={styles.word}>
            Vertex
          </ThemedText>
          <ThemedText type="bodyLg" themeColor="mut">
            Money, kept simple
          </ThemedText>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tile: { width: 96, height: 96, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  word: { marginTop: 22, marginBottom: 4 },
});
