import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/fragments/shadcn-ui/card';
import { Link } from 'expo-router';
import { SocialConnections } from '../feauture/auth/social-connections';
import { Separator } from '../../fragments/shadcn-ui/separator';
import { Text } from '../../fragments/shadcn-ui/text';
import { View } from 'react-native';
import LogoApp from '../../fragments/svg/logo-app';
import { Button } from '../../fragments/shadcn-ui/button';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spinner } from '../../fragments/shadcn-ui/spinner';

type AuthLayoutProps = {
  children?: React.ReactNode;
  title?: string;
  description?: string;
  quote?: string;

  loading?: boolean;
  className?: string;
  numberOfIterations?: number;
  formType?: 'login' | 'register' | undefined;
  signInGoogleButton?: boolean;
  onPress: () => void;
  textButton?: string;
};

const AuthLayout = ({
  formType,
  numberOfIterations,
  className,
  loading = false,
  signInGoogleButton = true,
  title = `Welcome Back!`,
  quote = `Your ideas are not just talk — make them happen.`,
  description = `The journey is about to begin`,
  onPress,
  textButton = 'Masuk',
  ...props
}: AuthLayoutProps) => {
  const insets = useSafeAreaInsets();

  // ✅ FIX: Define offset constants
  const BOTTOM_CLOSED = insets.bottom > 0 ? insets.bottom : 12;
  const BOTTOM_OPEN = 8;

  // ✅ FIX: Simple button position style (NO complex Reanimated)
  const containerStyle = useMemo(() => ({
    bottom: BOTTOM_CLOSED,
  }), [BOTTOM_CLOSED]);

  // ✅ FIX #4: Memoize form type calculations
  const formTypeConfig = useMemo(() => ({
    label: formType == 'register' ? 'Login' : 'Register',
    link: formType == 'register' ? '/(auth)/sign-in' : '/(auth)/sign-up',
  }), [formType]);

  return (
    <SafeAreaView
      edges={['bottom', 'top', 'left', 'right']}
      className="h-full content-start items-start justify-start bg-card p-7 sm:flex-1">
      <Card className="relative m-auto flex h-full w-full max-w-sm content-start justify-start gap-5 border-0 bg-transparent px-0 shadow-none sm:border-border">
        <CardHeader className="relative mb-1 flex w-full flex-col content-start items-center justify-start gap-6 p-0">
          <View className="size-fit scale-150">
            <LogoApp className="relative m-auto size-full overflow-visible" />
          </View>
          <View>
            <CardTitle className="font-cinzel_bold mb-0.5 text-center text-2xl">{title}</CardTitle>
            <CardDescription className="text-center text-base text-muted-foreground sm:text-left">
              {description}
            </CardDescription>
          </View>
        </CardHeader>

        <CardContent className="mb-0 gap-6 p-0">
          <View className="gap-2.5">{props.children}</View>
        </CardContent>
        
        {/* ✅ FIX #5: Social connections and form type navigation - explicitly check signInGoogleButton */}
        {signInGoogleButton === true && (
          <CardFooter className="relative mt-0 flex w-full flex-col gap-5 overflow-hidden p-0">
            <View className="flex-row items-center">
              <Separator className="flex-1" />
              <Text className="px-4 text-sm text-muted-foreground">atau lanjutkan dengan</Text>
              <Separator className="flex-1" />
            </View>
            <SocialConnections />
            {formType && (
              <Text className="mt-2 text-start text-sm text-muted-foreground">
                {formType == 'register' ? `Sudah punya akun? ` : ' Belum punya akun? '}
                <Link href={formTypeConfig.link} className="text-primary underline underline-offset-4">
                  {formTypeConfig.label}
                </Link>
              </Text>
            )}
          </CardFooter>
        )}
      </Card>

      {/* ✅ Button at bottom with simple positioning */}
      <View className="absolute left-0 right-0 px-5" style={containerStyle}>
        <Button variant="default" size={'lg'} onPress={onPress} disabled={loading}>
          <Text className="font-cinzel_black text-lg text-primary-foreground">{textButton}</Text>
          {loading && <Spinner className="text-primary-foreground" />}
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default AuthLayout;
