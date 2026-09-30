import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, usePathname, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { BagProvider } from '@/features/bag';
import { CatalogBrowseProvider, isCatalogBrowsePath } from '@/features/catalog';
import { getStorefrontRuntime } from '@/lib/storefront';
import { colors, useAppFonts } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function createBootstrapService() {
  return getStorefrontRuntime().services.bootstrap;
}

function createBagDependencies() {
  const runtime = getStorefrontRuntime();
  return {
    bootstrap: runtime.services.bootstrap,
    cart: runtime.services.cart,
    cartSessions: runtime.cartSessions,
    checkoutRecovery: runtime.services.checkoutRecovery,
    locationId: runtime.environment.locationId,
    ...(runtime.capabilities.loyalty === 'enabled'
      ? { loyalty: runtime.services.loyalty }
      : {}),
  };
}

function getCatalogScopeKey(): string {
  try {
    const { environment } = getStorefrontRuntime();
    return [
      environment.environmentNamespace,
      environment.merchantSlug,
      environment.locationId,
    ].join('.');
  } catch {
    return 'catalog-unavailable';
  }
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();
  const pathname = usePathname();
  const segments = useSegments();
  const catalogActive =
    pathname === '/search' ||
    (segments[0] === '(tabs)' && isCatalogBrowsePath(pathname));

  const bagActive =
    pathname === '/bag' ||
    pathname === '/bag-clear' ||
    pathname === '/bag-remove-item' ||
    pathname === '/checkout';

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <BagProvider
      active={bagActive}
      createDependencies={createBagDependencies}
      key={getCatalogScopeKey()}
    >
      <CatalogBrowseProvider
        active={catalogActive}
        createBootstrapService={createBootstrapService}
      >
        <StatusBar style="dark" />
        <View style={{ flex: 1 }}>
          {process.env.EXPO_PUBLIC_CRAVEUP_API_URL ===
            'https://demo.maple-main.example' && (
            <SafeAreaView
              edges={['top']}
              style={{ backgroundColor: colors.ink }}
            >
              <Text
                style={{
                  color: colors.canvas,
                  textAlign: 'center',
                  padding: 8,
                  fontSize: 11,
                }}
              >
                Maple &amp; Main demo · Menu browsing only
              </Text>
            </SafeAreaView>
          )}
          <Stack
            screenOptions={{
              contentStyle: { backgroundColor: colors.canvas },
              headerShown: false,
            }}
          >
            <Stack.Screen name="error" />
            <Stack.Screen name="offline" />
            <Stack.Screen name="store-closed" />
            <Stack.Screen name="checkout" />
          </Stack>
        </View>
      </CatalogBrowseProvider>
    </BagProvider>
  );
}
