/**
 * PROTOTYPE — throwaway route, never merged to main.
 *
 * Three takes on "checkout renders whatever methods the server sends", for
 * Wayfinder ticket t7. Variant with the bottom bar, scenario with the top one.
 *
 *   foodio://prototype-checkout
 *
 * Read-only: nothing here talks to the API.
 */
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { SCENARIOS } from '@/features/checkout/prototype/shared';
import { VariantA } from '@/features/checkout/prototype/VariantA';
import { VariantB } from '@/features/checkout/prototype/VariantB';
import { VariantC } from '@/features/checkout/prototype/VariantC';

const VARIANTS = [
  { key: 'A', name: 'List — chosen', render: VariantA },
  { key: 'B', name: 'Default + switch', render: VariantB },
  { key: 'C', name: 'Two tiles, and a decline', render: VariantC },
] as const;

export default function PrototypeCheckoutScreen() {
  const [variant, setVariant] = useState(0);
  const [scenario, setScenario] = useState(0);

  const current = VARIANTS[variant] ?? VARIANTS[0];
  const methods = SCENARIOS[scenario]?.methods ?? SCENARIOS[0].methods;
  const Render = current.render;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      {/* Both bars are deliberately ugly: they are not part of the design. */}
      <View className="flex-row flex-wrap gap-2 px-4 pb-3">
        {SCENARIOS.map((option, index) => (
          <Pressable
            key={option.key}
            onPress={() => setScenario(index)}
            accessibilityRole="button"
            className={
              index === scenario
                ? 'rounded-full bg-black px-3 py-1.5'
                : 'rounded-full bg-gray-200 px-3 py-1.5'
            }
          >
            <Text variant="caption" className={index === scenario ? 'text-white' : 'text-gray-700'}>
              {option.name}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="flex-1">
        <Render methods={methods} />
      </View>

      <View className="flex-row items-center justify-center gap-6 border-t border-gray-200 bg-black/85 px-3 py-3">
        <Pressable
          onPress={() => setVariant((variant + 2) % 3)}
          accessibilityRole="button"
          hitSlop={20}
        >
          <Text variant="subheading" className="px-3 text-white">
            ‹
          </Text>
        </Pressable>
        <Text variant="label" className="w-56 text-center text-white">
          {current.key} — {current.name}
        </Text>
        <Pressable
          onPress={() => setVariant((variant + 1) % 3)}
          accessibilityRole="button"
          hitSlop={20}
        >
          <Text variant="subheading" className="px-3 text-white">
            ›
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
