import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { ButtonPrimary } from '@/components/ui/button-primary';
import { CircleButton } from '@/components/ui/circle-button';
import { Icon } from '@/components/ui/icon';
import { TextField } from '@/components/ui/text-field';
import { ThemedText } from '@/components/themed-text';
import { UserAvatarTint } from '@/constants/colors';
import { Radius, Screen } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getLastProfile, getSession } from '@/lib/secure-auth';
import { useAuthStore } from '@/stores/auth-store';
import { COMPLIANCE } from '@/constants/content';

/**
 * The design's Login screen: a `wash2 → bg` vertical wash over the top 40%, a back button, then
 * a returning-user greeting (`700 24px/1.2 -.03em`) with the last-sign-in line, two fields, the
 * primary CTA, a Face ID alternative, and the compliance footer card pinned to the bottom.
 */
export default function LoginScreen() {
  const theme = useTheme();
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const biometricEnabled = useAuthStore((s) => s.biometricEnabled);
  const loginWithSession = useAuthStore((s) => s.loginWithSession);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [returning, setReturning] = useState<{ name: string; initials: string } | null>(null);
  const [bioAvailable, setBioAvailable] = useState(false);

  useEffect(() => {
    getLastProfile().then((p) =>
      setReturning(p ? { name: p.profileName, initials: p.avatarInitials } : null)
    );
    Promise.all([LocalAuthentication.hasHardwareAsync(), LocalAuthentication.isEnrolledAsync()]).then(
      ([hasHardware, isEnrolled]) => setBioAvailable(hasHardware && isEnrolled)
    );
  }, []);

  const onLogin = async () => {
    try {
      await login(identifier, password);
      router.replace('/(tabs)');
    } catch {
      // Surfaced below via auth-store.error.
    }
  };

  const onBiometric = async () => {
    const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Unlock Vertex' });
    if (!result.success) return;
    const session = await getSession();
    if (!session) return;
    await loginWithSession(session);
    router.replace('/(tabs)');
  };

  return (
    <LinearGradient colors={[theme.wash2, theme.background]} locations={[0, 0.4]} style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <View style={styles.content}>
          <CircleButton icon="chevronLeft" onPress={() => router.back()} />

          <View style={styles.greetRow}>
            <Avatar label={returning?.initials ?? 'AO'} size={48} tint={UserAvatarTint} />
            <View style={styles.greetText}>
              <ThemedText type="stepHeader">Hello, {returning?.name ?? 'there'}</ThemedText>
              <ThemedText type="label" themeColor="mut" style={styles.greetSub}>
                {returning ? 'Last signed in 16 Aug, 09:14 · Lagos' : 'Sign in to continue'}
              </ThemedText>
            </View>
          </View>

          <View style={styles.form}>
            <TextField
              label="Mobile number"
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="801 234 5678"
              prefix="+234"
              keyboardType="phone-pad"
            />
            <TextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Your password"
              secureTextEntry
            />
            {error && (
              <ThemedText type="body" themeColor="neg">
                {error}
              </ThemedText>
            )}
          </View>

          <ButtonPrimary
            label="Log in"
            onPress={onLogin}
            loading={loading}
            disabled={!identifier || !password}
            style={styles.cta}
          />

          {bioAvailable && biometricEnabled && (
            <Pressable style={[styles.bioBtn, { backgroundColor: theme.key }]} onPress={onBiometric}>
              <Icon name="face" size={20} color={theme.accent} strokeWidth={1.8} />
              <ThemedText type="buttonGhost">Use Face ID instead</ThemedText>
            </Pressable>
          )}

          <View style={styles.spacer} />

          <View style={[styles.complianceCard, { backgroundColor: theme.card }]}>
            <Icon name="shield2" size={15} color={theme.accent} strokeWidth={1.8} />
            <ThemedText type="micro" themeColor="mut">
              {COMPLIANCE.short}
            </ThemedText>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: Screen.horizontalAuth,
    paddingTop: Screen.top,
    paddingBottom: Screen.bottom,
  },
  greetRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 26 },
  greetText: { flex: 1 },
  greetSub: { marginTop: 3 },
  form: { gap: Screen.fieldGap, marginTop: 30 },
  cta: { marginTop: 18 },
  bioBtn: {
    minHeight: 50,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 16,
  },
  spacer: { flex: 1 },
  complianceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: Radius.field,
    padding: 14,
  },
});
