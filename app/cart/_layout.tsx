// app/product/_layout.tsx
// ✅ Simple passthrough layout untuk group /product
// Tugas utama: mendaftarkan [id] sebagai nested navigator

import { SCREEN_OPTIONS } from '@/components/ui/core/layout/nav';
import { Stack } from 'expo-router';
import { ArrowLeftIcon, MoreHorizontalIcon, MoreVerticalIcon } from 'lucide-react-native';

export default function ProductGroupLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/*
       * ✅ [id] di sini merujuk ke FOLDER [id]/
       * Bukan file [id].tsx — karena kita pakai nested folder structure
       * untuk support /product/[id]/index dan /product/[id]/reviews
       */}
      <Stack.Screen
        name="index"
        options={SCREEN_OPTIONS({
          title: 'Your cart ',
          leftIcon: ArrowLeftIcon,
          rightIcon: MoreVerticalIcon,
        })}
      />
    </Stack>
  );
}
