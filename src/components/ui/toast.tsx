import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  FadeOutDown,
  LinearTransition,
  ReduceMotion,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { ThemedText } from '@/components/themed-text';
import { Colors, Motion, Radius, Screen, Spacing } from '@/constants/theme';
import { useResolvedScheme, useTheme } from '@/hooks/use-theme';
import { useUiStore } from '@/stores/ui-store';

const easing = Easing.bezier(...Motion.easing);

export function useToast() {
  const pushToast = useUiStore((s) => s.pushToast);
  return { show: pushToast };
}

/**
 * The toast deliberately inverts against the surface — a near-black pill in light mode, a near-white
 * one in dark — so it always reads as something laid *over* the screen rather than part of it. That
 * is why it uses the `toast*` tokens instead of `card`/`fg`.
 */
export function ToastHost() {
  const theme = useTheme();
  // The toast surface inverts, so its status tones have to come from the opposite half of the
  // palette: the bright dark-mode green reads on the near-black light-mode pill, and vice versa.
  const onToast = Colors[useResolvedScheme() === 'dark' ? 'light' : 'dark'];
  const toasts = useUiStore((s) => s.toasts);
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View pointerEvents="none" style={[styles.wrap, { bottom: insets.bottom + Spacing.four }]}>
      {toasts.map((t) => {
        const dotColor =
          t.tone === 'success' ? onToast.pos : t.tone === 'error' ? onToast.neg : theme.toastInk;
        return (
          <Animated.View
            key={t.id}
            // It used to render and unmount abruptly — a pill that blinks in and out reads as a
            // glitch rather than a notice. `layout` also slides the stack when one auto-dismisses.
            entering={FadeInDown.duration(Motion.quick).easing(easing).reduceMotion(ReduceMotion.System)}
            exiting={FadeOutDown.duration(Motion.quick).easing(easing).reduceMotion(ReduceMotion.System)}
            layout={LinearTransition.duration(Motion.quick).easing(easing).reduceMotion(ReduceMotion.System)}
            style={[styles.toast, { backgroundColor: theme.toastSurface }]}
          >
            {t.tone === 'success' ? (
              <Icon name="check" size={14} color={dotColor} strokeWidth={2.6} />
            ) : (
              <View style={[styles.dot, { backgroundColor: dotColor }]} />
            )}
            <ThemedText type="label" style={{ color: theme.toastInk }}>
              {t.message}
            </ThemedText>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: Spacing.three, right: Spacing.three, gap: Spacing.one, alignItems: 'center' },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Screen.horizontal,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
