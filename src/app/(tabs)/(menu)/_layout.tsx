import { Stack } from 'expo-router';

import { colors } from '@/theme';

export default function MenuStackLayout() {
  return (
    <Stack
      initialRouteName="menu"
      screenOptions={{
        contentStyle: { backgroundColor: colors.canvas },
        headerShown: false,
      }}
    >
      <Stack.Screen name="menu" />
      <Stack.Screen name="search" options={{ presentation: 'modal' }} />
      <Stack.Screen name="item/[productId]" />
      <Stack.Screen name="build/[productId]" />
    </Stack>
  );
}
