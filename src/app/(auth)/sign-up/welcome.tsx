import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonPrimary } from '@/components/ui/button-primary';
import { Icon, type IconProps } from '@/components/ui/icon';
import { InfoBanner } from '@/components/ui/info-banner';
import { PopIn } from '@/components/ui/reveal';
import { ThemedText } from '@/components/themed-text';
import { Radius, Screen, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth-store';

const FEATURES: { icon: IconProps['name']; label: string }[] = [
  { icon: 'send', label: 'Send and receive money instantly' },
  { icon: 'card', label: 'Create virtual cards for online spending' },
  { icon: 'gift', label: 'Earn cashback on eligible payments' },
];

export default function WelcomeAboardScreen() {
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);

  return (
    <LinearGradient colors={[theme.background, theme.wash1]} style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <View style={styles.content}>
          <PopIn style={[styles.badge, { backgroundColor: theme.accent }]}>
            <Icon name="check" size={28} color={theme.onAccent} strokeWidth={3} />
          </PopIn>
          <ThemedText type="screenTitle" style={{ textAlign: 'center' }}>
            You&apos;re all set, {user?.profileName ?? 'there'}
          </ThemedText>

          <View style={styles.featureList}>
            {FEATURES.map((f) => (
              <View key={f.label} style={styles.featureRow}>
                <View style={[styles.featureIcon, { backgroundColor: theme.card }]}>
                  <Icon name={f.icon} size={18} color={theme.accent} />
                </View>
                <ThemedText type="body" style={{ flex: 1 }}>
                  {f.label}
                </ThemedText>
              </View>
            ))}
          </View>

          <InfoBanner text="Verify your BVN and NIN in Security to raise your daily limit to ₦1,000,000." />
        </View>

        <View style={styles.footer}>
          <ButtonPrimary label="Take me in" onPress={() => router.replace('/(tabs)')} />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.six, gap: Spacing.three },
  badge: { width: 64, height: 64, borderRadius: Radius.veryRound, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: Spacing.one },
  featureList: { gap: Spacing.two, marginTop: Spacing.three },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  featureIcon: { width: 36, height: 36, borderRadius: Radius.crisp, alignItems: 'center', justifyContent: 'center' },
  footer: { paddingHorizontal: Screen.horizontalAuth, paddingBottom: Screen.bottom },
});
