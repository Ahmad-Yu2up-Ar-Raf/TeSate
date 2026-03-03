import { View, useWindowDimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Wrapper } from '../layout/wrapper';
import { StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { Text as RNText } from 'react-native'; // ← plain RN Text
import MosqueBackground from '../../fragments/svg/mosque';
import { Text } from '../../fragments/shadcn-ui/text';
import { LinearGradient } from 'expo-linear-gradient';

import { useCurrentTime } from '@/hooks/useCurrentTime';
import { usePrayer } from '@/hooks/usePrayerContext';
import { useColorScheme } from 'nativewind';
import { THEME } from '@/lib/theme';

const HERO_HEIGHT = 320; // ✅ Fixed height, bukan h-full

export default function HomeBlock() {
  const { nextPrayer, remaining, city, dateString, hour, minute } = usePrayer();
  const currentTime = useCurrentTime();
  const { colorScheme } = useColorScheme();
  const currentTheme = colorScheme ?? 'light';

  const backgroundColor = THEME[currentTheme].background;
  return (
    <Wrapper>
      {/* Hero Section */}
      <View
        style={{ height: HERO_HEIGHT, position: 'relative', overflow: 'visible' }}
        className="items-center justify-center">
        <BackgroundGradient backgroundColor={backgroundColor} />
        <View className="absolute z-10 w-full flex-row">
          <RNText className="z-10 w-1/2 gap-1 pr-7 text-right font-schluber text-8xl uppercase text-secondary">
            {currentTime.hour}
          </RNText>
          <RNText className="z-10 w-1/2 gap-1 pl-7 text-left font-schluber text-8xl uppercase text-secondary">
            {currentTime.minute}
          </RNText>

          {/* <Separator orientation="vertical" className="w-1 mx-2 bg-secondary/20" /> */}
        </View>
        <RNText className="absolute z-10 mb-1 ml-1 text-center font-schluber text-8xl uppercase text-secondary">
          :
        </RNText>

        <View className="absolute -bottom-5 z-[999999999] flex-row">
          <View className="w-1/2 gap-1 border-r-2 border-secondary/10 pr-4 text-right">
            <Text variant={'muted'} className="text-right text-xs uppercase">
              remaining time{' '}
            </Text>
            <Text
              variant={'h4'}
              className="text-right font-poppins_semibold text-base capitalize tracking-tighter">
              {nextPrayer} {remaining}
            </Text>
          </View>
          {/* <Separator orientation="vertical" className="w-1 mx-2 bg-secondary/20" /> */}
          <View className="w-1/2 gap-1 border-l-2 border-secondary/30 pl-4 text-left">
            <Text variant={'muted'} className="line-clamp-1 text-left text-xs uppercase">
              {dateString || '...'}
            </Text>
            <Text className="line-clamp-1 text-left font-poppins_semibold text-base tracking-tighter">
              {city}
            </Text>
          </View>
        </View>
        <View className="absolute -bottom-6 z-[20] scale-110">
          <MosqueBackground />
        </View>
        <LinearGradient
          colors={
            currentTheme === 'dark'
              ? ['hsl(0 0% 11.7647%)', 'hsl(0 0% 7.0588%)']
              : ['hsl(37, 79%, 89%)', 'hsl(26, 54%, 97%)']
          }
          locations={[0, 1]} // ✅ sama jumlahnya (2)
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 300,
            zIndex: 1005,
            bottom: -60,
          }}
        />
      </View>
    </Wrapper>
  );
}

const BackgroundGradient = ({ backgroundColor }: { backgroundColor?: string }) => {
  const { width } = useWindowDimensions(); // ✅ ambil lebar layar realtime

  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg
        height="100%"
        width="100%"
        viewBox={`0 0 ${width} ${HERO_HEIGHT}`} // ✅ viewBox eksplisit
        preserveAspectRatio="none"
        style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient
            id="radialGradient"
            gradientUnits="userSpaceOnUse" // ✅ GANTI ke userSpaceOnUse (pakai pixel, bukan %)
            cx={width / 2} // ✅ tengah layar dalam pixel
            cy={HERO_HEIGHT * 0.88} // ✅ sedikit ke bawah dari tengah
            r={width * 0.9} // ✅ radius dalam pixel — cukup besar cover semua
          >
            {/* Pusat: warna primary penuh */}
            <Stop offset="0" stopColor="hsl(37, 100%, 52%)" stopOpacity={1} />
            {/* Tengah: mulai fade */}
            <Stop offset="0.4" stopColor="hsl(37, 100%, 60%)" stopOpacity={0.8} />
            {/* Pinggir: mulai transparent */}
            <Stop offset="0.75" stopColor={backgroundColor} stopOpacity={6} />
            {/* Ujung: full transparent */}
          </RadialGradient>
        </Defs>
        <Rect width={width} height={HERO_HEIGHT} fill="url(#radialGradient)" />
      </Svg>
    </View>
  );
};
