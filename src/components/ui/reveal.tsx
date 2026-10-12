import type { ViewProps } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInUp,
  ReduceMotion,
  ZoomIn,
  type AnimatedProps,
} from 'react-native-reanimated';

import { Motion } from '@/constants/layout';

const easing = Easing.bezier(...Motion.easing);

/**
 * Every entrance honours the OS "reduce motion" setting. Reanimated skips to the end state rather
 * than playing the transform, so the content still appears — it simply does not travel.
 */
const reduceMotion = ReduceMotion.System;

/** `vs-in` — fade + translateY(12px) → none, .40s cubic-bezier(.2,.9,.3,1). */
export function Reveal({ delay = 0, children, style, ...rest }: AnimatedProps<ViewProps> & { delay?: number }) {
  return (
    <Animated.View
      entering={FadeInUp.duration(Motion.enter).delay(delay).easing(easing).reduceMotion(reduceMotion)}
      style={style}
      {...rest}
    >
      {children}
    </Animated.View>
  );
}

/** `vs-pop` — fade + scale(.9) → 1, matching the mockup's badge/icon entrances. */
export function PopIn({ delay = 0, children, style, ...rest }: AnimatedProps<ViewProps> & { delay?: number }) {
  return (
    <Animated.View
      entering={ZoomIn.duration(Motion.enter).delay(delay).easing(easing).reduceMotion(reduceMotion)}
      style={style}
      {...rest}
    >
      {children}
    </Animated.View>
  );
}

/** `vs-fade` — plain opacity fade, used for overlays and secondary content. */
export function FadeReveal({ delay = 0, children, style, ...rest }: AnimatedProps<ViewProps> & { delay?: number }) {
  return (
    <Animated.View
      entering={FadeIn.duration(Motion.quick).delay(delay).easing(easing).reduceMotion(reduceMotion)}
      style={style}
      {...rest}
    >
      {children}
    </Animated.View>
  );
}

/**
 * A `Reveal` whose delay is derived from its position, for lists and stacked sections. The cap keeps
 * a long list from crawling in from the bottom — past it, everything lands together.
 *
 * `src/app/tour.tsx` proved the pattern with a hand-written `delay={i * 70}`; this is that, shared.
 */
export function Stagger({
  index,
  children,
  style,
  ...rest
}: AnimatedProps<ViewProps> & { index: number }) {
  return (
    <Reveal delay={Math.min(index * Motion.stagger, Motion.staggerCap)} style={style} {...rest}>
      {children}
    </Reveal>
  );
}
