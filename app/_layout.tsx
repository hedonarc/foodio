import { Stack } from 'expo-router';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import { QueryProvider } from '@/providers/QueryProvider';

import '../global.css';

import '@/i18n';

export default function RootLayout() {
  return (
    <QueryProvider>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </QueryProvider>
  );
}
