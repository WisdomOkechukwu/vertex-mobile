import { StyleSheet, View } from 'react-native';

import { Radius } from '@/constants/theme';

/**
 * The reference draws a regular 13×13 lattice — squares the same size as the gaps between them, not
 * QR data. Measured off `design/security/2fa-2.png`: 5.5pt cells on a 5.5pt pitch, 137pt across.
 *
 * The previous pseudo-random fill had a period of 5 on a 5-wide grid, so every "random" cell landed
 * in the same two columns and it rendered as two vertical stripes.
 */
const COUNT = 13;
const CELLS = Array.from({ length: COUNT * COUNT }, (_, i) => i);

/**
 * Scheme-independent on purpose: a scanner needs dark modules on a light quiet zone, so this panel
 * keeps a white face and near-black cells in dark mode too.
 */
const QR_PANEL = '#ffffff';
const QR_CELL = '#1b1917';

export function QrPlaceholder({ size = 160 }: { size?: number }) {
  // Cells and gaps are equal, so `COUNT` cells plus `COUNT - 1` gaps span the grid.
  const cell = (size * 0.86) / (COUNT * 2 - 1);

  return (
    <View style={[styles.base, { width: size, height: size, backgroundColor: QR_PANEL }]}>
      <View style={[styles.grid, { width: cell * (COUNT * 2 - 1), gap: cell }]}>
        {CELLS.map((i) => (
          <View key={i} style={{ width: cell, height: cell, backgroundColor: QR_CELL }} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: Radius.rounded, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});
