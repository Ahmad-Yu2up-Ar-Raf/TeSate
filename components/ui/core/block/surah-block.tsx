// components/ui/core/block/surah-block.tsx
import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Text } from '../../fragments/shadcn-ui/text';
import { surahDetailQueryOptions } from '@/lib/server/surah/surah-server-queris';
import { useQuery } from '@tanstack/react-query';
import { LegendList } from '@legendapp/list';

import { AyatCard } from '../../fragments/custom-ui/card/ayat-card';
import { SurahDetailCard } from '../../fragments/custom-ui/card/detail-surah-card';

import { ChevronLeft, PauseCircleIcon, PlayCircleIcon } from 'lucide-react-native';
import { SCREEN_OPTIONS } from '../layout/header';
import { router, Stack } from 'expo-router';
import { useGlobalAudio } from '@/components/provider/AudioProvider';
import { useLastRead } from '@/components/provider/LastReadProvider';

export default function SurahBlock({ id, nameSurah }: { id: number; nameSurah: string }) {
  const query = useQuery(surahDetailQueryOptions(id));
  const { data, isLoading, isError, error } = query;
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  const { setLastRead } = useLastRead();
  if (isError || !data) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>
          Error: {String(error?.message ?? 'Tidak bisa load data')}
        </Text>
      </View>
    );
  }
  const { play, pause, stop, currentId, isPlaying, isLoading: audioLoading } = useGlobalAudio();

  // ID for full surah audio (distinct id)
  const fullAudioId = `surah-full-${id}`;
  const fullAudioUri = data?.audioFull?.['01'] ?? data?.audioFull?.['02'] ?? null;

  const isFullActive = currentId === fullAudioId;
  const isFullPlaying = isFullActive && isPlaying;

  const handleFullPlay = async () => {
    if (!fullAudioUri) return; // fallback
    // If currently active and playing -> pause; provider will toggle if same id
    await play(fullAudioId, fullAudioUri);
    // store last read as surah start
    await setLastRead({
      surahNomor: id,
      surahName: data?.namaLatin ?? nameSurah ?? undefined,
      ayat: null,
    });
  };

  const LeaveAction = async () => {
    // stop audio completely when leaving screen
    await stop();
    // then navigate back
    router.back();
  };

  // your Stack.Screen may be re-rendered and reflect updated icons via isFullPlaying
  return (
    <>
      <Stack.Screen
        options={SCREEN_OPTIONS({
          title: data?.namaLatin ?? nameSurah ?? `Surah ${id}`,
          transparent: false,
          leftAction: LeaveAction,
          leftIcon: ChevronLeft,
          rigthAction: handleFullPlay,
          rightIcon: isFullPlaying ? PauseCircleIcon : PlayCircleIcon,
        })}
      />
      <LegendList
        data={data?.ayat ?? []}
        renderItem={({ item }) => (
          <AyatCard surahNomor={data.nomor} surahNama={data.namaLatin} ayat={item} />
        )}
        keyExtractor={(item) => `ayat-${item.nomorAyat}`}
        numColumns={1}
        onEndReachedThreshold={1.5}
        ListHeaderComponent={
          <SurahDetailCard
            kategori={data.tempatTurun}
            namaLatin={data.namaLatin}
            arti={data.arti}
            jumlahAyat={data.jumlahAyat}
          />
        }
        contentContainerStyle={{ paddingTop: 120, gap: 10, paddingBottom: 100 }}
        className="px-5"
        maintainVisibleContentPosition
        recycleItems={true}
        showsVerticalScrollIndicator={false}
      />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
