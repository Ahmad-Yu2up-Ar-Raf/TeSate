import '@/global.css';

import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { useFonts } from '@expo-google-fonts/cinzel/useFonts';
 
import Provider from '@/components/provider/provider';
export { ErrorBoundary } from 'expo-router';
 
import { Poppins_400Regular } from '@expo-google-fonts/poppins/400Regular';
 
import { Poppins_500Medium } from '@expo-google-fonts/poppins/500Medium';
 
import { Poppins_600SemiBold } from '@expo-google-fonts/poppins/600SemiBold';
 
import { Poppins_700Bold } from '@expo-google-fonts/poppins/700Bold';
 
export default function RootLayout() {
  return (
    <Provider>
      <Routes />
      <PortalHost />
    </Provider>
  );
}

SplashScreen.preventAutoHideAsync();

function Routes() {
  const [loaded, error] = useFonts({
 
    'poppins_regular': Poppins_400Regular, 
 
    'poppins_medium': Poppins_500Medium, 
 
    'poppins_semibold':   Poppins_600SemiBold, 
 
    'poppins_bold': Poppins_700Bold, 
    
 
  });

  React.useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded || error) { 
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="article" options={{ headerShown: false }} />
    </Stack>
  );
}
