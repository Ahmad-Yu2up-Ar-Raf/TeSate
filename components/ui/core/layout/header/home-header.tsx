import { Button } from '@/components/ui/fragments/shadcn-ui/button';
import { Icon } from '@/components/ui/fragments/shadcn-ui/icon';
import { Text } from '@/components/ui/fragments/shadcn-ui/text';

import { MoonStarIcon, XIcon, SunIcon, ChevronLeft, ChevronRight, HamburgerIcon, Search, MenuIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { View } from 'react-native';

const SCREEN_OPTIONS_HOME = {
  header: () => (
    <View className="top-safe items-center absolute left-0 right-0 flex-row justify-between px-3 py-2 web:mx-2">
      <Button variant={'ghost'} size={'icon'}>
        <Icon as={MenuIcon} className="size-6  " />
      </Button>
      
        <Text variant={"h3"} className='text-xl  uppercase font-poppins_semibold'>Deen muslim</Text>
       
     
      <Button variant={'ghost'} size={'icon'}>
        <Icon as={Search} className="size-6  " />
      </Button>
    </View>
  ),
};

 
export { SCREEN_OPTIONS_HOME };
