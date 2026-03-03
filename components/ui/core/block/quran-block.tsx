import React from 'react';

import { ActivityIndicator, RefreshControl } from 'react-native';
import { Text } from '../../fragments/shadcn-ui/text';
import { surahListQueryOptions } from '@/lib/server/surah/surah-server-queris';
import { useQuery } from '@tanstack/react-query';
import { LegendList } from '@legendapp/list';
import { SurahCard } from '../../fragments/custom-ui/card/surah-card';
import QuranHeader from '../../fragments/custom-ui/header/quran-header';

export default function QuranBlock() {
  const data = useQuery(surahListQueryOptions());

  if (data.isLoading) {
    return <ActivityIndicator size="large" />;
  }

  if (data.isError) {
    return <Text>Terjadi kesalahan</Text>;
  }

  return (
    <LegendList
      data={data.data ?? []}
      renderItem={({ item }) => <SurahCard sura={item} />}
      keyExtractor={(item) => `surah-${item.nomor}`}
      numColumns={1}
      onEndReachedThreshold={1.5}
      // ✅ Sama dengan explore-products: cover kasus re-check setelah data datang
      ListHeaderComponent={QuranHeader}
      contentContainerStyle={{ paddingTop: 120, paddingBottom: 100 }}
      className="px-5"
 
      // ✅ Android removeClippedSubviews bug → hanya aktifkan di iOS
      maintainVisibleContentPosition
      recycleItems={true}
      showsVerticalScrollIndicator={false}
    />
  );
}
