import { Button } from '@/components/ui/fragments/shadcn-ui/button';
import { Icon } from '@/components/ui/fragments/shadcn-ui/icon';
 
import { Search, MenuIcon } from 'lucide-react-native';
import * as React from 'react';
import { Text, View } from 'react-native';

const SCREEN_OPTIONS_HOME = {
  header: () => (
    <View className="top-safe absolute left-0 right-0 flex-row items-center justify-between px-3 py-2 web:mx-2">
      <Button variant={'ghost'} size={'icon'}>
        <Icon as={MenuIcon} className="size-5" />
      </Button>

      <Text   className="  font-schluber text-2xl uppercase">
       Gurun
      </Text>

      <Button variant={'ghost'} size={'icon'}>
        <Icon as={Search} className="size-5" />
      </Button>
    </View>
  ),
  transparent: true,
};

export { SCREEN_OPTIONS_HOME };
