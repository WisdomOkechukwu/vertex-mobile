import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, washTint } from '@/constants/theme';
import { useResolvedScheme, useTheme } from '@/hooks/use-theme';

export function InfoBanner({ text, tone = 'neutral' }: { text: string; tone?: 'neutral' | 'warning' }) {
  const theme = useTheme();
  const scheme = useResolvedScheme();
  const bg = tone === 'warning' ? washTint(theme.neg, scheme, 'firm') : theme.card;

  return (
    <View style={[styles.base, { backgroundColor: bg }]}>
      <Icon name={tone === 'warning' ? 'shield2' : 'shield'} size={16} color={tone === 'warning' ? theme.neg : theme.mut} />
      <ThemedText type="label" themeColor="mut" style={{ flex: 1 }}>
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.rounded,
    alignItems: 'flex-start',
  },
});
