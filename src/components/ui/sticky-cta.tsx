import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function StickyCta({ children, safeArea = true }: { children: React.ReactNode; safeArea?: boolean }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: theme.background, paddingBottom: (safeArea ? insets.bottom : 0) + Spacing.three },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { paddingHorizontal: Screen.horizontal, paddingTop: Spacing.three, gap: Spacing.two },
});
