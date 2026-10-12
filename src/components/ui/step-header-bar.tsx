import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { CircleButton } from '@/components/ui/circle-button';
import { StepProgressBar } from '@/components/ui/step-progress-bar';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/constants/layout';

/**
 * The wizard header on `design/security/2fa-1.png` through `2fa-4.png`: the back button and the
 * progress bar share one row, with `Step N of 4 · <name>` set under the bar rather than a screen
 * title. It replaces `ScreenHeader` on those four screens — a centred title there pushed the bar down
 * and left the step name nowhere to go.
 */
export function StepHeaderBar({
  step,
  total,
  label,
  onBack,
}: {
  step: number;
  total: number;
  label: string;
  onBack?: () => void;
}) {
  return (
    <View style={styles.row}>
      <CircleButton icon="chevronLeft" onPress={onBack ?? (() => router.back())} />
      <View style={styles.progress}>
        <StepProgressBar step={step} total={total} />
        <ThemedText type="microStrong" themeColor="mut">
          Step {step} of {total} · {label}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: Screen.horizontal,
    paddingTop: Screen.top,
  },
  progress: { flex: 1, gap: 9 },
});
