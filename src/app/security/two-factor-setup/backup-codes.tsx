import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonGhost } from '@/components/ui/button-ghost';
import { ButtonPrimary } from '@/components/ui/button-primary';
import { Icon } from '@/components/ui/icon';
import { PopIn } from '@/components/ui/reveal';
import { StepHeaderBar } from '@/components/ui/step-header-bar';
import { ThemedText } from '@/components/themed-text';
import { useToast } from '@/components/ui/toast';
import { Radius, Screen, washTint } from '@/constants/theme';
import { useResolvedScheme, useTheme } from '@/hooks/use-theme';
import { useSecurityStore } from '@/stores/security-store';

/**
 * Step 4 of 4, `design/security/2fa-4.png`.
 *
 * The badge is an accent-tinted rounded square with an accent check, not the green `pos` disc the
 * other success screens use: this is the end of a setup wizard, not a settled transaction, and the
 * reference keeps it in the brand colour. The codes are individual `key` pills in two columns rather
 * than one panel, and they come from `confirmTwoFactor` — the screen used to render a hardcoded set
 * and throw the issued ones away.
 */
export default function BackupCodesScreen() {
  const theme = useTheme();
  const scheme = useResolvedScheme();
  const { show } = useToast();
  const codes = useSecurityStore((s) => s.backupCodes);

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <StepHeaderBar step={4} total={4} label="Backup codes" />
        <View style={styles.content}>
          <PopIn style={[styles.badge, { backgroundColor: washTint(theme.accent, scheme, 'firm') }]}>
            <Icon name="check" size={28} color={theme.accent} strokeWidth={2.6} />
          </PopIn>

          <View style={styles.head}>
            <ThemedText type="stepHeader">Two-factor is on</ThemedText>
            <ThemedText type="bodyLg" themeColor="mut" style={styles.blurb}>
              Save these backup codes somewhere safe. Each one signs you in once if you lose your
              phone.
            </ThemedText>
          </View>

          {/* Codes only exist for the run of the wizard that issued them. Deep-linking here shows
              this rather than an empty grid and a dead button. */}
          {codes.length === 0 ? (
            <ThemedText type="body" themeColor="mut" style={styles.blurb}>
              Your codes are only shown once, right after setup. Turn two-factor off and on again from
              the You tab to issue a fresh set.
            </ThemedText>
          ) : (
            <>
              <View style={styles.grid}>
                {codes.map((c) => (
                  <View key={c} style={[styles.code, { backgroundColor: theme.key }]}>
                    <ThemedText type="codeLabel">{c}</ThemedText>
                  </View>
                ))}
              </View>

              <ButtonGhost
                variant="fill"
                label="Download codes"
                leftIcon="download"
                onPress={async () => {
                  // No filesystem write is wired; the clipboard is the honest "download" here.
                  await Clipboard.setStringAsync(codes.join('\n'));
                  show('Backup codes copied', 'success');
                }}
              />
            </>
          )}
        </View>
        <View style={styles.footer}>
          <ButtonPrimary label="Done" onPress={() => router.replace('/profile')} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Screen.horizontal, paddingTop: 26, gap: 20 },
  badge: { width: 66, height: 66, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },

  head: { gap: 8 },
  blurb: { lineHeight: 21 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  code: {
    // Two per row: half the width less half the gap.
    width: '48%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 17,
    borderRadius: Radius.tile,
  },

  footer: { paddingHorizontal: Screen.horizontal, paddingBottom: Screen.bottom },
});
