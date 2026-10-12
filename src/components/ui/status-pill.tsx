import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/radius';
import { useTheme } from '@/hooks/use-theme';

/**
 * The small state pills — "Current" and "2 to do" (accent fill), "Sign out" (neutral), "Revoke"
 * (accent tint), "Active"/"Paused" on payment links.
 *
 * `plain` exists because `key` disappears on a gradient hero: the paused pill on
 * `design/payment links/pause.png` samples #ffffff, where the same pill over a `card` row in
 * `home.png` samples #f1f0ef.
 */
export function StatusPill({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'accent' | 'accentSoft' | 'neutral' | 'positive' | 'plain';
}) {
  const theme = useTheme();

  const palette =
    tone === 'accent'
      ? { bg: theme.accent, fg: theme.onAccent }
      : tone === 'accentSoft'
        ? { bg: `${theme.accent}1f`, fg: theme.accent }
        : tone === 'positive'
          ? { bg: `${theme.pos}1f`, fg: theme.pos }
          : tone === 'plain'
            ? // `card`, not `chip`: `chip` and `key` are the same #272525 in dark, which would make
              // `plain` and `neutral` identical on the gradient hero this tone exists for.
              { bg: theme.card, fg: theme.mut }
            : { bg: theme.key, fg: theme.mut };

  return (
    <View style={[styles.pill, { backgroundColor: palette.bg }]}>
      <ThemedText type="microStrong" style={{ color: palette.fg }}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  // Measured off `design/payment links/home.png`: 47.3 x 22.5 around a 10px label.
  pill: { borderRadius: Radius.pill, paddingHorizontal: 9, paddingVertical: 6, alignSelf: 'flex-start' },
});
