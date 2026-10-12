import { Tabs, TabList, TabTrigger, TabSlot, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  LinearTransition,
  ReduceMotion,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconProps } from '@/components/ui/icon';
import { ThemedText } from '@/components/themed-text';
import { Motion, Radius } from '@/constants/theme';
import { useShadows } from '@/hooks/use-shadows';
import { useTheme } from '@/hooks/use-theme';

const easing = Easing.bezier(...Motion.easing);

/**
 * The tabs, read off the reference screenshots (`home/default.png`, `virtual card/default.png`,
 * `utility/default.png`, `security/default-1.png`). Note the fourth: the *screen* is titled
 * "Security", but the *tab* is labelled "You" with a person icon — and the second is "Card",
 * singular. "Gifts" has no reference; it is the one tab this app added.
 */
const TABS: { name: string; href: any; label: string; icon: IconProps['name'] }[] = [
  { name: 'index', href: '/', label: 'Home', icon: 'home' },
  { name: 'cards', href: '/cards', label: 'Card', icon: 'card' },
  { name: 'bills', href: '/bills', label: 'Bills', icon: 'bookmark' },
  { name: 'gifts', href: '/gifts', label: 'Gifts', icon: 'giftCard' },
  { name: 'profile', href: '/profile', label: 'You', icon: 'user' },
];

/**
 * The mockup's floating bottom nav:
 * `left:50%; translateX(-50%); bottom:26px; gap:4px; padding:7px; border-radius:999px;
 *  background:var(--navbg); box-shadow:0 14px 34px -10px rgba(24,20,18,.4)`
 * It hugs its content rather than spanning the width, and only the active tab shows its label
 * (`font:700 13px/1 var(--font-heading)`) inside an accent-filled pill.
 */
export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <FloatingNav>
          {TABS.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <NavButton icon={tab.icon} label={tab.label} />
            </TabTrigger>
          ))}
        </FloatingNav>
      </TabList>
    </Tabs>
  );
}

function FloatingNav({ children, ...rest }: any) {
  const theme = useTheme();
  const shadows = useShadows();
  const insets = useSafeAreaInsets();

  return (
    <View {...rest} style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) + 14 }]}>
      {/* `LinearTransition` on the pill itself, so it glides as the active button changes width
          rather than snapping a whole tab's worth of layout in one frame. */}
      <Animated.View
        layout={LinearTransition.duration(Motion.quick).easing(easing).reduceMotion(ReduceMotion.System)}
        style={[styles.pill, { backgroundColor: theme.navbg }, shadows.floating]}
      >
        {children}
      </Animated.View>
    </View>
  );
}

/**
 * The active pill used to be a single-frame swap: the fill appeared, the padding jumped, the icon
 * changed weight and the label was mounted, all at once. It is the most-seen control in the app, so
 * it is the one most worth animating.
 *
 * The fill is interpolated rather than toggled — `withTiming` on a colour needs a driver value, and
 * animating `backgroundColor` through a shared value is the only way to cross-fade it. Width is left
 * to the parent's `LinearTransition`, and the label fades in and out on its own.
 */
function NavButton({
  icon,
  label,
  isFocused,
  ...props
}: TabTriggerSlotProps & { icon: IconProps['name']; label: string }) {
  const theme = useTheme();

  const progress = useDerivedValue(() =>
    withTiming(isFocused ? 1 : 0, {
      duration: Motion.quick,
      easing,
      reduceMotion: ReduceMotion.System,
    })
  );

  const fill = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], ['transparent', theme.accent]),
  }));

  return (
    <Pressable {...props}>
      <Animated.View
        layout={LinearTransition.duration(Motion.quick).easing(easing).reduceMotion(ReduceMotion.System)}
        style={[styles.button, isFocused && styles.buttonFocused, fill]}
      >
        <Icon
          name={icon}
          size={19}
          color={isFocused ? theme.onAccent : theme.mut}
          strokeWidth={isFocused ? 2.3 : 1.9}
        />
        {isFocused && (
          <Animated.View
            entering={FadeIn.duration(Motion.quick).easing(easing).reduceMotion(ReduceMotion.System)}
            exiting={FadeOut.duration(Motion.quick / 2).reduceMotion(ReduceMotion.System)}
          >
            <ThemedText type="tabLabel" style={{ color: theme.onAccent }}>
              {label}
            </ThemedText>
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 7,
    borderRadius: Radius.pill,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 40,
    paddingHorizontal: 15,
    borderRadius: Radius.pill,
  },
  buttonFocused: { paddingHorizontal: 16 },
});
