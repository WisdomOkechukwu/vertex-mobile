import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SendArt } from '@/components/marketing/mock-art';
import { ButtonGhost } from '@/components/ui/button-ghost';
import { ButtonPrimary } from '@/components/ui/button-primary';
import { VertexMark } from '@/components/ui/vertex-mark';
import { ThemedText } from '@/components/themed-text';
import { COMPLIANCE, ONBOARDING_SLIDES, slideArtFor, type OnboardingSlide } from '@/constants/content';
import { Radius, Screen } from '@/constants/theme';
import { useResolvedScheme, useTheme } from '@/hooks/use-theme';

const { width } = Dimensions.get('window');

/**
 * Onboarding, from `design/onboarding/onboarding-page-*.png`: each slide is a tinted art panel
 * carrying the Vertex wordmark and a mock-UI vignette, over a white sheet that holds the copy, the
 * dot pager and the two CTAs. The sheet is fixed — only the art and copy page across.
 */
export default function OnboardingScreen() {
  const theme = useTheme();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<OnboardingSlide>>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));

  const slide = ONBOARDING_SLIDES[index] ?? ONBOARDING_SLIDES[0];

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <FlatList
        ref={listRef}
        data={ONBOARDING_SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.title}
        style={styles.pager}
        renderItem={({ item, index: i }) => <SlideArt slide={item} index={i} />}
      />

      <View style={[styles.sheet, { backgroundColor: theme.background }]}>
        <SafeAreaView edges={['bottom']}>
          <ThemedText type="slideTitle">{slide.title}</ThemedText>
          <ThemedText type="bodyLg" themeColor="mut" style={styles.body}>
            {slide.body}
          </ThemedText>

          <View style={styles.dots}>
            {ONBOARDING_SLIDES.map((s, i) => (
              <Pressable
                key={s.title}
                onPress={() => listRef.current?.scrollToIndex({ index: i, animated: true })}
                style={[
                  styles.dot,
                  { backgroundColor: i === index ? theme.accent : theme.key, width: i === index ? 22 : 6 },
                ]}
              />
            ))}
          </View>

          <View style={styles.ctas}>
            <ButtonPrimary label="Sign up" onPress={() => router.push('/(auth)/sign-up/details')} />
            <ButtonGhost label="Log in" variant="fill" onPress={() => router.push('/(auth)/login')} />
          </View>

          <ThemedText type="nano" themeColor="mut" style={styles.compliance}>
            {COMPLIANCE.onboarding}
          </ThemedText>
        </SafeAreaView>
      </View>
    </View>
  );
}

/** One slide's art panel: the tinted wash, the wordmark, and that slide's vignette. */
function SlideArt({ slide, index }: { slide: OnboardingSlide; index: number }) {
  const scheme = useResolvedScheme();
  const isRadial = slide.art.shape === 'radial';
  const { colors, ink } = slideArtFor(slide.art, scheme);

  return (
    <LinearGradient
      colors={colors}
      start={isRadial ? { x: 0.28, y: 0.14 } : { x: 0.5, y: 0 }}
      end={isRadial ? { x: 1, y: 1 } : { x: 0.5, y: 1 }}
      style={[styles.art, { width }]}
    >
      <SafeAreaView edges={['top']} style={styles.artInner}>
        <View style={styles.wordmarkRow}>
          <VertexMark size={20} color={ink} />
          <ThemedText type="cardTitle" style={{ color: ink }}>
            Vertex
          </ThemedText>
        </View>

        <View style={styles.vignette}>
          {/* Slide 1 is the send vignette; the remaining vignettes land with their tours. */}
          {index === 0 ? <SendArt /> : null}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pager: { flexGrow: 0 },

  art: { height: 410 },
  artInner: { flex: 1, paddingHorizontal: 22 },
  wordmarkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  vignette: { flex: 1, justifyContent: 'center' },

  sheet: {
    flex: 1,
    marginTop: -Radius.hero,
    borderTopLeftRadius: Radius.hero,
    borderTopRightRadius: Radius.hero,
    paddingHorizontal: Screen.horizontalAuth,
    paddingTop: 30,
  },
  body: { marginTop: 12 },
  dots: { flexDirection: 'row', gap: 6, marginTop: 22, marginBottom: 22 },
  dot: { height: 6, borderRadius: Radius.pill },
  ctas: { gap: 10 },
  compliance: { textAlign: 'center', marginTop: 16 },
});
