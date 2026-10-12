import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function OtpBoxEntry({ length = 6, value, error }: { length?: number; value: string; error?: boolean }) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {Array.from({ length }, (_, i) => {
        const digit = value[i];
        const active = i === value.length;
        return (
          <View
            key={i}
            style={[
              styles.box,
              {
                backgroundColor: theme.key,
                borderColor: error ? theme.neg : active ? theme.accent : 'transparent',
              },
            ]}
          >
            <ThemedText type="sectionHeader">{digit ?? ''}</ThemedText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  box: {
    width: 42,
    height: 52,
    borderRadius: Radius.crisp,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
