import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, UserAvatarTint } from '@/constants/theme';

/** The four quick actions on Home, in order. */
const ACTIONS: { icon: 'arrowUpRight' | 'arrowDownLeft' | 'plus' | 'link'; label: string }[] = [
  { icon: 'arrowUpRight', label: 'Send' },
  { icon: 'arrowDownLeft', label: 'Add' },
  { icon: 'plus', label: 'Move' },
  { icon: 'link', label: 'Request' },
];

const WALLETS = [
  { code: 'NGN', sym: '₦', tint: '#e2f4e6', balance: '₦482,650.00' },
  { code: 'USD', sym: '$', tint: '#dfe7ff', balance: '$168.40' },
];

/**
 * A miniature of Home, for the Appearance screen.
 *
 * The whole point is to render a scheme *other* than the one this component sits in, so it reads
 * `Colors[scheme]` directly instead of `useTheme()`. That is the only sanctioned bypass of the hook in
 * the app — everywhere else it would simply be a bug.
 *
 * Sizes are explicit rather than a `transform: scale` on a real copy of the screen: scaling would blur
 * the type at this size, and a real copy would drag the whole store layer into a preview.
 */
export function HomeThemePreview({ scheme }: { scheme: 'light' | 'dark' }) {
  const p = Colors[scheme];

  return (
    <View style={[styles.frame, { backgroundColor: p.background, borderColor: p.line }]}>
      {/* Hero — the vertical three-stop wash that bleeds to the screen edges on the real screen. */}
      <LinearGradient
        colors={[p.wash1, p.wash2, p.background]}
        locations={[0, 0.55, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.topRow}>
          <View style={[styles.avatar, { backgroundColor: UserAvatarTint }]}>
            <ThemedText type="nano" style={{ color: p.onPastel }}>
              AO
            </ThemedText>
          </View>
          <View style={styles.identity}>
            <ThemedText type="microStrong" style={{ color: p.fg }}>
              Hello, Adaeze
            </ThemedText>
            <ThemedText type="nano" style={{ color: p.mut }}>
              View your profile
            </ThemedText>
          </View>
          <View style={[styles.bell, { backgroundColor: p.card }]}>
            <Icon name="bell" size={11} color={p.fg} strokeWidth={2.2} />
          </View>
        </View>

        <View style={styles.balanceBlock}>
          <ThemedText type="cardTitle" style={{ color: p.fg }}>
            ₦482,650.00
          </ThemedText>
          <ThemedText type="nano" style={{ color: p.mut }}>
            Account balance
          </ThemedText>
        </View>

        <View style={styles.actionsRow}>
          {ACTIONS.map((a) => (
            <View key={a.label} style={styles.action}>
              <View style={[styles.actionCircle, { backgroundColor: p.chip }]}>
                <Icon name={a.icon} size={12} color={p.fg} strokeWidth={2} />
              </View>
              <ThemedText type="nano" style={{ color: p.fg }}>
                {a.label}
              </ThemedText>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.walletRow}>
          {WALLETS.map((w) => (
            <View key={w.code} style={[styles.wallet, { backgroundColor: p.card }]}>
              <View style={styles.walletTop}>
                <View style={[styles.walletBadge, { backgroundColor: w.tint }]}>
                  <ThemedText type="nano" style={{ color: p.onPastel }}>
                    {w.sym}
                  </ThemedText>
                </View>
                <ThemedText type="nano" style={{ color: p.fg }}>
                  {w.code}
                </ThemedText>
              </View>
              <ThemedText type="microStrong" numberOfLines={1} style={{ color: p.fg }}>
                {w.balance}
              </ThemedText>
            </View>
          ))}
        </View>

        <View style={[styles.txRow, { backgroundColor: p.card }]}>
          <View style={[styles.txAvatar, { backgroundColor: '#ffe3d8' }]}>
            <ThemedText type="nano" style={{ color: p.onPastel }}>
              AK
            </ThemedText>
          </View>
          <View style={styles.txText}>
            <ThemedText type="nano" style={{ color: p.fg }}>
              Adrian Keller
            </ThemedText>
            <ThemedText type="nano" style={{ color: p.mut }}>
              Vertex transfer
            </ThemedText>
          </View>
          <ThemedText type="nano" style={{ color: p.neg }}>
            −₦399.00
          </ThemedText>
        </View>
      </View>

      {/* The floating nav, with Home active — the accent pill is most of what reads as "the app". */}
      <View style={[styles.nav, { backgroundColor: p.navbg }]}>
        <View style={[styles.navActive, { backgroundColor: p.accent }]}>
          <Icon name="home" size={11} color={p.onAccent} strokeWidth={2.3} />
          <ThemedText type="nano" style={{ color: p.onAccent }}>
            Home
          </ThemedText>
        </View>
        {(['card', 'bills', 'user'] as const).map((icon) => (
          <View key={icon} style={styles.navItem}>
            <Icon name={icon} size={11} color={p.mut} strokeWidth={1.9} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: Radius.cardLg,
    borderWidth: 1,
    overflow: 'hidden',
    paddingBottom: 14,
    minHeight: 236,
  },

  hero: { paddingHorizontal: 12, paddingTop: 14, paddingBottom: 12 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 11 },
  avatar: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  identity: { flex: 1, gap: 1 },
  bell: { width: 21, height: 21, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },

  balanceBlock: { alignItems: 'center', gap: 2 },

  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 4, marginTop: 12 },
  action: { flex: 1, alignItems: 'center', gap: 5 },
  actionCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },

  body: { paddingHorizontal: 12, gap: 7, marginTop: 4 },
  walletRow: { flexDirection: 'row', gap: 6 },
  wallet: { flex: 1, borderRadius: Radius.crisp, paddingVertical: 8, paddingHorizontal: 9, gap: 6 },
  walletTop: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  walletBadge: { width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },

  txRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: Radius.crisp, padding: 9 },
  txAvatar: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  txText: { flex: 1, gap: 1 },

  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 3,
    padding: 4,
    borderRadius: Radius.pill,
    marginTop: 10,
  },
  navActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  navItem: { paddingHorizontal: 8, paddingVertical: 5 },
});
