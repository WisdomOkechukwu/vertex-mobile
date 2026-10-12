import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonPrimary } from '@/components/ui/button-primary';
import { Icon, type IconProps } from '@/components/ui/icon';
import { StatusPill } from '@/components/ui/status-pill';
import { StepHeaderBar } from '@/components/ui/step-header-bar';
import { ThemedText } from '@/components/themed-text';
import { Radius, Screen } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * The three options on `design/security/2fa-1.png`, with the reference's own subtitles — each one
 * names the trade-off rather than describing the mechanism — and its trailing verdict pill.
 */
const METHODS: {
  key: string;
  label: string;
  sub: string;
  pill: string;
  icon: IconProps['name'];
}[] = [
  {
    key: 'authenticator',
    label: 'Authenticator app',
    sub: 'Google Authenticator, Authy, 1Password. Works with no network.',
    pill: 'Safest',
    icon: 'phone',
  },
  {
    key: 'sms',
    label: 'SMS code',
    sub: 'A 6-digit code to +234 801 *** 5678. Vulnerable to SIM swap.',
    pill: 'Backup',
    icon: 'message',
  },
  {
    key: 'security-key',
    label: 'Security key',
    sub: 'A physical USB or NFC key. Strongest, needs the key on hand.',
    pill: 'Advanced',
    icon: 'key',
  },
];

/**
 * Step 1 of 4, `design/security/2fa-1.png`.
 *
 * The choice is carried forward as a route param. It used to be local state that `pairing` never
 * read, so picking SMS still showed an authenticator QR code — SMS now skips pairing entirely and
 * goes straight to the code step, because there is nothing to pair.
 */
export default function TwoFactorMethodScreen() {
  const theme = useTheme();
  const [method, setMethod] = useState('authenticator');

  const onContinue = () =>
    router.push({
      pathname: method === 'sms' ? '/security/two-factor-setup/confirm' : '/security/two-factor-setup/pairing',
      params: { method },
    });

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <StepHeaderBar step={1} total={4} label="Choose method" />
        <View style={styles.content}>
          <View style={styles.head}>
            <ThemedText type="stepHeader">Add a second step</ThemedText>
            <ThemedText type="bodyLg" themeColor="mut" style={styles.blurb}>
              Even if someone learns your password, they cannot sign in without this.
            </ThemedText>
          </View>

          <View style={styles.rows}>
            {METHODS.map((m) => {
              const active = m.key === method;
              return (
                <Pressable
                  key={m.key}
                  onPress={() => setMethod(m.key)}
                  style={({ pressed }) => [
                    styles.row,
                    {
                      backgroundColor: theme.card,
                      borderColor: active ? theme.accent : 'transparent',
                    },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  {/* The selected method's tile fills with the accent — it is the one element on the
                      row that reads at a glance from across the screen. */}
                  <View style={[styles.tile, { backgroundColor: active ? theme.accent : theme.chip }]}>
                    <Icon
                      name={m.icon}
                      size={20}
                      color={active ? theme.onAccent : theme.accent}
                      strokeWidth={2}
                    />
                  </View>
                  <View style={styles.textCol}>
                    <ThemedText type="cardTitle">{m.label}</ThemedText>
                    <ThemedText type="body" themeColor="mut" style={styles.sub}>
                      {m.sub}
                    </ThemedText>
                  </View>
                  <StatusPill label={m.pill} tone="neutral" />
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={styles.footer}>
          <ButtonPrimary label="Continue" onPress={onContinue} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Screen.horizontal, paddingTop: 26, gap: 24 },
  head: { gap: 8 },
  blurb: { lineHeight: 21 },

  rows: { gap: Screen.rowGap },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: Radius.card,
    borderWidth: 1.5,
  },
  tile: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  textCol: { flex: 1, minWidth: 0 },
  sub: { marginTop: 3, lineHeight: 18.4 },

  footer: { paddingHorizontal: Screen.horizontal, paddingBottom: Screen.bottom },
});
