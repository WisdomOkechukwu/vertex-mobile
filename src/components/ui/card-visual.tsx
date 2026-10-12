import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { VertexMark } from '@/components/ui/vertex-mark';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useShadows } from '@/hooks/use-shadows';
import { maskCardNumber } from '@/lib/format';

export type CardVisualData = {
  name: string;
  color: string;
  full: string;
  exp: string;
  cvv: string;
  frozen?: boolean;
};

/**
 * The virtual card face, from `design/virtual card/default.png`: measured at 288×196pt. A tinted
 * gradient with two decorative discs bleeding off the right edge, the Vertex mark and card name at
 * the top, the available balance opposite, then the masked number over the expiry, CVV and holder.
 */
export function CardVisual({
  card,
  available,
  holder,
  revealed,
  width = 288,
}: {
  card: CardVisualData;
  available?: string;
  holder?: string;
  revealed?: boolean;
  width?: number;
}) {
  const shadows = useShadows();

  return (
    <LinearGradient
      colors={[card.color, `${card.color}cc`]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, { width, height: Math.round(width * 0.68) }, shadows.card]}
    >
      {/* Decorative discs, clipped by the card's overflow. */}
      <View style={[styles.disc, styles.discOne]} />
      <View style={[styles.disc, styles.discTwo]} />

      {/* Two columns: brand over card name on the left, status over the balance on the right. */}
      <View style={styles.top}>
        <View style={styles.leftCol}>
          <View style={styles.brand}>
            <VertexMark size={20} color="#ffffff" />
            <ThemedText type="cardTitle" style={styles.ink}>
              Vertex
            </ThemedText>
          </View>
          <ThemedText type="body" style={styles.inkSoft}>
            {card.name}
          </ThemedText>
        </View>

        {!!available && (
          <View style={styles.rightCol}>
            <View style={styles.status}>
              <ThemedText type="nano" style={styles.ink}>
                {card.frozen ? 'Frozen' : 'Active'}
              </ThemedText>
            </View>
            <ThemedText type="greeting" style={styles.ink}>
              {available}
            </ThemedText>
            <ThemedText type="micro" style={styles.inkSoft}>
              Available
            </ThemedText>
          </View>
        )}
      </View>

      <ThemedText type="cardNumber" style={styles.number}>
        {maskCardNumber(card.full, revealed)}
      </ThemedText>

      <View style={styles.bottom}>
        <View style={styles.metaRow}>
          <ThemedText type="micro" style={styles.inkSoft}>
            Exp {revealed ? card.exp : '••/••'}
          </ThemedText>
          <ThemedText type="micro" style={styles.inkSoft}>
            CVV {revealed ? card.cvv : '•••'}
          </ThemedText>
        </View>
        {!!holder && (
          <ThemedText type="micro" style={styles.inkSoft}>
            {holder}
          </ThemedText>
        )}
      </View>
    </LinearGradient>
  );
}

/**
 * The whites below stay literal on purpose. A card face is a saturated gradient in both schemes, so
 * the ink over it never flips — keeping these in `StyleSheet.create` is correct, not an oversight.
 * (`theme.onAccent` is the same value; it exists for call sites that need to *say* "ink on a fill".)
 */
const styles = StyleSheet.create({
  card: { borderRadius: Radius.hero, padding: 20, overflow: 'hidden', justifyContent: 'space-between' },
  disc: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.09)' },
  discOne: { width: 200, height: 200, top: -40, right: -50 },
  discTwo: { width: 150, height: 150, bottom: -60, right: 10 },

  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  leftCol: { gap: 10 },
  rightCol: { alignItems: 'flex-end', gap: 6 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  status: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: Radius.pill,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },

  number: { color: '#ffffff' },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metaRow: { flexDirection: 'row', gap: 16 },

  ink: { color: '#ffffff' },
  inkSoft: { color: 'rgba(255,255,255,0.78)' },
});
