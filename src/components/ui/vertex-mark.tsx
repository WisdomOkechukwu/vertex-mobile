import { Svg, Path } from 'react-native-svg';

/**
 * The Vertex logo mark: two nested chevrons, the inner one at reduced opacity. Path data is taken
 * verbatim from the design export's inline SVG.
 */
/** The white default is for the mark's usual home: an accent tile or a card face, dark in both
 *  schemes. On a themed surface pass `color` explicitly — see `tour.tsx` and `onboarding.tsx`. */
export function VertexMark({ size = 24, color = '#ffffff' }: { size?: number; color?: string }) {
  const stroke = (size / 24) * 2.4;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 19L12 5l8 14" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
      <Path d="M8.5 19L12 13l3.5 6" stroke={color} strokeWidth={stroke} strokeLinecap="round" opacity={0.55} />
    </Svg>
  );
}

/** The wordmark used on the splash and at the top of onboarding: accent mark + "Vertex". */
export function VertexWordmark({ size = 20 }: { size?: number }) {
  return <VertexMark size={size} />;
}
