import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { CardChipGradient } from '@/constants/colors';
import { Radius } from '@/constants/radius';
import { useShadows } from '@/hooks/use-shadows';
import { useTheme } from '@/hooks/use-theme';

/** Four groups of four — the PAN placeholder the reference draws as dots. */
const GROUPS = [0, 1, 2, 3];

/**
 * The card face above the form on `design/add money/add debit card.png`: a dark gradient, a gold chip
 * top left, "DEBIT" top right, four groups of four dots for the number, and a footer row of
 * `Exp ••/••  CVV •••` against the holder's name.
 *
 * It fills in as the form is typed, so the preview is the feedback that the fields landed.
 *
 * Geometry off the reference: the face spans the same width as the fields beneath it — it is not a
 * centred card — at a 1.98 aspect, and the number sits about two thirds down rather than centred.
 *
 * Every ink here is `onAccent`/`onAccentSoft` rather than `theme.fg`: the face is a fixed dark
 * gradient in both schemes, so its ink must not flip with the theme — in light mode `fg` would be
 * near-black on near-black.
 */
export function DebitCardPreview({
  number,
  exp,
  cvv,
  name,
}: {
  number?: string;
  exp?: string;
  cvv?: string;
  name?: string;
}) {
  const theme = useTheme();
  // In dark mode `shadows.card` is a hairline rather than a drop shadow, which this face needs: its
  // own gradient bottoms out at #1b1917 against a #141313 background, so without it the card loses
  // its edge entirely.
  const shadows = useShadows();
  const digits = (number ?? '').replace(/\D/g, '');

  return (
    <LinearGradient
      colors={['#312e2c', '#1b1917']}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[styles.face, shadows.card]}
    >
      <View style={styles.top}>
        <LinearGradient
          colors={[...CardChipGradient]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.chip}
        />
        <ThemedText type="microStrong" style={[styles.debit, { color: theme.onAccent }]}>
          DEBIT
        </ThemedText>
      </View>

      <View style={styles.numberRow}>
        {GROUPS.map((g) => (
          <View key={g} style={styles.group}>
            {[0, 1, 2, 3].map((i) => {
              const digit = digits[g * 4 + i];
              return digit ? (
                <ThemedText key={i} type="microStrong" style={{ color: theme.onAccent }}>
                  {digit}
                </ThemedText>
              ) : (
                <View key={i} style={[styles.dot, { backgroundColor: theme.onAccent }]} />
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.footRow}>
        <View style={styles.footLeft}>
          <ThemedText type="micro" style={{ color: theme.onAccentSoft }}>
            Exp {exp || '••/••'}
          </ThemedText>
          <ThemedText type="micro" style={{ color: theme.onAccentSoft }}>
            CVV {cvv ? '•'.repeat(cvv.length) : '•••'}
          </ThemedText>
        </View>
        <ThemedText type="microStrong" numberOfLines={1} style={[styles.holder, { color: theme.onAccent }]}>
          {(name || 'Your name').toUpperCase()}
        </ThemedText>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  face: { alignSelf: 'stretch', aspectRatio: 1.98, borderRadius: Radius.veryRound, padding: 18 },
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  chip: { width: 34, height: 25, borderRadius: 6 },
  debit: { letterSpacing: 1.6 },

  // `auto` above rather than an even distribution: the reference leaves a wide gap under the chip and
  // sets the number about two thirds down the face.
  numberRow: { flexDirection: 'row', gap: 15, alignItems: 'center', marginTop: 'auto' },
  group: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  dot: { width: 5, height: 5, borderRadius: 2.5 },

  footRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 18,
  },
  footLeft: { flexDirection: 'row', gap: 14 },
  holder: { flexShrink: 1, letterSpacing: 0.6 },
});
