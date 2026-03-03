import { View, useWindowDimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Wrapper } from '../layout/wrapper';
import { StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { Text as RNText } from 'react-native'; // ← plain RN Text
import MosqueBackground from '../../fragments/svg/mosque';
import { Text } from '../../fragments/shadcn-ui/text';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { useCurrentTime } from '@/hooks/useCurrentTime';

const HERO_HEIGHT = 320; // ✅ Fixed height, bukan h-full

export default function HomeBlock() {
  const { isLoading, error, nextPrayer, remaining, locationDisplay, dateString, formattedTime } =
    usePrayerTimes({
      locationFormat: 'city_country', // "city" | "country" if you prefer shorter
      fallbackCoords: null, // or { latitude: -6.595, longitude: 106.806 } for Bogor fallback
      force24h: true,
    });
  const currentTime = useCurrentTime();
  return (
    <Wrapper>
      {/* Hero Section */}
      <View
        style={{ height: HERO_HEIGHT, position: 'relative', overflow: 'visible' }}
        className="items-center justify-center">
        <BackgroundGradient />
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

        <View className="absolute -bottom-7 z-30 flex-row">
          <View className="w-1/2 gap-1 border-r border-muted-foreground/40 pr-5 text-right">
            <Text variant={'muted'} className="text-right uppercase">
              remaining time{' '}
            </Text>
            <Text variant={'h4'} className="text-right font-poppins_medium text-lg">
              {nextPrayer} {remaining}
            </Text>
          </View>
          {/* <Separator orientation="vertical" className="w-1 mx-2 bg-secondary/20" /> */}
          <View className="w-1/2 gap-1 pl-5 text-left">
            <Text variant={'muted'} className="line-clamp-1 text-left uppercase">
              {dateString || '...'}
            </Text>
            <Text variant={'h4'} className="line-clamp-1 text-left font-poppins_medium text-lg">
              {locationDisplay}
            </Text>
          </View>
        </View>
        <View className="absolute -bottom-7 z-20 scale-105">
          <MosqueBackground />
        </View>
      </View>
    </Wrapper>
  );
}

const BackgroundGradient = () => {
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
            <Stop offset="0" stopColor="hsl(37, 100%, 59%)" stopOpacity={1} />
            {/* Tengah: mulai fade */}
            <Stop offset="0.4" stopColor="hsl(37, 100%, 60%)" stopOpacity={0.8} />
            {/* Pinggir: mulai transparent */}
            <Stop offset="0.75" stopColor="hsl(37, 100%, 80%)" stopOpacity={0.2} />
            {/* Ujung: full transparent */}
            <Stop offset="1" stopColor="hsl( 26, 54%, 97%)" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width={width} height={HERO_HEIGHT} fill="url(#radialGradient)" />
      </Svg>
    </View>
  );
};
