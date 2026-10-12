import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlertBanner } from '@/components/ui/alert-banner';
import { Avatar } from '@/components/ui/avatar';
import { ButtonGhost } from '@/components/ui/button-ghost';
import { CircleButton } from '@/components/ui/circle-button';
import { DetailCard, type DetailRow } from '@/components/ui/detail-card';
import { Icon } from '@/components/ui/icon';
import { ScreenHeader } from '@/components/ui/screen-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { ThemedText } from '@/components/themed-text';
import { Screen, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { TransactionStatus } from '@/services/types/transactions';
import { useUiStore } from '@/stores/ui-store';

export type DetailScreenProps = {
  /** Tinted monogram disc, as the row that led here showed it. */
  mark: string;
  tint: string;
  name: string;
  /** The line under the name — the reference prints the channel here. */
  subtitle: string;
  /** Pre-formatted and already signed, as the ledger stores it. */
  amount: string;
  dir: 'in' | 'out';
  status: TransactionStatus;
  statusLabel: string;
  rows: DetailRow[];
  /**
   * The cashback call-out between the card and the footer, as
   * `design/virtual card/on click of transaction.png` draws it: a blush banner with a star, a bold
   * accent title and one muted line beneath.
   */
  reward?: { title: string; body: string };
  shareText: string;
};

const FOOTNOTE = 'Something wrong with this transaction? Report it within 90 days.';

/**
 * The detail template from `design/home/on click of the transactions.png`, shared with
 * `design/security/rewards-transaction-details.png` — the two references are the same screen with
 * different row labels, so the caller supplies the rows and this owns the chrome.
 *
 * Header: back, "Details", a share disc. Hero: 61pt monogram, the name at `greeting`, the channel
 * muted beneath it, the figure at `amountFigure` tinted by direction, then a centred status pill.
 * Footer: a wide neutral "Close" pill beside a same-height circular share button, then the footnote.
 */
export function DetailScreen({
  mark,
  tint,
  name,
  subtitle,
  amount,
  dir,
  status,
  statusLabel,
  rows,
  reward,
  shareText,
}: DetailScreenProps) {
  const theme = useTheme();
  const openSheet = useUiStore((s) => s.openSheet);
  const share = () => openSheet('share', { text: shareText });

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScreenHeader title="Details" right={<CircleButton icon="upload" onPress={share} />} />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Avatar label={mark} tint={tint} size={61} />
            <ThemedText type="greeting" numberOfLines={2} style={styles.heroName}>
              {name}
            </ThemedText>
            <ThemedText type="label" themeColor="mut" style={styles.heroSub}>
              {subtitle}
            </ThemedText>
            <ThemedText
              type="amountFigure"
              style={[styles.heroAmount, { color: dir === 'in' ? theme.pos : theme.neg }]}
            >
              {amount}
            </ThemedText>
            <StatusBadge status={status} label={statusLabel} align="center" />
          </View>

          <DetailCard rows={rows} />

          {!!reward && (
            <AlertBanner tone="accent" icon="star" iconStyle="bare" title={reward.title} body={reward.body} />
          )}
        </ScrollView>

        <View style={styles.footer}>
          <ButtonGhost
            variant="fill"
            emphasis="strong"
            label="Close"
            onPress={() => router.back()}
            style={styles.close}
          />
          <Pressable
            onPress={share}
            style={({ pressed }) => [
              styles.shareDisc,
              { backgroundColor: theme.key, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Icon name="upload" size={20} color={theme.fg} strokeWidth={2} />
          </Pressable>
        </View>

        <ThemedText type="micro" themeColor="mut" style={styles.footnote}>
          {FOOTNOTE}
        </ThemedText>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: Screen.horizontal, paddingBottom: Spacing.four, gap: 22 },

  // Measured off the reference: avatar→name 28, name→subtitle 10, subtitle→amount 22.
  hero: { alignItems: 'center', paddingTop: 18, paddingBottom: 8 },
  heroName: { marginTop: 28, textAlign: 'center' },
  heroSub: { marginTop: 10, textAlign: 'center' },
  heroAmount: { marginTop: 22, marginBottom: 18 },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: Screen.horizontal,
    paddingTop: Spacing.two,
  },
  close: { flex: 1, minHeight: 56, borderWidth: 0 },
  shareDisc: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },

  footnote: {
    textAlign: 'center',
    paddingHorizontal: Screen.horizontal,
    paddingTop: 16,
    paddingBottom: Screen.bottom,
  },
});
