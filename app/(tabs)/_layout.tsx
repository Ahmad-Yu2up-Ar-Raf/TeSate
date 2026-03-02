// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { THEME } from '@/lib/theme';
import { useColorScheme } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticTab } from '@/components/ui/core/haptic-tab';
import KabbahIcon from '@/components/ui/fragments/svg/icons/kabbah';
import QuranIcon from '@/components/ui/fragments/svg/icons/quran';
import MasjidIcon from '@/components/ui/fragments/svg/icons/masjid';
import { View } from 'react-native';
import SettingIcon from '@/components/ui/fragments/svg/icons/setting';
import HomeIcon from '@/components/ui/fragments/svg/icons/home';
import { Text } from '@/components/ui/fragments/shadcn-ui/text';
import { cn } from '@/lib/utils';

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const currentTheme = colorScheme ?? 'light';
  const tintColor = THEME[currentTheme].secondary;
  const backgroundColor = THEME[currentTheme].background;
  const inactiveTintColor = THEME[currentTheme].mutedForeground;

  const insets = useSafeAreaInsets(); // ✅ Dapetin safe area insets

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarButton: HapticTab,

          tabBarActiveTintColor: tintColor,
         
          tabBarInactiveTintColor: inactiveTintColor,
          tabBarStyle: {
            backgroundColor,

            height: 80 + insets.bottom, // ✅ CRITICAL: Tinggi + bottom inset
            paddingTop: 20,
            display: 'flex',
            alignItems: 'center',

            borderTopWidth: 0.01,
            borderTopColor: THEME[currentTheme].border,
          },
          
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarLabel: ({ color, focused }) => (
              <Text className={cn("text-xs  mt-1.5 ", focused ? 'font-poppins_semibold text-secondary' : " font-poppins_medium  text-muted-foreground ")}>Home</Text>
            ),
            tabBarButton: HapticTab,
             tabBarIcon: ({ color, focused }) => (
              <View className="scale-1">
                <HomeIcon fill={color} />
              </View>
            ),
          }}
        />
    
        <Tabs.Screen
          name="quran"
          options={{
            title: 'Quran',
      tabBarLabel: ({ color, focused }) => (
              <Text className={cn("text-xs  mt-1.5 ", focused ? 'font-poppins_semibold text-secondary' : " font-poppins_medium  text-muted-foreground ")}>Quran</Text>
            ),
            tabBarButton: HapticTab,
            tabBarIcon: ({ color, focused }) => (
              <View className="scale-1">
                <QuranIcon fill={color} />
              </View>
            ),
          }}
        />
            <Tabs.Screen
          name="qibla"
          options={{
            
            title: 'Qibla',
             tabBarLabel: ({ color, focused }) => (
              <Text className={cn("text-xs  mt-1.5 ", focused ? 'font-poppins_semibold text-secondary' : " font-poppins_medium text-muted-foreground ")}>Qibla</Text>
            ),
            tabBarIcon: ({ color, focused }) => <KabbahIcon fill={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
             tabBarLabel: ({ color, focused }) => (
              <Text className={cn("text-xs  mt-1.5 ", focused ? 'font-poppins_semibold text-secondary' : " font-poppins_medium  text-muted-foreground ")}>Settings</Text>
            ),
            tabBarIcon: ({ color, focused }) => (
              <View className="mb-1 size-full p-0.5">
                <SettingIcon fill={color} />
              </View>
            ),
          }}
        />

        {/* Tab lainnya... */}
      </Tabs>
    </>
  );
}
