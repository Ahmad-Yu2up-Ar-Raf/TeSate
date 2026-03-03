// components/provider/provider.tsx

import React from 'react';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppState, Platform, View } from 'react-native';
import type { AppStateStatus } from 'react-native';
import { AudioProvider } from './AudioProvider';
import { BookmarkProvider } from './BookmarkProvider';
import { LastReadProvider } from './LastReadProvider';

type ComponentProps = {
  children?: React.ReactNode;
};

// ─────────────────────────────────────────────────────────────────────────────
// 🐛 ROOT CAUSE BUG #5 (PALING KRITIS UNTUK INFINITE SCROLL):
//    queryClient.refetchQueries() saat app foreground = DEADLOCK
//
// TIMELINE MASALAH:
//   1. User scroll ke threshold → onEndReached → isLoadingMoreRef = true
//      → fetchNextPage() mulai berjalan
//   2. User switch ke app lain (bahkan tidak sengaja) → AppState = 'background'
//   3. User kembali → AppState = 'active'
//   4. queryClient.refetchQueries() dipanggil → refetch SEMUA query
//   5. Ini CANCEL fetchNextPage() yang sedang berjalan + reset infinite query
//   6. fetchNextPage().finally() TIDAK terpanggil dengan benar
//      → isLoadingMoreRef.current STUCK di true selamanya
//   7. Semua handleLoadMore berikutnya di-block oleh ref yang stuck
//   8. User scroll sampai ujung → tidak ada yang terjadi → DELAY permanen
//
// Selain itu, refetchQueries() JUGA menyebabkan:
//   - Semua carousel di beranda di-refetch → waterfall requests
//   - Infinite query di-reset ke halaman 1 → scroll position terasa "melompat"
//   - Network requests membanjiri Platzi API → rate limit → errors
//
// ✅ FIX: Gunakan focusManager dari TanStack Query
//
//   focusManager.setFocused(true/false) memberi tahu TanStack Query
//   bahwa app sedang "focused" atau tidak — tanpa langsung refetch.
//
//   TanStack Query kemudian SENDIRI yang memutuskan:
//   - Query mana yang perlu direfetch (berdasarkan staleTime)
//   - Kapan melakukan refetch (tidak langsung, tapi saat query di-read)
//   - Apakah infinite query perlu di-reset atau tidak
//
//   Ini adalah OFFICIAL RECOMMENDED approach TanStack Query untuk React Native.
//   Lihat: https://tanstack.com/query/latest/docs/react/react-native
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// 🐛 BUG #5b: retry: 3 dengan exponential backoff = 7+ detik delay per failure
//
// Platzi API sering timeout atau lambat. Dengan retry: 3:
//   Failure 1 → wait 1s → retry
//   Failure 2 → wait 2s → retry
//   Failure 3 → wait 4s → fail
//   TOTAL: ~7 detik sebelum user tahu request gagal
//
// Untuk infinite scroll: user scroll ke bawah, fetchNextPage() dipanggil,
// Platzi timeout → user menunggu 7+ detik dengan spinner → sangat bad UX.
//
// ✅ FIX: retry: 1 — cukup satu retry untuk flaky network
//    Kalau masih gagal, tampilkan error → user bisa manual retry
//    Lebih baik fail fast daripada menunggu lama.
// ─────────────────────────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 menit
      gcTime: 5 * 60 * 1000, // 5 menit
      retry: 1, // ✅ BUG #5b FIX: bukan 3
      retryDelay: 1000, // ✅ Flat 1s delay — bukan exponential
      refetchOnWindowFocus: true, // TanStack Query handle via focusManager
      refetchOnReconnect: true,
      refetchOnMount: true,
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    },
  },
});

export default function Provider({ children }: ComponentProps) {
  const { colorScheme } = useColorScheme();

  React.useEffect(() => {
    // ✅ BUG #5 FIX: focusManager, bukan queryClient.refetchQueries()
    //
    // Cara kerja:
    //   - App ke background → focusManager.setFocused(false)
    //     TanStack Query tahu app tidak aktif, pause background refetches
    //   - App ke foreground → focusManager.setFocused(true)
    //     TanStack Query cek query mana yang stale → refetch secara teratur
    //     TIDAK memaksa semua query refetch sekaligus
    //
    // Infinite query yang sedang berjalan TIDAK akan di-cancel atau di-reset
    // → isLoadingMoreRef TIDAK akan stuck → infinite scroll tetap normal
    const subscription = AppState.addEventListener('change', (status: AppStateStatus) => {
      if (Platform.OS !== 'web') {
        focusManager.setFocused(status === 'active');
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <LastReadProvider>
          <AudioProvider>
            <BookmarkProvider>{children}</BookmarkProvider>
          </AudioProvider>
        </LastReadProvider>

        <PortalHost />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export { queryClient };
