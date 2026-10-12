import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonPrimary } from '@/components/ui/button-primary';
import { Icon } from '@/components/ui/icon';
import { ScreenHeader } from '@/components/ui/screen-header';
import { TextField } from '@/components/ui/text-field';
import { ThemedText } from '@/components/themed-text';
import { Screen, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSecurityStore } from '@/stores/security-store';

const RULES = [
  { key: 'length', label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { key: 'case', label: 'Upper and lower case letters', test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { key: 'number', label: 'At least one number', test: (v: string) => /[0-9]/.test(v) },
];

export default function ChangePasswordScreen() {
  const theme = useTheme();
  const changePassword = useSecurityStore((s) => s.changePassword);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const passes = useMemo(() => RULES.map((r) => ({ ...r, ok: r.test(next) })), [next]);
  const allPass = passes.every((r) => r.ok);
  const canSubmit = current.length > 0 && allPass && next === confirm;

  const onSubmit = async () => {
    setSaving(true);
    try {
      await changePassword(current, next);
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex}>
        <ScreenHeader title="Change password" />
        <View style={styles.content}>
          <TextField label="Current password" value={current} onChangeText={setCurrent} secureTextEntry />
          <TextField label="New password" value={next} onChangeText={setNext} secureTextEntry />
          <TextField label="Confirm new password" value={confirm} onChangeText={setConfirm} secureTextEntry error={confirm && next !== confirm ? 'Passwords do not match' : undefined} />

          <View style={styles.rules}>
            {passes.map((r) => (
              <View key={r.key} style={styles.ruleRow}>
                <Icon name={r.ok ? 'check' : 'close'} size={14} color={r.ok ? theme.pos : theme.mut} />
                <ThemedText type="label" themeColor={r.ok ? 'pos' : 'mut'}>{r.label}</ThemedText>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.footer}>
          <ButtonPrimary label="Update password" onPress={onSubmit} loading={saving} disabled={!canSubmit} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Screen.horizontal, gap: Spacing.two },
  rules: { gap: 6, marginTop: Spacing.one },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footer: { paddingHorizontal: Screen.horizontal, paddingBottom: Screen.bottom },
});
