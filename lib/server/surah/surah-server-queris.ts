// lib/server/surah/surah-server-queries.ts
import { queryOptions } from '@tanstack/react-query';
import { fetchAllSurah, fetchSurahDetail } from './surah-server';
import type { Datum, TempatTurun } from '@/type/surah-type';
import type { Data } from '@/type/surah-detail-type';

export type SurahListFilters = {
  search?: string;
  tempatTurun?: TempatTurun;
};

export const surahKeys = {
  all: ['surah'] as const,
  lists: () => [...surahKeys.all, 'list'] as const,
  list: (filters?: SurahListFilters) => [...surahKeys.lists(), filters ?? {}] as const,
  detail: (nomor: number) => [...surahKeys.all, 'detail', nomor] as const,
};

/** list query — fetch all then filter client-side */
export function surahListQueryOptions(filters?: SurahListFilters) {
  return queryOptions({
    queryKey: surahKeys.list(filters),
    queryFn: async (): Promise<Datum[]> => {
      const all = await fetchAllSurah();
      if (!filters) return all;
      const q = filters.search?.trim().toLowerCase() ?? '';
      return all.filter((s) => {
        const matchSearch =
          !q ||
          s.nama.toLowerCase().includes(q) ||
          s.namaLatin.toLowerCase().includes(q) ||
          s.arti.toLowerCase().includes(q);
        const matchTempat = !filters.tempatTurun || s.tempatTurun === filters.tempatTurun;
        return matchSearch && matchTempat;
      });
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });
}

/** detail query */
export function surahDetailQueryOptions(nomor: number) {
  return queryOptions({
    queryKey: surahKeys.detail(nomor),
    queryFn: () => fetchSurahDetail(nomor),
    enabled: Number.isFinite(nomor) && nomor > 0,
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
  });
}
