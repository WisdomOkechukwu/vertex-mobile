import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { CardChipGradient, DebitBrandTints } from '@/constants/colors';

/**
 * The little picture of a card that leads each saved-card row in
 * `design/add money/select debit card.png` — a brand-coloured rounded rectangle with a centred gold
 * chip. Not a text pill: the reference never spells the brand inside the mark, because the row's
 * title already says "Verve ···4417".
 *
 * Geometry measured off that reference: the mark is 40×29pt at a 6pt radius and the chip is 21×15pt,
 * a little over half the mark in each direction.
 *
 * Brand colours, so nothing here reads from the theme — the mark is a depiction of a physical card
 * and looks the same in light and dark, as the card faces elsewhere in the app do.
 */
export function CardBrandMark({ brand, tint, width = 40 }: { brand?: string; tint?: string; width?: number }) {
  const fill = tint ?? (brand ? DebitBrandTints[brand] : undefined) ?? DebitBrandTints.Visa;
  const height = width * 0.72;

  return (
    <View style={[styles.card, { width, height, backgroundColor: fill }]}>
      <LinearGradient
        colors={[...CardChipGradient]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.chip, { width: width * 0.52, height: height * 0.53 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 6, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  chip: { borderRadius: 4 },
});
