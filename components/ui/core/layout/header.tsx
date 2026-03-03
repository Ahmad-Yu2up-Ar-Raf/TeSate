import { Button } from '@/components/ui/fragments/shadcn-ui/button';
import { Icon } from '@/components/ui/fragments/shadcn-ui/icon';
import { cn } from '@/lib/utils';

import { Search, MenuIcon, LucideIcon, SearchIcon } from 'lucide-react-native';
import * as React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_OPTIONS = ({
  title,
  transparent = true,
  rigthAction,
  leftAction,
  rightIcon = SearchIcon,
  leftIcon = MenuIcon,
}: {
  title?: string;
  transparent?: boolean;
  leftIcon?: LucideIcon;
  rigthAction?: () => void;
  leftAction?: () => void;
  rightIcon?: LucideIcon;
}) => ({
  header: () => {
    const insets = useSafeAreaInsets();
    return (
      <View
        className={cn(
          'absolute left-0 right-0 top-0 w-full flex-row items-center justify-between px-2 py-0 web:mx-2',
          transparent ? 'bg-transparent' : 'bg-background'
        )}
        style={{ paddingTop: insets.top + 1 }}>
        <Button variant={'ghost'} size={'icon'} onPress={leftAction}>
          <Icon as={leftIcon} className="size-6" />
        </Button>

        <Text className="font-schluber text-2xl uppercase text-foreground">{title || 'Gurun'}</Text>

        <Button variant={'ghost'} size={'icon'} onPress={rigthAction}>
          <Icon as={rightIcon || Search} className="size-6" />
        </Button>
      </View>
    );
  },
  background: transparent ? 'transparent' : 'background',
  transparent: transparent,
  headerShadowVisible: false,
});

export { SCREEN_OPTIONS };
