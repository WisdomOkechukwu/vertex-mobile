import { StyleSheet, View } from 'react-native';

import { SlideToSend } from '@/components/marketing/slide-to-send';
import { Avatar } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { ThemedText } from '@/components/themed-text';
import { Radius, withAlpha } from '@/constants/theme';
import { useShadows } from '@/hooks/use-shadows';
import { useTheme } from '@/hooks/use-theme';

/**
 * The little mock-UI vignettes that sit in onboarding slides and feature-tour heroes. The design
 * reuses the same artwork in both places — the send vignette appears in `onboarding-page-1.png` and
 * again in `send money/onboarding.png` — so each one is built once here.
 *
 * These are illustrations, not working UI: nothing is interactive and nothing reads from a store.
 */

/** Card surface shared by every vignette. */
function ArtCard({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const shadows = useShadows();
  return <View style={[styles.card, { backgroundColor: theme.chip }, shadows.card]}>{children}</View>;
}

/** A muted pill, e.g. the green "Verified" tag. */
function Tag({ label, tone }: { label: string; tone: 'pos' | 'mut' }) {
  const theme = useTheme();
  const colour = tone === 'pos' ? theme.pos : theme.mut;
  return (
    <View style={[styles.tag, { backgroundColor: withAlpha(colour, 0.12) }]}>
      <ThemedText type="nano" style={{ color: colour }}>
        {label}
      </ThemedText>
    </View>
  );
}

/** Send: recipient, amount, and the slide-to-send track — onboarding slide 1 and the send tour. */
export function SendArt() {
  const theme = useTheme();

  return (
    <View style={styles.stack}>
      <ArtCard>
        <View style={styles.row}>
          <Avatar label="Nkem Obi" size={36} tint="#dfe7ff" />
          <View style={styles.rowText}>
            <ThemedText type="cardTitle">Nkem Obi</ThemedText>
            <ThemedText type="micro" themeColor="mut">
              GTBank · 01••••6789
            </ThemedText>
          </View>
          <Tag label="Verified" tone="pos" />
        </View>

        <View style={[styles.rule, { backgroundColor: theme.line }]} />

        <View style={styles.amountRow}>
          <ThemedText type="artSymbol" themeColor="accent">
            ₦
          </ThemedText>
          <ThemedText type="artFigure">45,000</ThemedText>
        </View>
        <ThemedText type="micro" themeColor="mut" style={styles.centered}>
          Fee ₦10 · arrives instantly
        </ThemedText>

        <View style={styles.slideWrap}>
          <SlideToSend />
        </View>
      </ArtCard>

      {/* The confirmation toast that sits just under the card. */}
      <View style={[styles.toast, { backgroundColor: theme.toastSurface }]}>
        <View style={[styles.toastDot, { backgroundColor: theme.pos }]}>
          <Icon name="check" size={12} color={theme.onAccent} strokeWidth={3.2} />
        </View>
        <ThemedText type="labelStrong" style={{ color: theme.toastInk }}>
          Sent · Nkem has the money
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 14 },
  card: { borderRadius: Radius.cardLg, padding: 15 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  rowText: { flex: 1, minWidth: 0, gap: 2 },
  tag: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: Radius.pill },
  rule: { height: 1, marginVertical: 14 },
  amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2 },
  centered: { textAlign: 'center', marginTop: 6 },
  slideWrap: { marginTop: 16 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: Radius.rounded,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  toastDot: { width: 22, height: 22, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
});
