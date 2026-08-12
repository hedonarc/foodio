/**
 * PROTOTYPE — throwaway route, never merged to main.
 *
 * Three variants of "set your location and delivery area" for Wayfinder ticket
 * t8, switchable from the bar at the bottom or with `?variant=A|B|C`.
 *
 *   foodio://prototype-location            (defaults to A)
 *   foodio://prototype-location?variant=C
 *
 * Read-only: nothing here writes to the API.
 */
import { Pressable, View } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { VariantA } from '@/features/onboarding/prototype/VariantA';
import { VariantB } from '@/features/onboarding/prototype/VariantB';
import { VariantC } from '@/features/onboarding/prototype/VariantC';

const VARIANTS = [
  { key: 'A', name: 'Map-first — drag the world', render: () => <VariantA /> },
  { key: 'B', name: 'Form-first — GPS + words', render: () => <VariantB /> },
  { key: 'C', name: 'Areas — radius derived', render: () => <VariantC /> },
] as const;

export default function PrototypeLocationScreen() {
  const params = useLocalSearchParams<{ variant?: string }>();
  const index = Math.max(
    0,
    VARIANTS.findIndex((v) => v.key === (params.variant ?? 'A')),
  );
  const current = VARIANTS[index] ?? VARIANTS[0];

  const go = (delta: number) => {
    const next = VARIANTS[(index + delta + VARIANTS.length) % VARIANTS.length];
    router.setParams({ variant: next?.key ?? 'A' });
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <View className="flex-1">{current?.render()}</View>

      {/* Deliberately ugly: this bar is not part of the design being judged. */}
      {__DEV__ ? (
        <View className="absolute bottom-8 left-0 right-0 items-center" pointerEvents="box-none">
          <View className="flex-row items-center gap-3 rounded-full bg-black/85 px-3 py-2">
            <Pressable onPress={() => go(-1)} accessibilityRole="button" className="px-2">
              <Text variant="subheading" className="text-white">
                ‹
              </Text>
            </Pressable>

            <Text variant="label" className="text-white">
              {current?.key} — {current?.name}
            </Text>

            <Pressable onPress={() => go(1)} accessibilityRole="button" className="px-2">
              <Text variant="subheading" className="text-white">
                ›
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
