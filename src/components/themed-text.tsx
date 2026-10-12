import { Text, type TextProps } from 'react-native';

import { ThemeColor } from '@/constants/theme';
import { Typography, type TypographyVariant } from '@/constants/typography';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  /** One of the design's typography roles — see `constants/typography.ts`. */
  type?: TypographyVariant;
  themeColor?: ThemeColor;
};

/**
 * Every piece of text in the app goes through here so it picks up one of the design's typography
 * roles. Note that the roles carry `fontFamily` and deliberately no `fontWeight`: with a custom
 * font, weight is selected by family name, and passing `fontWeight` as well makes the platform
 * synthesise a faux-bold on top of an already-bold face.
 */
export function ThemedText({ style, type = 'body', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return <Text style={[{ color: theme[themeColor ?? 'fg'] }, Typography[type], style]} {...rest} />;
}
