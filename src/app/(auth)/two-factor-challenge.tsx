import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NumericKeypad } from '@/components/ui/numeric-keypad';
import { OtpBoxEntry } from '@/components/ui/otp-box-entry';
import { Spinner } from '@/components/ui/spinner';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Screen, Spacing } from '@/constants/theme';
import { useCountdown } from '@/lib/use-countdown';
import { useNumericKeypad } from '@/lib/use-numeric-keypad';
import { useAuthStore } from '@/stores/auth-store';

export default function TwoFactorChallengeScreen() {
  const theme = useTheme();
  const verifyTwoFactorCode = useAuthStore((s) => s.verifyTwoFactorCode);
  const error = useAuthStore((s) => s.error);
  const { remaining } = useCountdown(30);

  const { value, append, backspace } = useNumericKeypad(6, async (code) => {
    try {
      await verifyTwoFactorCode(code);
      router.replace('/(tabs)');
    } catch {
      // surfaced via error below
    }
  });

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex}>
        <View style={styles.content}>
          <ThemedText type="stepHeader">Two-factor authentication</ThemedText>
          <ThemedText type="body" themeColor="mut">
            Enter the 6-digit code from your authenticator app
          </ThemedText>

          <View style={styles.otpRow}>
            <OtpBoxEntry value={value} error={!!error} />
            <View style={styles.ring}>
              <Spinner size={22} />
              <ThemedText type="micro" themeColor="mut">
                {remaining}s
              </ThemedText>
            </View>
          </View>
          {error && (
            <ThemedText type="label" themeColor="neg" style={{ textAlign: 'center' }}>
              {error}
            </ThemedText>
          )}

          <View style={styles.links}>
            <Pressable>
              <ThemedText type="label" themeColor="accent" style={{ textAlign: 'center' }}>
                Use a backup code
              </ThemedText>
            </Pressable>
            <Pressable>
              <ThemedText type="label" themeColor="mut" style={{ textAlign: 'center' }}>
                Lost your device?
              </ThemedText>
            </Pressable>
          </View>
        </View>

        <View style={styles.keypadWrap}>
          <NumericKeypad onDigit={append} onBackspace={backspace} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: Screen.horizontalAuth, paddingTop: Spacing.four, gap: Spacing.three },
  otpRow: { alignItems: 'center', gap: Spacing.two, marginVertical: Spacing.three },
  ring: { alignItems: 'center', gap: 4 },
  links: { gap: Spacing.one },
  keypadWrap: { marginTop: 'auto', paddingBottom: Spacing.two },
});
