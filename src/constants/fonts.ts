/**
 * The design system's actual font pairing (extracted from the Claude Design project's
 * styles.css): "Archivo" for both heading and body roles, headings pinned to weight 800 by the
 * design system default though this screen's own headers render at 700 (see typography.ts).
 */
export const ArchivoWeights = {
  '400': 'Archivo_400Regular',
  '500': 'Archivo_500Medium',
  '600': 'Archivo_600SemiBold',
  '700': 'Archivo_700Bold',
  '800': 'Archivo_800ExtraBold',
} as const;

export type ArchivoWeight = keyof typeof ArchivoWeights;

export function archivo(weight: ArchivoWeight): string {
  return ArchivoWeights[weight];
}
