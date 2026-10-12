import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { NumericKeypad } from '@/components/ui/numeric-keypad';
import { OtpBoxEntry } from '@/components/ui/otp-box-entry';
import { StepHeaderBar } from '@/components/ui/step-header-bar';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useNumericKeypad } from '@/lib/use-numeric-keypad';
import { useSecurityStore } from '@/stores/security-store';

/**
 * Step 3 of 4, `design/security/2fa-3.png`. The reference states the refresh interval as a fact under
 * the boxes — an accent ring glyph and "Codes refresh every 30 seconds" — rather than counting one
 * down, which is right: the countdown belongs to the authenticator app, not to this screen, and the
 * ticking spinner that used to sit here implied the entry itself was expiring.
 */
export default function TwoFactorConfirmScreen() {
  const theme = useTheme();
  const { method } = useLocalSearchParams<{ method?: string }>();
  const confirmTwoFactor = useSecurityStore((s) => s.confirmTwoFactor);
  const isSms = method === 'sms';

  const { value, append, backspace } = useNumericKeypad(6, async (code) => {
    await confirmTwoFactor(code);
    router.push('/security/two-factor-setup/backup-codes');
  });

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <StepHeaderBar step={3} total={4} label="Confirm code" />
        <View style={styles.content}>
          <View style={styles.head}>
            <ThemedText type="stepHeader">Confirm it works</ThemedText>
            <ThemedText type="bodyLg" themeColor="mut" style={styles.blurb}>
              {isSms
                ? 'Enter the 6-digit code we just texted to +234 801 *** 5678.'
                : 'Enter the 6-digit code your app is showing for Vertex right now.'}
            </ThemedText>
          </View>

          <OtpBoxEntry value={value} />

          <View style={styles.hint}>
            <Icon name="refresh" size={15} color={theme.accent} strokeWidth={2.2} />
            <ThemedText type="body" themeColor="mut">
              {isSms ? 'The code expires after 10 minutes' : 'Codes refresh every 30 seconds'}
            </ThemedText>
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
  content: { paddingHorizontal: Screen.horizontal, paddingTop: 26, gap: 22 },
  head: { gap: 8 },
  blurb: { lineHeight: 21 },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  keypadWrap: { marginTop: 'auto', paddingBottom: Screen.bottom },
});
