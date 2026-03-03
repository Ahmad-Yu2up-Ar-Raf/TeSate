// app/_layout.tsx
import '@/global.css';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { useFonts } from 'expo-font';
import Provider from '@/components/provider/provider';

export { ErrorBoundary } from 'expo-router';
import {
  PrayerBootstrapData,
  PrayerProvider,
  initializePrayerData,
} from '@/hooks/usePrayerContext';
// Google Fonts
import { Poppins_400Regular } from '@expo-google-fonts/poppins/400Regular';
import { Poppins_500Medium } from '@expo-google-fonts/poppins/500Medium';
import { Poppins_600SemiBold } from '@expo-google-fonts/poppins/600SemiBold';
import { Poppins_700Bold } from '@expo-google-fonts/poppins/700Bold';
import { Teko_300Light } from '@expo-google-fonts/teko/300Light';
import { Teko_400Regular } from '@expo-google-fonts/teko/400Regular';
import { Teko_500Medium } from '@expo-google-fonts/teko/500Medium';
import { Teko_600SemiBold } from '@expo-google-fonts/teko/600SemiBold';
import { Teko_700Bold } from '@expo-google-fonts/teko/700Bold';
// IMPORTANT: prevent auto hide immediately
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AppBootstrap>
      <Provider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="article" />
        </Stack>
        <PortalHost />
      </Provider>
    </AppBootstrap>
  );
}

/**
 * Global App Bootstrap Layer
 * Semua preload masuk sini
 */
function AppBootstrap({ children }: { children: React.ReactNode }) {
  const [fontsLoaded] = useFonts({
    Schluber: require('@/assets/fonts/Schluber.otf'),
    Arabic: require('@/assets/fonts/NotoNaskhArabic-VariableFont_wght.ttf'),
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Teko_300Light,
    Teko_400Regular,
    Teko_500Medium,
    Teko_600SemiBold,
    Teko_700Bold,
  });
  const [bootstrapData, setBootstrapData] = React.useState<PrayerBootstrapData | null>(null);
  const [prayerData, setPrayerData] = React.useState<{
    coords: string;
    city: string;
  } | null>(null);

  React.useEffect(() => {
    async function prepare() {
      if (!fontsLoaded) return;

      const data = await initializePrayerData();
      setBootstrapData(data);
      setPrayerData({
        coords: `${data.coordinates.latitude},${data.coordinates.longitude}`,
        city: data.city,
      });

      await SplashScreen.hideAsync();
    }

    prepare();
  }, [fontsLoaded]);

  if (!fontsLoaded || !prayerData) {
    return null;
  }

  return <PrayerProvider initialData={bootstrapData!}>{children}</PrayerProvider>;
}
