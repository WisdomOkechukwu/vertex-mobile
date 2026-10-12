import { Svg, Path } from 'react-native-svg';

import { IconPaths } from '@/components/ui/icons/registry';
import { useTheme } from '@/hooks/use-theme';

export type IconProps = {
  name: keyof typeof IconPaths | string;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

/**
 * `color` is all but always passed. It stays optional because a glyph with no colour should fall
 * back to the *current* ink rather than a hardcoded one — the previous `'#1b1917'` default was
 * near-invisible on the dark surface, and silently so.
 */
export function Icon({ name, size = 22, color, strokeWidth = 2 }: IconProps) {
  const theme = useTheme();
  const paths = IconPaths[name] ?? IconPaths.grid;
  const stroke = color ?? theme.fg;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {paths.map((d, i) => (
        <Path
          key={i}
          d={d}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}
