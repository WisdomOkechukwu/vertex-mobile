import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/radius';
import { useTheme } from '@/hooks/use-theme';

/**
 * The "Slide to send" affordance from the marketing art — an accent track with a white circular
 * knob carrying an arrow. Presentational only: it illustrates the gesture inside onboarding and tour
 * artwork rather than accepting one.
 */
export function SlideToSend({ label = 'Slide to send', height = 48 }: { label?: string; height?: number }) {
  const theme = useTheme();
  const knob = height - 10;

  return (
    <View style={[styles.track, { height, backgroundColor: theme.accent }]}>
      <View style={[styles.knob, { width: knob, height: knob, backgroundColor: theme.chip }]}>
        <Icon name="arrowRight" size={17} color={theme.accent} strokeWidth={2.4} />
      </View>
      <ThemedText type="buttonGhost" style={{ color: theme.onAccent }}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    gap: 12,
  },
  knob: { width: 38, height: 38, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
});
