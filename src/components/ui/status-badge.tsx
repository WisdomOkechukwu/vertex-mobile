import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type Status = 'success' | 'pending' | 'failed';

export function StatusBadge({
  status,
  label,
  align = 'start',
}: {
  status: Status;
  label?: string;
  /** The transaction-detail hero centres its badge; every other use left-aligns it. */
  align?: 'start' | 'center';
}) {
  const theme = useTheme();
  const tone =
    status === 'success' ? theme.pos : status === 'failed' ? theme.neg : theme.accent;
  const iconName = status === 'success' ? 'check' : status === 'failed' ? 'close' : 'pin';
  const text = label ?? (status === 'success' ? 'Successful' : status === 'failed' ? 'Failed' : 'Pending');

  return (
    <View style={[styles.base, align === 'center' && styles.centred, { backgroundColor: `${tone}22` }]}>
      <Icon name={iconName} size={13} color={tone} strokeWidth={2.4} />
      <ThemedText type="label" style={{ color: tone }}>
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  centred: { alignSelf: 'center' },
});
