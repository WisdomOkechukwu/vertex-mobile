import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { PressableScale } from '@/components/ui/pressable-scale';

import { Icon, type IconProps } from '@/components/ui/icon';
import { Spinner } from '@/components/ui/spinner';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/radius';
import { useTheme } from '@/hooks/use-theme';

export type ButtonGhostProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: IconProps['name'];
  /** Tints the leading icon — the design draws Face ID's glyph in the accent. */
  iconTone?: 'accent' | 'fg';
  /**
   * The design uses two secondary treatments: `outline` (a hairline-bordered pill one step lighter
   * than whatever it sits on — Login's "Use Face ID instead", and the pair inside the card on
   * `design/security/revoke-session-b.png`) and `fill` (a flat `key` surface — onboarding's
   * "Log in").
   */
  variant?: 'outline' | 'fill';
  /**
   * `strong` sets the label at the primary CTA's weight and size. The neutral "Close" pill on
   * `design/home/on click of the transactions.png` measures 15/800, not the 14/600 a secondary
   * action normally takes.
   */
  emphasis?: 'default' | 'strong';
  style?: StyleProp<ViewStyle>;
};

/**
 * The secondary CTA. Measured off `design/login/login.png` ("Use Face ID instead"): the button runs
 * y=475..528, so **54px** tall, on a **white fill with a 1px hairline border** — not the grey fill
 * the earlier build used.
 */
export function ButtonGhost({
  label,
  onPress,
  loading,
  disabled,
  leftIcon,
  iconTone = 'accent',
  variant = 'outline',
  emphasis = 'default',
  style,
}: ButtonGhostProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  return (
    <PressableScale
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        variant === 'fill'
          ? { backgroundColor: theme.key, borderColor: 'transparent' }
          : // `chip`, not `background`: `chip` is a step lighter than `card` in both schemes, so the
            // button reads as lifted on a card instead of punching a hole through it. (In dark,
            // `background` #141313 is *darker* than `card` #1f1e1d.)
            { backgroundColor: theme.chip, borderColor: theme.line },
        style,
      ]}
      opacity={isDisabled ? 0.45 : 1}
    >
      {loading ? (
        <Spinner size={16} color={theme.fg} />
      ) : (
        <>
          {leftIcon && (
            <Icon
              name={leftIcon}
              size={19}
              color={iconTone === 'accent' ? theme.accent : theme.fg}
              strokeWidth={1.8}
            />
          )}
          <ThemedText type={emphasis === 'strong' ? 'button' : 'buttonGhost'}>{label}</ThemedText>
        </>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: Radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingHorizontal: 20,
  },
});
