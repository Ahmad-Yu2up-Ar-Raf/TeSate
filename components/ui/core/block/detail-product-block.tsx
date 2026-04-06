import { Dimensions, View } from 'react-native';

import React, { useState } from 'react';
import { Product } from '@/type/product-type';
import { Wrapper } from '../layout/wrapper';
import ProductGallery from '../../fragments/custom-ui/product-gallery';
import { ImagesPreview } from '../../fragments/custom-ui/dialog/images-dialog';

import { Icon } from '../../fragments/shadcn-ui/icon';
import { MinusIcon, PlusIcon, Star } from 'lucide-react-native';
import { Text } from '../../fragments/shadcn-ui/text';
import { Button } from '../../fragments/shadcn-ui/button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { THEME } from '@/lib/theme';

type componentProps = {
  Product: Product;
  ProductName: string;
  ProductId: number;
};

const DetailProduct = ({ Product }: componentProps) => {
  const SCREEN_WIDTH = Dimensions.get('window').width;
  const CARD_WIDTH = SCREEN_WIDTH / 1.5;
  const insets = useSafeAreaInsets();
  const IMAGE_HEIGHT = CARD_WIDTH * (4 / 3.7);
  const [quantity, setQuantity] = useState(1);
  const { colorScheme } = useColorScheme();
  const currentTheme = colorScheme ?? 'light';
  const price = Product.price * quantity;
  const bgColor = THEME[currentTheme].background;
  const [showPreview, setShowPreview] = React.useState<number | null>(null);
  return (
    <>
      <Wrapper className="relative flex-col gap-10 bg-background pt-10">
        <ProductGallery
          setShowPreview={setShowPreview}
          images={Product.images}
          CARD_WIDTH={CARD_WIDTH}
          IMAGE_HEIGHT={IMAGE_HEIGHT}
        />
        <View className="h-fit w-full flex-row items-center justify-between px-8">
          <Text className="line-clamp-1 w-fit flex-1 font-source_serif_semibold text-4xl tracking-tighter text-foreground">
            {Product.title}
          </Text>
          <View className="w-fit flex-row items-center gap-2">
            <Icon as={Star} className="size-5 fill-yellow-500 text-yellow-500" />
            <Text className="font-source_serif_semibold text-lg tracking-tighter text-muted-foreground/70">
              {Product.rating.toFixed(1)}
            </Text>
          </View>
        </View>
        <View className="h-fit w-full flex-row items-center justify-between px-8">
          <View className="relative flex-1 flex-row items-center gap-1">
            <Text variant={'large'} className="mb-2 font-source_serif_bold text-2xl">
              $
            </Text>
            <Text
              variant={'large'}
              className="line-clamp-1 w-full font-source_serif_bold text-3xl leading-relaxed tracking-tighter text-foreground">
              {Product.price.toFixed(2)}
            </Text>
          </View>
          <View className="h-fit flex-row items-center justify-between gap-6 rounded-full border border-border/85 px-4 py-2.5">
            <Button
              disabled={quantity == 1}
              onPress={() => setQuantity(quantity - 1)}
              variant={'ghost'}
              size="icon"
              className="size-fit rounded-full p-0">
              <Icon as={MinusIcon} className="size-5" />
            </Button>
            <Text className="font-source_serif_semibold text-lg">{quantity}</Text>
            <Button
              disabled={quantity == 100}
              onPress={() => setQuantity(quantity + 1)}
              variant={'ghost'}
              size="icon"
              className="size-fit rounded-full p-0">
              <Icon as={PlusIcon} className="size-5" />
            </Button>
          </View>
        </View>
        <View className="gap-2 px-8">
          <Text className="font-poppins_semibold text-xl tracking-tighter" variant={'h3'}>
            About Product
          </Text>
          <Text
            variant={'p'}
            className="text-justify text-sm leading-relaxed text-muted-foreground/65">
            {Product.description}
          </Text>
        </View>
      </Wrapper>
      {showPreview !== null && (
        <ImagesPreview
          images={Product.images}
          curentIndex={showPreview}
          setShowPreview={setShowPreview}
        />
      )}
      {/* Bottom Action Bar */}

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: insets.bottom > 0 ? insets.bottom + 36 : 12,
          paddingTop: 11,

          backgroundColor: bgColor,

          zIndex: 100,
        }}
        className="flex-row items-center justify-center gap-12 px-8">
        <View className="relative w-fit gap-0">
          <View className="relative m-0 h-fit w-fit flex-row items-center justify-center gap-0.5 p-0">
            <Text variant={'large'} className="m-0 mb-2 p-0 font-source_serif_bold text-2xl">
              $
            </Text>
            <Text
              variant={'large'}
              className="m-0 line-clamp-1 w-fit p-0 font-source_serif_bold text-4xl leading-relaxed tracking-tighter">
              {price.toFixed(2)}
            </Text>
          </View>
          <Text
            variant={'small'}
            className="m-0 -mt-0.5 h-fit w-fit p-0 text-center font-poppins_medium text-base tracking-tighter">
            Total Price
          </Text>
        </View>
        <Button variant="default" size={'lg'} className="h-16 w-fit rounded-full px-9">
          <Text variant={'large'} className="font-poppins_medium text-lg text-primary-foreground">
            Place Order
          </Text>
        </Button>
      </View>
    </>
  );
};

export default DetailProduct;
