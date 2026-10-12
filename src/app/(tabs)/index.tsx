import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AlertBanner } from '@/components/ui/alert-banner';
import { Avatar } from '@/components/ui/avatar';
import { CircleButton } from '@/components/ui/circle-button';
import { Icon, type IconProps } from '@/components/ui/icon';
import { SectionHeading } from '@/components/ui/section-heading';
import { Skeleton, SkeletonRow } from '@/components/ui/skeleton';
import { Stagger } from '@/components/ui/reveal';
import { TransactionRow } from '@/components/ui/transaction-row';
import { WalletCard } from '@/components/ui/wallet-card';
import { ThemedText } from '@/components/themed-text';
import { UserAvatarTint } from '@/constants/colors';
import { Radius, Screen } from '@/constants/theme';
import { useShadows } from '@/hooks/use-shadows';
import { useTheme } from '@/hooks/use-theme';
import { isLoading } from '@/lib/api-status';
import { formatMoney } from '@/lib/format';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationsStore } from '@/stores/notifications-store';
import { useTransactionsStore } from '@/stores/transactions-store';
import { useWalletStore } from '@/stores/wallet-store';

/**
 * Home's four quick actions, read off `design/home/default.png`. "Request" is the payment-link
 * flow (its glyph is the link icon) and "Move" is the Vertex-to-Vertex transfer.
 */
const ACTIONS: { label: string; icon: IconProps['name']; href: any }[] = [
  { label: 'Send', icon: 'arrowUpRight', href: '/(money)/send' },
  { label: 'Add money', icon: 'arrowDownLeft', href: '/(money)/deposit' },
  { label: 'Move', icon: 'plus', href: '/(money)/internal-transfer/recipient' },
  { label: 'Request', icon: 'link', href: '/links' },
];

export default function HomeScreen() {
  const theme = useTheme();
  const shadows = useShadows();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { assets, status: walletStatus, fetchAssets } = useWalletStore();
  const { recent, status: txStatus, fetchRecent } = useTransactionsStore();
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const fetchNotifications = useNotificationsStore((s) => s.fetchNotifications);

  const [masked, setMasked] = useState(false);

  useEffect(() => {
    fetchAssets();
    fetchRecent();
    fetchNotifications();
  }, [fetchAssets, fetchRecent, fetchNotifications]);

  const primary = assets.find((a) => a.code === 'NGN');
  const loadingWallet = isLoading(walletStatus);
  const loadingTx = isLoading(txStatus);

  // The banner counts the verification steps still outstanding; the seeded user has email done with
  // BVN/NIN and address to go, which is the "2 verification steps left" state in the reference.
  const stepsLeft = user?.tier === 'Tier 2' ? 0 : 2;

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Screen.bottomWithNav }}
      >
        {/* The hero wash runs top-to-bottom: warm at the crown, through lavender, out to the page
            white by the time the action row ends. Sampling the reference's right gutter shows the
            top band still warm (#f2eef1) — a diagonal gradient would have turned it lavender there. */}
        <LinearGradient
          colors={[theme.wash1, theme.wash2, theme.background]}
          locations={[0, 0.55, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + 18 }]}
        >
          <View style={styles.heroTopRow}>
            <Pressable style={styles.identity} onPress={() => router.push('/profile')}>
              <Avatar label={user?.avatarInitials ?? 'AO'} size={48} tint={UserAvatarTint} />
              <View style={styles.identityText}>
                <ThemedText type="greeting">Hello, {user?.profileName ?? 'there'}</ThemedText>
                <ThemedText type="label" themeColor="mut" style={styles.identitySub}>
                  View your profile
                </ThemedText>
              </View>
            </Pressable>

            <View>
              <CircleButton icon="bell" onPress={() => router.push('/notifications')} />
              {unreadCount > 0 && (
                <View style={[styles.unreadDot, { backgroundColor: theme.accent, borderColor: theme.background }]}>
                  <ThemedText type="nano" style={styles.onAccent}>
                    {unreadCount}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>

          <View style={styles.balanceBlock}>
            {loadingWallet ? (
              <Skeleton width={240} height={44} radius={Radius.crisp} />
            ) : (
              <ThemedText type="balance">
                {masked ? '₦ • • • • • •' : formatMoney(primary?.bal ?? 0, 'NGN')}
              </ThemedText>
            )}
            <Pressable style={styles.balanceLabelRow} onPress={() => setMasked((m) => !m)} hitSlop={8}>
              <ThemedText type="bodyLg" themeColor="mut">
                Account balance
              </ThemedText>
              <Icon name={masked ? 'eyeOff' : 'eye'} size={15} color={theme.mut} strokeWidth={1.7} />
            </Pressable>
          </View>

          <View style={styles.actionsRow}>
            {ACTIONS.map((action) => (
              <Pressable key={action.label} style={styles.action} onPress={() => router.push(action.href)}>
                <View style={[styles.actionCircle, { backgroundColor: theme.chip }, shadows.raised]}>
                  <Icon name={action.icon} size={21} color={theme.fg} strokeWidth={2} />
                </View>
                <ThemedText type="labelStrong">{action.label}</ThemedText>
              </Pressable>
            ))}
          </View>
        </LinearGradient>

        {stepsLeft > 0 && (
          <Stagger index={1} style={styles.bannerWrap}>
            <AlertBanner
              title={`${stepsLeft} verification steps left`}
              body="Finish them to raise your daily limit to ₦5,000,000"
              onPress={() => router.push('/security')}
            />
          </Stagger>
        )}

        <Stagger index={2} style={styles.section}>
          <SectionHeading title="Wallets" actionLabel="See all" onAction={() => router.push('/currencies')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.walletRow}>
            {loadingWallet
              ? [0, 1, 2].map((i) => <Skeleton key={i} width={132} height={112} radius={Radius.tile} />)
              : assets
                  .filter((a) => a.bal > 0)
                  .map((asset) => (
                    <WalletCard
                      key={asset.code}
                      asset={asset}
                      onPress={() => router.push(`/currencies/${asset.code}`)}
                    />
                  ))}
          </ScrollView>
        </Stagger>

        <Stagger index={3} style={styles.section}>
          <SectionHeading
            title="Transactions"
            actionLabel="See all"
            onAction={() => router.push('/transactions')}
          />
          <View style={styles.txList}>
            {loadingTx
              ? [0, 1, 2].map((i) => (
                  <View key={i} style={[styles.txSkeleton, { backgroundColor: theme.card }]}>
                    <SkeletonRow />
                  </View>
                ))
              : recent.map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} onPress={() => router.push(`/transactions/${tx.id}`)} />
                ))}
          </View>
        </Stagger>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  hero: { paddingHorizontal: Screen.horizontal, paddingBottom: 30 },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 22 },
  identity: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 13 },
  identityText: { flex: 1 },
  identitySub: { marginTop: 2 },
  unreadDot: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  /** Ink on an accent fill — the same value in both schemes, hence a static style. */
  onAccent: { color: '#ffffff' },

  balanceBlock: { alignItems: 'center' },
  balanceLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 9 },

  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 22 },
  action: { flex: 1, alignItems: 'center', gap: 10 },
  actionCircle: {
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bannerWrap: { paddingHorizontal: Screen.horizontal, marginTop: 18 },
  section: { paddingHorizontal: Screen.horizontal, marginTop: 19 },
  walletRow: { gap: 10, paddingBottom: 4, paddingRight: Screen.horizontal },
  txList: { gap: Screen.rowGap },
  txSkeleton: { borderRadius: Radius.card, padding: 17 },
});
