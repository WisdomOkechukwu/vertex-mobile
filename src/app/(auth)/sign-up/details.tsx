import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonPrimary } from '@/components/ui/button-primary';
import { CircleButton } from '@/components/ui/circle-button';
import { Icon } from '@/components/ui/icon';
import { StepProgressBar } from '@/components/ui/step-progress-bar';
import { TextField } from '@/components/ui/text-field';
import { ThemedText } from '@/components/themed-text';
import { Radius, Screen } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth-store';

/** Four bars, four levels — the reference shows three filled and the word "Strong". */
function passwordStrength(pw: string): { label: string; score: number } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return { label: ['Too weak', 'Weak', 'Okay', 'Strong', 'Very strong'][score], score };
}

/**
 * Sign-up step 1, from `design/signup/page-1.png`: the back button and the four-segment progress bar
 * share a row, with the step caption beneath the bar; then the headline, the four fields, the
 * password strength meter, the consent row, and the CTA in normal flow (not pinned).
 */
export default function SignUpDetailsScreen() {
  const theme = useTheme();
  const signUpDetails = useAuthStore((s) => s.signUpDetails);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Left unticked deliberately. The design mock shows this pre-ticked, but pre-consenting someone to
  // terms and identity checks isn't something to ship — the user ticks it themselves.
  const [agreed, setAgreed] = useState(false);

  const strength = useMemo(() => passwordStrength(password), [password]);
  const canContinue =
    fullName.trim().length > 2 && phone.length >= 10 && email.includes('@') && strength.score >= 3 && agreed;

  const onContinue = async () => {
    if (!canContinue) return;
    try {
      await signUpDetails({ fullName, phone: `+234${phone}`, email, password });
      router.push('/(auth)/sign-up/email-verify');
    } catch {
      // Surfaced below via auth-store.error.
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <CircleButton icon="chevronLeft" onPress={() => router.back()} />
            <View style={styles.progressCol}>
              <StepProgressBar step={1} total={4} />
              <ThemedText type="fieldLabel" themeColor="mut" style={styles.stepCaption}>
                Step 1 of 4 · your details
              </ThemedText>
            </View>
          </View>

          <ThemedText type="screenTitle" style={styles.title}>
            Let&apos;s open your account
          </ThemedText>
          <ThemedText type="bodyLg" themeColor="mut" style={styles.subtitle}>
            Takes about two minutes. You&apos;ll need your BVN.
          </ThemedText>

          <View style={styles.form}>
            <TextField
              label="Full name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="As it appears on your BVN"
              autoCapitalize="words"
            />
            <TextField
              label="Mobile number"
              value={phone}
              onChangeText={(v) => setPhone(v.replace(/[^0-9]/g, ''))}
              placeholder="801 234 5678"
              prefix="+234"
              keyboardType="phone-pad"
            />
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@mail.com"
              keyboardType="email-address"
            />

            <View>
              <TextField
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="At least 8 characters"
                secureTextEntry
              />
              {password.length > 0 && (
                <View style={styles.strengthRow}>
                  <View style={styles.strengthBars}>
                    {[0, 1, 2, 3].map((i) => (
                      <View
                        key={i}
                        style={[
                          styles.strengthBar,
                          { backgroundColor: i < strength.score ? theme.accent : theme.key },
                        ]}
                      />
                    ))}
                  </View>
                  <ThemedText type="fieldLabel" themeColor="mut">
                    {strength.label}
                  </ThemedText>
                </View>
              )}
            </View>

            <Pressable style={styles.termsRow} onPress={() => setAgreed((a) => !a)}>
              <View
                style={[
                  styles.checkbox,
                  { backgroundColor: agreed ? theme.accent : theme.key },
                ]}
              >
                {agreed && <Icon name="check" size={13} color={theme.onAccent} strokeWidth={3.4} />}
              </View>
              <ThemedText type="label" themeColor="mut" style={styles.termsText}>
                I agree to the Vertex terms and consent to identity checks under CBN rules.
              </ThemedText>
            </Pressable>

            {error && (
              <ThemedText type="body" themeColor="neg">
                {error}
              </ThemedText>
            )}
          </View>

          <ButtonPrimary
            label="Continue"
            onPress={onContinue}
            disabled={!canContinue}
            loading={loading}
            style={styles.cta}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: Screen.horizontalAuth, paddingTop: Screen.top, paddingBottom: 30 },

  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
  progressCol: { flex: 1 },
  stepCaption: { marginTop: 9 },

  title: { marginBottom: 8 },
  subtitle: { marginBottom: 24 },

  form: { gap: Screen.fieldGap },
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  strengthBars: { flexDirection: 'row', gap: 4, flex: 1 },
  strengthBar: { flex: 1, height: 4, borderRadius: Radius.pill },

  termsRow: { flexDirection: 'row', gap: 11, alignItems: 'flex-start', marginTop: 2 },
  checkbox: { width: 22, height: 22, borderRadius: 7, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  termsText: { flex: 1 },

  cta: { marginTop: 26 },
});
