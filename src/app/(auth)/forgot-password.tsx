import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonPrimary } from '@/components/ui/button-primary';
import { NumericKeypad } from '@/components/ui/numeric-keypad';
import { OtpBoxEntry } from '@/components/ui/otp-box-entry';
import { TextField } from '@/components/ui/text-field';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Screen, Spacing } from '@/constants/theme';
import { useNumericKeypad } from '@/lib/use-numeric-keypad';

// Reuses the OTP + change-password UI language; no forgot-password screen existed in the design
// export to extract exactly, so this follows the same visual pattern as the rest of the auth flow.
type Step = 'email' | 'otp' | 'reset';

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { value: otp, append, backspace } = useNumericKeypad(6, () => setStep('reset'));

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex}>
        <View style={styles.content}>
          {step === 'email' && (
            <>
              <ThemedText type="stepHeader">Reset your password</ThemedText>
              <ThemedText type="body" themeColor="mut">
                Enter the email on your Vertex account and we&apos;ll send you a code.
              </ThemedText>
              <TextField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="you@example.com" />
              <ButtonPrimary label="Send code" onPress={() => setStep('otp')} disabled={!email.includes('@')} />
            </>
          )}

          {step === 'otp' && (
            <>
              <ThemedText type="stepHeader">Enter the code</ThemedText>
              <ThemedText type="body" themeColor="mut">
                We sent a 6-digit code to {email}
              </ThemedText>
              <View style={styles.otpWrap}>
                <OtpBoxEntry value={otp} />
              </View>
            </>
          )}

          {step === 'reset' && (
            <>
              <ThemedText type="stepHeader">Set a new password</ThemedText>
              <TextField label="New password" value={password} onChangeText={setPassword} secureTextEntry placeholder="At least 8 characters" />
              <ButtonPrimary
                label="Update password"
                disabled={password.length < 8}
                onPress={() => router.replace('/(auth)/login')}
              />
            </>
          )}
        </View>
        {step === 'otp' && (
          <View style={styles.keypadWrap}>
            <NumericKeypad onDigit={append} onBackspace={backspace} />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: Screen.horizontalAuth, paddingTop: Spacing.four, gap: Spacing.two },
  otpWrap: { marginVertical: Spacing.three },
  keypadWrap: { marginTop: 'auto', paddingBottom: Spacing.two },
});
