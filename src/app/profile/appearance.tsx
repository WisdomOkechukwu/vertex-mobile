import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeThemePreview } from '@/components/marketing/home-theme-preview';
import { Icon } from '@/components/ui/icon';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ThemedText } from '@/components/themed-text';
import { THEME_CHOICES } from '@/constants/content';
import { Radius, Screen } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useResolvedScheme, useTheme } from '@/hooks/use-theme';
import type { ThemePreference } from '@/lib/preferences';
import { useThemeStore } from '@/stores/theme-store';

/**
 * Appearance. Replaces the picker sheet the "You" tab used to open for this: a theme is a change you
 * want to see before you commit to it, and a sheet covers the screen it is changing.
 *
 * Nothing here touches how light and dark are resolved — `useThemeStore` already persists the
 * preference through `src/lib/preferences.ts`, and `useResolvedScheme` already falls back to the OS.
 */
export default function AppearanceScreen() {
  const theme = useTheme();
  const resolved = useResolvedScheme();
  const osScheme = useColorScheme();
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScreenHeader title="Appearance" />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Home in miniature, in whichever scheme the selected option resolves to — tapping Dark
              redraws it. A token swatch could show the colours; only the screen shows the app. */}
          <HomeThemePreview scheme={resolved} />

          <View style={styles.rows}>
            {THEME_CHOICES.map((choice) => {
              const active = choice.value === preference;
              return (
                <Pressable
                  key={choice.value}
                  onPress={() => setPreference(choice.value as ThemePreference)}
                  style={({ pressed }) => [
                    styles.row,
                    {
                      backgroundColor: theme.card,
                      borderColor: active ? theme.accent : 'transparent',
                    },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <View style={[styles.tile, { backgroundColor: active ? theme.accent : theme.chip }]}>
                    <Icon
                      name={choice.icon}
                      size={20}
                      color={active ? theme.onAccent : theme.accent}
                      strokeWidth={2}
                    />
                  </View>
                  <View style={styles.textCol}>
                    <ThemedText type="cardTitle">{choice.label}</ThemedText>
                    <ThemedText type="body" themeColor="mut" style={styles.sub}>
                      {choice.value === 'system'
                        ? `Match my device · currently ${osScheme === 'dark' ? 'dark' : 'light'}`
                        : choice.sublabel}
                    </ThemedText>
                  </View>
                  {active ? (
                    <View style={[styles.check, { backgroundColor: theme.accent }]}>
                      <Icon name="check" size={14} color={theme.onAccent} strokeWidth={3} />
                    </View>
                  ) : (
                    <View style={[styles.ring, { borderColor: theme.line }]} />
                  )}
                </Pressable>
              );
            })}
          </View>

          <ThemedText type="body" themeColor="mut" style={styles.note}>
            Your choice is saved on this device, so signing in elsewhere will not carry it over.
          </ThemedText>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: Screen.horizontal, paddingBottom: Screen.bottom, gap: Screen.fieldGap + 8 },

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
  sub: { marginTop: 3 },
  check: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  ring: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, flexShrink: 0 },

  note: { lineHeight: 19 },
});
