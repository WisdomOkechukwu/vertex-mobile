import { useState } from 'react';
import { Platform, StyleSheet, TextInput, View, type KeyboardTypeOptions } from 'react-native';

import { Icon, type IconProps } from '@/components/ui/icon';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/radius';
import { Typography } from '@/constants/typography';
import { useTheme } from '@/hooks/use-theme';

export type TextFieldProps = {
  label?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  /** Rendered before the input, separated by a hairline rule (the mockup's `+234` prefix). */
  prefix?: string;
  /** The `₦` on the payment-link amount field is accent-coloured, unlike the muted `+234`. */
  prefixTone?: 'mut' | 'accent';
  /** The payment-link amount field runs its prefix straight into the input, with no divider. */
  prefixRule?: boolean;
  /** Glyph inside the field, before the text — the Vertex-tag search magnifier. */
  leadingIcon?: IconProps['name'];
  /**
   * `compact` is the search field on `design/home/on click of the see all transactions.png`: 48pt
   * tall rather than 54, with its placeholder a size down and a weight lighter.
   */
  size?: 'default' | 'compact';
  rightAdornment?: React.ReactNode;
  onFocus?: () => void;
  onBlur?: () => void;
};

/**
 * The mockup's text field: a `var(--key)` container at `border-radius:18px; padding:0 16px`
 * wrapping a borderless `min-height:54px` input at `font:600 15px/1 var(--font-body)`.
 * Labels above are `font:600 11px/1` in `var(--mut)`.
 */
export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  autoCapitalize = 'none',
  error,
  prefix,
  prefixTone = 'mut',
  prefixRule = true,
  leadingIcon,
  size = 'default',
  rightAdornment,
  onFocus,
  onBlur,
}: TextFieldProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const compact = size === 'compact';
  const inputType = compact ? Typography.bodyLg : Typography.inputText;

  return (
    <View style={styles.wrap}>
      {label && (
        <ThemedText type="fieldLabel" themeColor="mut" style={styles.label}>
          {label}
        </ThemedText>
      )}
      <View
        style={[
          styles.container,
          compact && styles.containerCompact,
          {
            backgroundColor: theme.key,
            borderColor: error ? theme.neg : focused ? theme.accent : 'transparent',
          },
        ]}
      >
        {leadingIcon && <Icon name={leadingIcon} size={18} color={theme.mut} strokeWidth={2} />}
        {prefix && (
          <>
            <ThemedText type="inputText" themeColor={prefixTone}>
              {prefix}
            </ThemedText>
            {prefixRule && <View style={[styles.rule, { backgroundColor: theme.line }]} />}
          </>
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.mut}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          onFocus={() => {
            setFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          style={[
            styles.input,
            compact && styles.inputCompact,
            inputType,
            { color: theme.fg },
            webNoOutline,
          ]}
        />
        {rightAdornment}
      </View>
      {error && (
        <ThemedText type="micro" themeColor="neg">
          {error}
        </ThemedText>
      )}
    </View>
  );
}

/**
 * react-native-web renders a real `<input>`, so Chromium draws its own focus ring on top of the
 * design's focus border. RN's `TextStyle` doesn't model `outlineStyle`, hence the cast; native
 * ignores the property entirely.
 */
const webNoOutline = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null;

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  label: { marginBottom: 0 },
  container: {
    minHeight: 54,
    borderRadius: Radius.field,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  containerCompact: { minHeight: 48 },
  rule: { width: 1, height: 20 },
  input: { flex: 1, minHeight: 54, paddingVertical: 0 },
  inputCompact: { minHeight: 48 },
});
