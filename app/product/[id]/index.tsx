// app/product/[id]/index.tsx
// ✅ FINAL ROOT CAUSE FIX untuk icon color:
//
// Masalah sebelumnya:
// - useAnimatedProps({ color }) → lucide SVG tidak bisa di-drive native
// - cssInterop override → color kalah
//
// SOLUSI BENAR: Overlay 2 icon (putih + hitam), animate OPACITY
// Opacity adalah satu-satunya prop yang 100% native animatable di semua RN component
// Tidak ada dependency pada SVG props, tidak ada cssInterop issue

import React from 'react';

import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { productByIdQueryOptions } from '@/lib/server/products/products-server-queris';

import { SCREEN_OPTIONS } from '@/components/ui/core/layout/nav';
import { ArrowLeftIcon, HeartIcon } from 'lucide-react-native';
import LoadingIndicator from '@/components/ui/core/loading-indicator';
import { Text } from '@/components/ui/fragments/shadcn-ui/text';
import DetailProduct from '@/components/ui/core/block/detail-product-block';

export default function ProductDetail() {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const currentTheme = colorScheme ?? 'light';

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const params = useLocalSearchParams<{ id?: string; name?: string }>();
  const productId = params?.id ? Number(params.id) : NaN;
  const nameProduct = params?.name ?? 'Surah';
  const { data: product, isLoading, isError, error } = useQuery(productByIdQueryOptions(productId));
  console.log(product);
  return (
    <>
      <Stack.Screen
        options={SCREEN_OPTIONS({
          title: nameProduct,
          leftIcon: ArrowLeftIcon,
          rightIcon: HeartIcon,
        })}
      />
      {isLoading && !product ? (
        <LoadingIndicator />
      ) : (
        <DetailProduct Product={product!} ProductId={productId} ProductName={nameProduct} />
      )}
    </>
  );
}
