import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={[styles.flex, styles.center]}>
        <ThemedText type="screenTitle">Not found</ThemedText>
        <Link href="/">
          <ThemedText type="cardTitle" themeColor="accent">Go back home</ThemedText>
        </Link>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', gap: Spacing.two },
});
