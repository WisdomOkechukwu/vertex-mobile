import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { avatarTintFor } from '@/constants/colors';
import { useTheme } from '@/hooks/use-theme';

/**
 * The avatar mark — a **circular** tinted disc holding 2–3 initials. (The design export's inline
 * styles suggested a squircle; the reference screenshots show circles everywhere they appear —
 * Home's header and transaction rows, Login, Security.)
 */
export function Avatar({ label, size = 42, tint }: { label: string; size?: number; tint?: string }) {
  const theme = useTheme();
  const initials = label.includes(' ')
    ? label
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : label.slice(0, 3).toUpperCase();

  return (
    <View
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: tint ?? avatarTintFor(label) },
      ]}
    >
      <ThemedText type={size >= 46 ? 'cardTitle' : 'tabLabel'} style={{ color: theme.onPastel }}>
        {initials}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
});
