import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DotGrid, TourArt } from '@/components/marketing/tour-art';
import { ButtonPrimary } from '@/components/ui/button-primary';
import { Reveal } from '@/components/ui/reveal';
import { VertexMark } from '@/components/ui/vertex-mark';
import { ThemedText } from '@/components/themed-text';
import { FEATURE_TOURS, tourArtFor, type TourVariant } from '@/constants/content';
import { withAlpha } from '@/constants/colors';
import { Radius, Screen } from '@/constants/theme';
import { useResolvedScheme, useTheme } from '@/hooks/use-theme';

/** The hero measures 297pt in every tour reference. */
const HERO_HEIGHT = 297;

/**
 * A feature's first-run tour, from each flow's `onboarding.png`. A 297pt tinted hero carrying a
 * dotted texture, two soft blobs, the wordmark and a Skip pill, with the feature's own mock-UI
 * vignette clipped by the hero's bottom edge. Below it: the title, three numbered points and
 * "Got it".
 */
export default function FeatureTourScreen() {
  const theme = useTheme();
  const scheme = useResolvedScheme();
  const { variant } = useLocalSearchParams<{ variant?: string }>();
  const key = (variant as TourVariant) in FEATURE_TOURS ? (variant as TourVariant) : 'send';
  const tour = FEATURE_TOURS[key];
  const { wash, ink } = tourArtFor(tour.art, scheme);

  const dismiss = () => router.back();

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <View style={[styles.hero, { backgroundColor: wash }]}>
        <DotGrid ink={ink} />
        {/* The two blobs the references carry: one over the status bar, one off the left edge. */}
        <View style={[styles.blobTop, { backgroundColor: withAlpha(ink, 0.07) }]} />
        <View style={[styles.blobLeft, { backgroundColor: withAlpha(ink, 0.06) }]} />

        <SafeAreaView style={styles.heroInner}>
          <View style={styles.brandRow}>
            <VertexMark size={19} color={ink} />
            <ThemedText type="cardTitle" style={[styles.brand, { color: ink }]}>
              Vertex
            </ThemedText>
            <View style={styles.spacer} />
            <Pressable onPress={dismiss} style={[styles.skip, { backgroundColor: withAlpha(ink, 0.1) }]}>
              <ThemedText type="button" style={{ color: ink }}>
                Skip
              </ThemedText>
            </Pressable>
          </View>

          <Reveal style={styles.artRow}>
            <TourArt variant={key} ink={ink} />
          </Reveal>
        </SafeAreaView>
      </View>

      <View style={styles.sheet}>
        <ThemedText type="slideTitle">{tour.title}</ThemedText>

        <View style={styles.points}>
          {tour.points.map((point, i) => (
            <Reveal key={point.title} delay={i * 70}>
              <View style={styles.pointRow}>
                <ThemedText type="labelStrong" themeColor="accent" style={styles.pointNum}>
                  {String(i + 1).padStart(2, '0')}
                </ThemedText>
                <View style={styles.pointText}>
                  <ThemedText type="cardTitle">{point.title}</ThemedText>
                  <ThemedText type="body" themeColor="mut" style={styles.pointBody}>
                    {point.body}
                  </ThemedText>
                </View>
              </View>
            </Reveal>
          ))}
        </View>

        <View style={styles.footer}>
          <ButtonPrimary label="Got it" onPress={dismiss} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  // The vignettes are wider than the screen on purpose — the hero is what crops them.
  hero: { height: HERO_HEIGHT, overflow: 'hidden' },
  heroInner: { flex: 1 },
  blobTop: { position: 'absolute', top: -70, right: -60, width: 220, height: 220, borderRadius: Radius.pill },
  blobLeft: { position: 'absolute', top: 132, left: -96, width: 190, height: 190, borderRadius: Radius.pill },

  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: Screen.horizontal, height: 42 },
  brand: { letterSpacing: -0.2 },
  spacer: { flex: 1 },
  skip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: Radius.pill },

  /** Each vignette places itself horizontally — see `tour-art.tsx`. */
  artRow: { marginTop: 22 },

  sheet: { flex: 1, paddingHorizontal: Screen.horizontal, paddingTop: 30 },
  points: { gap: 17, marginTop: 21 },
  pointRow: { flexDirection: 'row', gap: 13 },
  pointNum: { width: 16, marginTop: 2 },
  pointText: { flex: 1, minWidth: 0 },
  pointBody: { marginTop: 3 },
  footer: { marginTop: 'auto', paddingBottom: Screen.bottom },
});
