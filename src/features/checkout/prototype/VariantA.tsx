/** PROTOTYPE — throwaway. Variant A: the list, rendered from whatever the server sends. CHOSEN. */
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui';
import { colors } from '@/theme';

import type { Method } from './shared';
import { isKnown, money, TOTAL_MINOR } from './shared';

/**
 * What standing constraint 2 literally implies: the server hands over a list and
 * the screen renders it. Every method is a row, the first is selected, and the
 * shape does not change as the list grows or shrinks.
 */
export function VariantA({ methods }: { methods: readonly Method[] }) {
  const readable = methods.filter(isKnown);
  const [chosen, setChosen] = useState(readable[0]?.code ?? '');

  return (
    <View className="flex-1 gap-4 px-4">
      <Text variant="subheading" className="text-gray-900">
        Payment
      </Text>

      {readable.map((method) => {
        const selected = method.code === chosen;

        return (
          <Pressable
            key={method.code}
            onPress={() => setChosen(method.code)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            className={
              selected
                ? 'flex-row items-center gap-3 rounded-2xl border-2 border-primary-500 bg-primary-50 p-4'
                : 'flex-row items-center gap-3 rounded-2xl border border-gray-200 p-4'
            }
          >
            <Ionicons
              name={method.icon}
              size={20}
              color={selected ? colors.primary[600] : colors.gray[500]}
            />
            <View className="flex-1">
              <Text variant="bodyMedium" className="text-gray-900">
                {method.label}
              </Text>
              <Text variant="caption" className="mt-0.5 text-gray-500">
                {method.hint}
              </Text>
            </View>
            <Ionicons
              name={selected ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={selected ? colors.primary[600] : colors.gray[300]}
            />
          </Pressable>
        );
      })}

      {/* Hidden rather than broken. The customer still has a way to pay. */}
      {methods.length > readable.length ? (
        <Text variant="caption" className="text-gray-400">
          One method this version cannot show. Update the app to use it.
        </Text>
      ) : null}

      <View className="mt-auto pb-8">
        <View className="rounded-2xl bg-primary-500 px-4 py-4">
          <Text variant="bodyMedium" className="text-center text-white">
            {chosen === 'card'
              ? `Pay ${money(TOTAL_MINOR)}`
              : `Place order · ${money(TOTAL_MINOR)}`}
          </Text>
        </View>
      </View>
    </View>
  );
}
