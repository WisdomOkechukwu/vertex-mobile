import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NumericKeypad } from '@/components/ui/numeric-keypad';
import { OtpBoxEntry } from '@/components/ui/otp-box-entry';
import { StepProgressBar } from '@/components/ui/step-progress-bar';
import { ThemedText } from '@/components/themed-text';
import { Screen, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCountdown } from '@/lib/use-countdown';
import { useNumericKeypad } from '@/lib/use-numeric-keypad';
import { useAuthStore } from '@/stores/auth-store';

export default function PhoneOtpScreen() {
  const theme = useTheme();
  const verifyPhoneOtp = useAuthStore((s) => s.verifyPhoneOtp);
  const resendOtp = useAuthStore((s) => s.resendOtp);
  const error = useAuthStore((s) => s.error);
  const pendingPhone = useAuthStore((s) => s.pendingPhone);
  const { remaining, restart, isDone } = useCountdown(42);

  const { value, append, backspace } = useNumericKeypad(6, async (code) => {
    try {
      await verifyPhoneOtp(code);
      router.push('/(auth)/sign-up/welcome');
    } catch {
      // error surfaced via auth-store.error below
    }
  });

  useEffect(() => {
    if (error) {
      // allow retry by clearing after a short delay of showing the message
    }
  }, [error]);

  const maskedPhone = pendingPhone ? `${pendingPhone.slice(0, -4)}••••` : 'your phone';

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex}>
        <View style={styles.content}>
          <StepProgressBar step={3} total={4} />
          <ThemedText type="stepHeader" style={{ marginTop: Spacing.three }}>
            Verify your number
          </ThemedText>
          <ThemedText type="body" themeColor="mut">
            We sent a 6-digit code to {maskedPhone}
          </ThemedText>

          <View style={styles.otpWrap}>
            <OtpBoxEntry value={value} error={!!error} />
          </View>
          {error && (
            <ThemedText type="label" themeColor="neg" style={{ textAlign: 'center' }}>
              {error}
            </ThemedText>
          )}

          <Pressable
            disabled={!isDone}
            onPress={() => {
              resendOtp();
              restart();
            }}
          >
            <ThemedText
              type="label"
              themeColor={isDone ? 'accent' : 'mut'}
              style={{ textAlign: 'center' }}
            >
              {isDone ? 'Resend code' : `Resend code in ${remaining}s`}
            </ThemedText>
          </Pressable>
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
  content: { paddingHorizontal: Screen.horizontalAuth, paddingTop: Spacing.two, gap: Spacing.three },
  otpWrap: { marginVertical: Spacing.three },
  keypadWrap: { marginTop: 'auto', paddingBottom: Spacing.two },
});
