// app/surat/[id].tsx
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import {   Stack, useLocalSearchParams } from 'expo-router';
import SurahBlock from '@/components/ui/core/block/surah-block';
import { ChevronLeft, PlayCircleIcon } from 'lucide-react-native';
import { SCREEN_OPTIONS } from '@/components/ui/core/layout/header';

export default function Page() {
  const params = useLocalSearchParams<{ id?: string; name?: string }>();
  const idParam = params?.id;
  const name = params?.name;
  const nomor = idParam ? Number(idParam) : NaN;
  const nameSurah = params.name ?? 'Surah';

  // Kalau nomor belum valid, tampilkan fallback minimal (jangan render SurahBlock dengan NaN)

  if (!Number.isFinite(nomor)) {
    return (
      <>
        <Stack.Screen
          options={SCREEN_OPTIONS({
            title: nameSurah,
            transparent: false,

            leftIcon: ChevronLeft,

            rightIcon: PlayCircleIcon,
          })}
        />
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </>
    );
  }

  return (
    <>
      <SurahBlock id={nomor} nameSurah={nameSurah} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
