import {
  useFonts,
  Archivo_400Regular,
  Archivo_500Medium,
  Archivo_600SemiBold,
  Archivo_700Bold,
  Archivo_800ExtraBold,
} from '@expo-google-fonts/archivo';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { SheetHost } from '@/components/sheet-host';
import { ToastHost } from '@/components/ui/toast';
import { Colors, Motion } from '@/constants/theme';
import { useResolvedScheme, useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Deliberately `useResolvedScheme`, not RN's `useColorScheme`: the navigation container has to
  // agree with every component about which scheme is active, including when the user has pinned one.
  const scheme = useResolvedScheme();
  const theme = useTheme();
  const hydrated = useAuthStore((s) => s.hydrated);
  const themeHydrated = useThemeStore((s) => s.hydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrateTheme = useThemeStore((s) => s.hydrate);
  const [fontsLoaded] = useFonts({
    Archivo_400Regular,
    Archivo_500Medium,
    Archivo_600SemiBold,
    Archivo_700Bold,
    Archivo_800ExtraBold,
  });

  useEffect(() => {
    hydrate();
    hydrateTheme();
  }, [hydrate, hydrateTheme]);

  /**
   * The navigation container's own palette. React Navigation's stock `DarkTheme` paints the scene
   * container `rgb(1,1,1)`, which shows as a black band behind every push and around each modal —
   * `#141313` is the app's actual background.
   */
  const navTheme = useMemo(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    const palette = Colors[scheme];
    return {
      ...base,
      colors: {
        ...base.colors,
        background: palette.background,
        card: palette.card,
        border: palette.line,
        text: palette.fg,
        primary: palette.accent,
      },
    };
  }, [scheme]);

  // The theme store has to be hydrated too, or a user who pinned dark renders one frame of 'system'.
  const ready = hydrated && themeHydrated && fontsLoaded;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <ThemeProvider value={navTheme}>
      {/* Without this the clock and battery stay dark ink on the dark surface. */}
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              animationDuration: Motion.slide,
              contentStyle: { backgroundColor: theme.background },
            }}
          >
            <Stack.Protected guard={!isAuthenticated}>
              <Stack.Screen name="(auth)" />
            </Stack.Protected>
            <Stack.Protected guard={isAuthenticated}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(money)" options={{ presentation: 'card' }} />
              <Stack.Screen name="transactions" />
              <Stack.Screen name="cards" />
              <Stack.Screen name="currencies" />
              <Stack.Screen name="links" />
              <Stack.Screen name="notifications" options={{ presentation: 'modal' }} />
              <Stack.Screen name="tour" options={{ presentation: 'modal' }} />
              <Stack.Screen name="gift-cards" />
            <Stack.Screen name="cashback" />
              <Stack.Screen name="security" />
              <Stack.Screen name="profile" />
            </Stack.Protected>
          </Stack>
          <SheetHost />
          <ToastHost />
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
