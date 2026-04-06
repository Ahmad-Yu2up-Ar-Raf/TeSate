import { THEME } from '@/lib/theme';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';
const LogoAppIcon = (props: SvgProps) => {
  const { colorScheme } = useColorScheme();
  const currentTheme = colorScheme ?? 'light';
  const background = THEME[currentTheme].background;
  const tintColor = THEME[currentTheme].primary;

  return (
    <Svg width={100} height={100} fill="none" {...props}>
      <Path
        stroke={background}
        strokeWidth={3}
        fill={tintColor}
        d="M100 50c0 27.614-22.386 50-50 50S0 77.614 0 50 22.386 0 50 0s50 22.386 50 50Z"
      />
      <Path
        fill={background}
        d="M71.115 32.505c-.767-.666-4.956-4.501-5.739-5.177-.777-.674-1.965-.728-2.865-.728H37.49c-.897 0-2.085.054-2.865.728-.783.676-4.972 4.514-5.739 5.177-.772.665-1.411 1.671-1.206 3.099.205 1.432 4.914 35.518 5.036 36.33A1.742 1.742 0 0 0 34.4 73.4h31.2a1.742 1.742 0 0 0 1.685-1.47c.122-.808 4.83-34.896 5.039-36.329.202-1.425-.437-2.43-1.21-3.096ZM50 55.13c-8.445 0-10.252-11.95-10.626-14.412h4.776c.718 3.59 2.35 9.734 5.85 9.734 3.5 0 5.135-6.143 5.85-9.734h4.779C60.252 43.18 58.445 55.13 50 55.13ZM32.242 34.415 37 29.2h26l4.758 5.216H32.242Z"
      />
    </Svg>
  );
};

export default LogoAppIcon;
