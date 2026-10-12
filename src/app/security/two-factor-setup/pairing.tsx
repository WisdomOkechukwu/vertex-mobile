import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonPrimary } from '@/components/ui/button-primary';
import { Icon } from '@/components/ui/icon';
import { QrPlaceholder } from '@/components/ui/qr-placeholder';
import { StepHeaderBar } from '@/components/ui/step-header-bar';
import { ThemedText } from '@/components/themed-text';
import { useToast } from '@/components/ui/toast';
import { Radius, Screen } from '@/constants/theme';
import { useShadows } from '@/hooks/use-shadows';
import { useTheme } from '@/hooks/use-theme';
import { useSecurityStore } from '@/stores/security-store';

/**
 * Step 2 of 4, `design/security/2fa-2.png`: the QR on a raised white panel, the same secret offered
 * as text under an "Or enter this key manually" label with an accent Copy action, and the warning as
 * a shield card rather than a red line of small print.
 */
export default function TwoFactorPairingScreen() {
  const theme = useTheme();
  const shadows = useShadows();
  const { show } = useToast();
  const { method } = useLocalSearchParams<{ method?: string }>();
  const setupTwoFactor = useSecurityStore((s) => s.setupTwoFactor);
  const [secret, setSecret] = useState('');

  useEffect(() => {
    setupTwoFactor().then((r) => setSecret(r.secret));
  }, [setupTwoFactor]);

  const onCopy = async () => {
    await Clipboard.setStringAsync(secret);
    show('Secret key copied', 'success');
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <StepHeaderBar step={2} total={4} label="Pair your app" />
        <View style={styles.content}>
          <View style={styles.head}>
            <ThemedText type="stepHeader">Scan this code</ThemedText>
            <ThemedText type="bodyLg" themeColor="mut" style={styles.blurb}>
              Open your authenticator app, add an account, and scan.
            </ThemedText>
          </View>

          {/* The reference sets the QR on its own raised white panel — a scanner needs the quiet zone
              regardless of the app's theme, which is why `QrPlaceholder` does not flip either. */}
          <View style={styles.qrWrap}>
            <View style={[styles.qrPanel, shadows.raised]}>
              <QrPlaceholder size={160} />
            </View>
          </View>

          <View style={styles.block}>
            <ThemedText type="fieldLabel" themeColor="mut">
              Or enter this key manually
            </ThemedText>
            <View style={[styles.secretRow, { backgroundColor: theme.key }]}>
              <ThemedText type="codeLabel" style={styles.secret} numberOfLines={1}>
                {secret || '••••'}
              </ThemedText>
              <Pressable onPress={onCopy} hitSlop={8} disabled={!secret}>
                <ThemedText type="buttonGhost" themeColor="accent">
                  Copy
                </ThemedText>
              </Pressable>
            </View>
          </View>

          <View style={[styles.note, { backgroundColor: theme.card }]}>
            <Icon name="shield2" size={16} color={theme.accent} strokeWidth={2} />
            <ThemedText type="body" themeColor="mut" style={styles.noteText}>
              Anyone with this key can generate your codes. Never share it or screenshot it into a
              chat.
            </ThemedText>
          </View>
        </View>
        <View style={styles.footer}>
          <ButtonPrimary
            label="I have scanned it"
            disabled={!secret}
            onPress={() =>
              router.push({ pathname: '/security/two-factor-setup/confirm', params: { method: method ?? 'authenticator' } })
            }
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Screen.horizontal, paddingTop: 26, gap: 22 },
  head: { gap: 8 },
  blurb: { lineHeight: 21 },

  qrWrap: { alignItems: 'center' },
  qrPanel: { backgroundColor: '#ffffff', borderRadius: Radius.veryRound, padding: 20 },

  block: { gap: 8 },
  secretRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 62,
    paddingHorizontal: 18,
    borderRadius: Radius.tile,
  },
  secret: { flex: 1, minWidth: 0 },

  note: { flexDirection: 'row', gap: 10, padding: 16, borderRadius: Radius.rounded, alignItems: 'flex-start' },
  noteText: { flex: 1, lineHeight: 18.4 },

  footer: { paddingHorizontal: Screen.horizontal, paddingBottom: Screen.bottom },
});
