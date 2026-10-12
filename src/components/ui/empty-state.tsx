import { StyleSheet, View } from 'react-native';

import { ButtonGhost } from '@/components/ui/button-ghost';
import { Icon, type IconProps } from '@/components/ui/icon';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: IconProps['name'];
  title: string;
  description?: string;
  action?: { label: string; onPress: () => void };
}) {
  const theme = useTheme();

  return (
    <View style={styles.base}>
      {icon && (
        <View style={[styles.iconWrap, { backgroundColor: theme.key }]}>
          <Icon name={icon} size={24} color={theme.mut} />
        </View>
      )}
      <ThemedText type="sectionHeader" style={{ textAlign: 'center' }}>
        {title}
      </ThemedText>
      {description && (
        <ThemedText type="body" themeColor="mut" style={{ textAlign: 'center' }}>
          {description}
        </ThemedText>
      )}
      {action && <ButtonGhost label={action.label} onPress={action.onPress} style={{ marginTop: Spacing.two }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.five, paddingHorizontal: Spacing.four },
  iconWrap: { width: 52, height: 52, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
