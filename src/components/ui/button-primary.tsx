import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { PressableScale } from '@/components/ui/pressable-scale';

import { Icon, type IconProps } from '@/components/ui/icon';
import { Spinner } from '@/components/ui/spinner';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/radius';
import { useTheme } from '@/hooks/use-theme';

export type ButtonPrimaryProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: IconProps['name'];
  /** The 52px variant — `design/payment links/home.png` runs its create CTA 4px shorter. */
  compact?: boolean;
  /** Overrides the accent fill — the pending receipt tints its CTA with the status colour. */
  tone?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * The primary CTA. Measured off `design/login/login.png`: the accent fill runs y=407..462, so
 * **56px** tall, full-width, pill radius.
 */
export function ButtonPrimary({ label, onPress, loading, disabled, leftIcon, compact, tone, style }: ButtonPrimaryProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  return (
    <PressableScale
      onPress={onPress}
      disabled={isDisabled}
      opacity={isDisabled ? 0.45 : 1}
      style={[styles.base, compact && styles.compact, { backgroundColor: tone ?? theme.accent }, style]}
    >
      {loading ? (
        <Spinner size={16} color={theme.onAccent} />
      ) : (
        <>
          {leftIcon && <Icon name={leftIcon} size={17} color={theme.onAccent} strokeWidth={2.2} />}
          <ThemedText type="button" style={{ color: theme.onAccent }}>
            {label}
          </ThemedText>
        </>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 22,
  },
  compact: { minHeight: 52 },
});
