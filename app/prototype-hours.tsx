/**
 * PROTOTYPE — throwaway route, never merged to main.
 *
 * Three opening-hours editors for Wayfinder ticket t7.
 *
 *   foodio://prototype-hours            (defaults to A)
 *   foodio://prototype-hours?variant=C
 *
 * Read-only: nothing here writes to the API.
 */
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { useLocalSearchParams } from 'expo-router';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { VariantA } from '@/features/onboarding/prototype-hours/VariantA';
import { VariantB } from '@/features/onboarding/prototype-hours/VariantB';
import { VariantC } from '@/features/onboarding/prototype-hours/VariantC';

const VARIANTS = [
  { key: 'A', name: 'Seven rows, edit in place', render: () => <VariantA /> },
  { key: 'B', name: 'Pattern + exceptions', render: () => <VariantB /> },
  { key: 'C', name: 'Days, then times', render: () => <VariantC /> },
] as const;

export default function PrototypeHoursScreen() {
  const params = useLocalSearchParams<{ variant?: string }>();
  const [index, setIndex] = useState(() =>
    Math.max(
      0,
      VARIANTS.findIndex((v) => v.key === (params.variant ?? 'A')),
    ),
  );
  const current = VARIANTS[index] ?? VARIANTS[0];

  const go = (delta: number) => setIndex((i) => (i + delta + VARIANTS.length) % VARIANTS.length);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <View className="flex-1">{current?.render()}</View>

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
