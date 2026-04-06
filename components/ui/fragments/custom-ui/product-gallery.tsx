// components/ui/fragments/custom/gallery/product-gallery.tsx
// ✅ FIXED: AnimatedStyle<ViewStyle> — spesifik ViewStyle, bukan generic AnimatedStyle

import { View, ScrollView, Pressable } from 'react-native';
import React from 'react';

import { Image } from '../shadcn-ui/image';

type ProductGalleryProps = {
  images: string[];
  CARD_WIDTH: number;
  IMAGE_HEIGHT: number;
  setShowPreview: React.Dispatch<React.SetStateAction<number | null>>;
};

export default function ProductGallery({
  images,
  setShowPreview,
  CARD_WIDTH,
  IMAGE_HEIGHT,
}: ProductGalleryProps) {
  return (
    <>
      <View className="m-auto" style={[{ width: CARD_WIDTH, height: IMAGE_HEIGHT }]}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          decelerationRate="fast"
          bounces={false}
          nestedScrollEnabled={true}
          directionalLockEnabled={true}
          style={{ width: CARD_WIDTH, height: IMAGE_HEIGHT, gap: 20 }}>
          {images.map((uri, i) => (
            <Pressable
              onPress={() => setShowPreview(i)}
              key={`img-${i}`}
              
              style={{ width: CARD_WIDTH, height: IMAGE_HEIGHT }}>
              <Image
                source={{ uri }}
                contentFit="cover"
                showLoadingIndicator={true}
                showErrorFallback={false}
                className="h-full w-full bg-white"
              />
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </>
  );
}
