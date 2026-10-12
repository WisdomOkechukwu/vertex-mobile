import { forwardRef } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Motion, Press } from '@/constants/layout';

const easing = Easing.bezier(...Motion.easing);

/**
 * The animation lives on the `Pressable` itself, not on a view inside it.
 *
 * An earlier version wrapped the children in an `Animated.View` and put `style` on that, which
 * silently broke every caller whose style carried layout — the keypad's `flex: 1` keys collapsed to
 * their content width, because the flex was being applied one level below the row that distributes it.
 */
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * The app's press feedback: a small scale-down and dim, animated rather than swapped.
 *
 * Everything tappable should go through this. Before it, feedback was an instantaneous style flip at
 * one of six different opacities, and `SegmentedControl`, `SegmentedToggle`, `SectionHeading`, the
 * sheet's close button and roughly twenty screens' bespoke `Pressable`s had none at all.
 *
 * `style` is a plain style rather than a function, deliberately — the pressed state is expressed by
 * the animation, so a caller has no reason to branch on it.
 */
export const PressableScale = forwardRef<
  React.ComponentRef<typeof Pressable>,
  Omit<PressableProps, 'style'> & {
    style?: StyleProp<ViewStyle>;
    /**
     * The resting opacity, folded into the press animation rather than layered over it. A disabled
     * dim cannot go in `style`: the animated opacity is applied last and would simply overwrite it.
     */
    opacity?: number;
    /** Opt out of the scale where the target is a full-bleed surface and shrinking it looks wrong. */
    scale?: boolean;
  }
>(function PressableScale({ style, opacity = 1, scale = true, disabled, children, ...rest }, ref) {
  const pressed = useSharedValue(0);

  const animated = useAnimatedStyle(() => ({
    opacity: opacity * (1 - pressed.value * (1 - Press.dim)),
    transform: [{ scale: scale ? 1 - pressed.value * (1 - Press.scale) : 1 }],
  }));

  const set = (to: number) => {
    pressed.value = withTiming(to, {
      duration: to ? Press.inDuration : Press.outDuration,
      easing,
      reduceMotion: ReduceMotion.System,
    });
  };

  return (
    <AnimatedPressable
      ref={ref}
      disabled={disabled}
      onPressIn={() => !disabled && set(1)}
      onPressOut={() => set(0)}
      style={[style, animated]}
      {...rest}
    >
      {children as React.ReactNode}
    </AnimatedPressable>
  );
});
