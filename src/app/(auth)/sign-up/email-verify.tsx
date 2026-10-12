import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonPrimary } from '@/components/ui/button-primary';
import { Icon } from '@/components/ui/icon';
import { Spinner } from '@/components/ui/spinner';
import { StepProgressBar } from '@/components/ui/step-progress-bar';
import { ThemedText } from '@/components/themed-text';
import { Screen, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth-store';

export default function EmailVerifyScreen() {
  const theme = useTheme();
  const verifyEmail = useAuthStore((s) => s.verifyEmail);
  const resendOtp = useAuthStore((s) => s.resendOtp);
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    verifyEmail().then((ok) => {
      if (mounted) {
        setVerified(ok);
        setChecking(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [verifyEmail]);

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex}>
        <View style={styles.content}>
          <StepProgressBar step={2} total={4} />
          <View style={styles.center}>
            <View style={[styles.iconWrap, { backgroundColor: theme.key }]}>
              {checking ? <Spinner size={28} /> : <Icon name={verified ? 'check' : 'phone'} size={28} color={theme.accent} />}
            </View>
            <ThemedText type="stepHeader" style={{ textAlign: 'center' }}>
              {checking ? 'Confirming your email' : verified ? 'Email confirmed' : 'Check your inbox'}
            </ThemedText>
            <ThemedText type="body" themeColor="mut" style={{ textAlign: 'center' }}>
              {checking
                ? 'Hold on a moment while we confirm your email address.'
                : verified
                  ? 'Your email address has been verified.'
                  : "We sent a confirmation link to your email — tap it, then come back here."}
            </ThemedText>
          </View>

          {!checking && !verified && (
            <View style={styles.linksCol}>
              <Pressable onPress={() => resendOtp()}>
                <ThemedText type="cardTitle" themeColor="accent" style={{ textAlign: 'center' }}>
                  Resend the link
                </ThemedText>
              </Pressable>
              <Pressable onPress={() => router.back()}>
                <ThemedText type="label" themeColor="mut" style={{ textAlign: 'center' }}>
                  Change email address
                </ThemedText>
              </Pressable>
            </View>
          )}
        </View>
        <View style={styles.footer}>
          <ButtonPrimary
            label="Continue"
            disabled={checking}
            onPress={() => router.push('/(auth)/sign-up/phone-otp')}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Screen.horizontalAuth, paddingTop: Spacing.two, gap: Spacing.four },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.two },
  iconWrap: { width: 64, height: 64, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  linksCol: { gap: Spacing.two, marginBottom: Spacing.four },
  footer: { paddingHorizontal: Screen.horizontalAuth, paddingBottom: Screen.bottom },
});
