/** PROTOTYPE — throwaway. Variant C: two tiles, and the decline the others hide. Not chosen. */
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui';
import { colors } from '@/theme';

import type { Method } from './shared';
import { isKnown, money, TOTAL_MINOR } from './shared';

/**
 * Two equal tiles rather than a list or a default. It only works *because* the
 * choice is two — a third would have to wrap or shrink — which is exactly the
 * bet it makes and the reason it is worth comparing against A.
 *
 * It also carries the case the ticket cares most about: a card that fails
 * mid-payment, and whether cash is reachable without rebuilding the cart.
 */
export function VariantC({ methods }: { methods: readonly Method[] }) {
  const readable = methods.filter(isKnown);
  const [chosen, setChosen] = useState(readable[0]?.code ?? '');
  const [failed, setFailed] = useState(false);

  const cardChosen = chosen === 'card';

  return (
    <View className="flex-1 gap-4 px-4">
      <Text variant="subheading" className="text-gray-900">
        Payment
      </Text>

      <View className="flex-row gap-3">
        {readable.map((method) => {
          const selected = method.code === chosen;

          return (
            <Pressable
              key={method.code}
              onPress={() => {
                setChosen(method.code);
                setFailed(false);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              className={
                selected
                  ? 'flex-1 items-center gap-2 rounded-2xl border-2 border-primary-500 bg-primary-50 p-4'
                  : 'flex-1 items-center gap-2 rounded-2xl border border-gray-200 p-4'
              }
            >
              <Ionicons
                name={method.icon}
                size={26}
                color={selected ? colors.primary[600] : colors.gray[500]}
              />
              <Text variant="bodyMedium" className="text-center text-gray-900">
                {method.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text variant="caption" className="text-gray-500">
        {readable.find((method) => method.code === chosen)?.hint}
      </Text>

      {failed ? (
        <View className="gap-2 rounded-2xl bg-error-100 p-4">
          <Text variant="bodyMedium" className="text-error-700">
            Your card was declined
          </Text>
          <Text variant="caption" className="text-error-700">
            Nothing was charged. Your order is still here.
          </Text>
          <Pressable
            onPress={() => {
              setChosen('cash_on_delivery');
              setFailed(false);
            }}
            accessibilityRole="button"
            hitSlop={12}
          >
            <Text variant="caption" className="mt-1 font-semibold text-error-700">
              Pay cash on delivery instead
            </Text>
          </Pressable>
        </View>
      ) : null}

      <View className="mt-auto gap-3 pb-8">
        {cardChosen && !failed ? (
          <Pressable
            onPress={() => setFailed(true)}
            accessibilityRole="button"
            hitSlop={16}
            className="rounded-2xl border border-dashed border-gray-300 py-3"
          >
            <Text variant="caption" className="text-center text-gray-400">
              ⚡ simulate a declined card
            </Text>
          </Pressable>
        ) : null}

        <View className="rounded-2xl bg-primary-500 px-4 py-4">
          <Text variant="bodyMedium" className="text-center text-white">
            {cardChosen ? `Pay ${money(TOTAL_MINOR)}` : `Place order · ${money(TOTAL_MINOR)}`}
          </Text>
        </View>
      </View>
    </View>
  );
}
