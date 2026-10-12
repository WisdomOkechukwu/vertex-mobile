import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CircleButton } from '@/components/ui/circle-button';
import { Icon } from '@/components/ui/icon';
import { NumericKeypad } from '@/components/ui/numeric-keypad';
import { PinDotEntry } from '@/components/ui/pin-dot-entry';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { isLoading } from '@/lib/api-status';
import { useNumericKeypad } from '@/lib/use-numeric-keypad';
import { useAuthStore } from '@/stores/auth-store';
import { useSecurityStore } from '@/stores/security-store';

/**
 * `design/security/revoke-session-a.png`: an accent shield-alert tile, the question, then the device
 * named in the body and "Enter your PIN to confirm" above the dots. No header title and no warning
 * banner — the reference makes the screen itself the warning, and naming the device is the whole
 * point, since the profile tab lists three and you only mean one of them.
 */
export default function RevokeDeviceScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const verifyTransactionPin = useAuthStore((s) => s.verifyTransactionPin);
  const devices = useSecurityStore((s) => s.devices);
  const status = useSecurityStore((s) => s.status);
  const fetchDevices = useSecurityStore((s) => s.fetchDevices);
  const revokeDevice = useSecurityStore((s) => s.revokeDevice);
  const [revoking, setRevoking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { value, append, backspace, clear } = useNumericKeypad(4);
  // Deep-linking straight here leaves the list empty, and the copy needs the device's name.
  const device = devices.find((d) => d.id === id);
  const loading = devices.length === 0 && isLoading(status);

  useEffect(() => {
    if (devices.length === 0) fetchDevices();
  }, [devices.length, fetchDevices]);

  useEffect(() => {
    if (value.length !== 4) return;
    (async () => {
      const ok = await verifyTransactionPin(value);
      if (!ok) {
        setError('Incorrect PIN. Try again.');
        clear();
        return;
      }
      setRevoking(true);
      const name = device?.name;
      await revokeDevice(id);
      // The store row is gone by the time the next screen renders, so carry the name across.
      router.replace({ pathname: '/security/devices/revoked', params: name ? { name } : {} });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <View style={styles.header}>
          <CircleButton icon="chevronLeft" onPress={() => router.back()} />
        </View>

        <View style={styles.content}>
          <View style={[styles.badge, { backgroundColor: theme.accent }]}>
            <Icon name="shieldX" size={30} color={theme.onAccent} strokeWidth={2.1} />
          </View>

          <ThemedText type="stepHeader" style={styles.centred}>
            Revoke this session
          </ThemedText>
          {loading ? (
            <View style={styles.blurbSkeleton}>
              <Skeleton width="86%" height={15} />
              <Skeleton width="62%" height={15} />
            </View>
          ) : (
            <ThemedText type="bodyLg" themeColor="mut" style={[styles.centred, styles.blurb]}>
              {device?.name ?? 'That device'} will be signed out immediately and asked for full
              verification next time.
            </ThemedText>
          )}

          {revoking ? (
            <View style={styles.pinWrap}>
              <Spinner size={22} />
            </View>
          ) : (
            <>
              <ThemedText type="body" themeColor="mut" style={styles.confirmLine}>
                Enter your PIN to confirm
              </ThemedText>
              <PinDotEntry value={value} error={!!error} />
            </>
          )}

          {error && (
            <ThemedText type="body" themeColor="neg" style={styles.centred}>
              {error}
            </ThemedText>
          )}
        </View>

        {!revoking && (
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
  header: { paddingHorizontal: Screen.horizontal, paddingTop: Screen.top },
  content: { alignItems: 'center', paddingHorizontal: Screen.horizontal, paddingTop: 34, gap: 14 },
  badge: { width: 68, height: 68, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  centred: { textAlign: 'center' },
  blurb: { lineHeight: 21 },
  blurbSkeleton: { alignItems: 'center', gap: 7, alignSelf: 'stretch' },
  confirmLine: { textAlign: 'center', marginTop: 8 },
  pinWrap: { alignItems: 'center', marginTop: 26 },
  keypadWrap: { marginTop: 'auto', paddingBottom: Screen.bottom },
});
