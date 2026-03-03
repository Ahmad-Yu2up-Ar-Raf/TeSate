// components/LastReadCard.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/fragments/shadcn-ui/card';
import React, { useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import { StyleSheet, useWindowDimensions, View, ViewProps } from 'react-native';
import { Text } from '../../shadcn-ui/text';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import MosqueBackground from '../../svg/mosque';

import { useLastRead } from '@/components/provider/LastReadProvider';

/**
 * Updated LastReadCard
 *
 * Goals:
 * - Radial gradient covers full card width and full card height (no left/bottom gap)
 * - Mosque is absolute on the right (background-like)
 * - Gradient center placed near the right half of mosque silhouette
 * - Left content reserves enough space (paddingRight) so text never overlaps mosque
 *
 * Tweak constants below to tune look.
 */

const CARD_HEIGHT = 125; // visual card height (px)
const CARD_HORIZONTAL_PADDING = 11; // padding inside left content
const MOSQUE_SCALE_MULT = 1.05; // mosque width = mosqueHeight * multiplier
const MOSQUE_RIGHT_OVERFLOW = 0; // negative offset to slightly overflow right edge
const MOSQUE_BOTTOM_OVERFLOW = -55; // negative offset to slightly overflow bottom

export function LastReadCard({ className, ...props }: ViewProps) {
  const { width: screenWidth } = useWindowDimensions();

  // cardTotalWidth: use full device width as "card width" (adjust if your card is narrower)
  // if card actually has side margins, subtract them here. For now assume full width.
  const CARD_TOTAL_WIDTH = Math.round(screenWidth - CARD_HORIZONTAL_PADDING * 1); // used for gradient width

  // Right visual area width: fraction of screen (tweak if needed)
  const RIGHT_AREA_WIDTH = Math.round(CARD_TOTAL_WIDTH / 1.9);

  // mosque size: mosque will be slightly taller than CARD_HEIGHT for aesthetic overlap
  const mosqueHeight = Math.round(CARD_HEIGHT * 1.7);
  const mosqueWidth = Math.round(mosqueHeight * MOSQUE_SCALE_MULT);

  // stable gradient id
  const gradientIdRef = useRef<string>(`rg-${Math.random().toString(36).slice(2, 9)}`);
  const gradientId = gradientIdRef.current;
  const { lastRead } = useLastRead();

  return (
    <Card
      className={cn('w-full overflow-hidden p-0', className)}
      style={{ height: CARD_HEIGHT }}
      {...props}>
      <CardContent
        className="h-full w-full p-0"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          position: 'relative', // anchor for absolute gradient & mosque
        }}>
        {/* LEFT content: flex 1 with right padding reserved for mosque */}
        <CardHeader className="relative z-40 w-full gap-3 px-6 py-0">
          <Text className="m-0 p-0 font-poppins_semibold text-sm tracking-tight text-foreground">
            Last Read
          </Text>

          <View className="gap-0">
            <CardTitle className="font-teko_semibold text-3xl tracking-tighter text-secondary">
              {lastRead?.surahName ?? 'None'}
            </CardTitle>
            {lastRead?.ayat && (
              <CardDescription className="font-poppins_medium text-xs text-muted-foreground">
                Ayat No: {lastRead?.ayat ?? '-'}
              </CardDescription>
            )}
          </View>
        </CardHeader>
        {/* FULL-WIDTH RADIAL GRADIENT (absolute, covers whole card width) */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: CARD_TOTAL_WIDTH,
            height: CARD_HEIGHT,
            zIndex: 1,
            pointerEvents: 'none',
          }}>
          <BackgroundGradient
            width={CARD_TOTAL_WIDTH}
            height={CARD_HEIGHT}
            gradientId={gradientId}
            // we pass mosqueWidth so gradient can place center relative to mosque silhouette on the right
            mosqueWidth={mosqueWidth}
            mosqueRightOverflow={Math.abs(MOSQUE_RIGHT_OVERFLOW)}
          />
        </View>

        {/* MOSQUE (absolute, right background) */}
        <View
          style={{
            position: 'absolute',
            right: MOSQUE_RIGHT_OVERFLOW,
            bottom: MOSQUE_BOTTOM_OVERFLOW,
            width: mosqueWidth,
            height: mosqueHeight,
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            zIndex: 10, // sits above gradient but below content (content zIndex 40)
            pointerEvents: 'none',
          }}>
          <MosqueBackground width={mosqueWidth} height={mosqueHeight} />
        </View>
      </CardContent>
    </Card>
  );
}

/* ---------- BackgroundGradient component ---------- */
/* Parameters:
   - width,height: full card width/height (we cover whole card)
   - mosqueWidth: used to compute gradient center near mosque silhouette
   - mosqueRightOverflow: positive number (how much mosque protrudes beyond right edge)
*/
const BackgroundGradient = ({
  width,
  height,
  gradientId = 'radialGradient',
  mosqueWidth = 0,
  mosqueRightOverflow = 0,
}: {
  width: number;
  height: number;
  gradientId?: string;
  mosqueWidth?: number;
  mosqueRightOverflow?: number;
}) => {
  // compute where the mosque silhouette center roughly is (in card coordinates)
  // Mosque is positioned absolute right with a negative overflow. So center_x (from left) =
  // card_width - (mosqueWidth / 2) + mosqueRightOverflow
  // (mosqueRightOverflow is positive here)
  const mosqueCenterX = width - mosqueWidth / 2 + mosqueRightOverflow;

  // place gradient center slightly left of mosque center so halo covers the mosque silhouette nicely
  const cx = Math.min(width, Math.max(0, mosqueCenterX - mosqueWidth * 0.17)); // nudged a bit left
  // vertical center around middle of card (can nudge up/down with multiplier)
  const cy = height * 0.98;

  // radius: big enough to create soft halo that fades out before left content
  // use the larger of width or mosqueWidth and scale
  const r = Math.max(width, mosqueWidth) * 1.3; // tweak multiplier for softer/harder fade

  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none">
        <Defs>
          <RadialGradient id={gradientId} cx={cx} cy={cy} r={r} gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="hsl(37,100%,50%)" stopOpacity={0.95} />
            <Stop offset="0.3" stopColor="hsl(37, 79%, 89%)" stopOpacity={0} />
          </RadialGradient>
        </Defs>

        <Rect width={width} height={height} fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  );
};
