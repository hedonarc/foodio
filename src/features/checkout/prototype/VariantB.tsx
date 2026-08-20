/** PROTOTYPE — throwaway. Variant B: one default, the other behind a switch. Not chosen. */
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui';
import { colors } from '@/theme';

import type { Method } from './shared';
import { isKnown, money, TOTAL_MINOR } from './shared';

/**
 * Checkout is not a payments screen; it is the last step before food. This picks
 * the market default — cash — and puts the alternative one quiet tap away, so
 * the common path is a glance rather than a decision.
 *
 * The bet it makes: at two methods, asking the customer to choose costs more
 * attention than it returns.
 */
export function VariantB({ methods }: { methods: readonly Method[] }) {
  const readable = methods.filter(isKnown);
  const [chosen, setChosen] = useState(readable[0]?.code ?? '');
  const [open, setOpen] = useState(false);

  const current = readable.find((method) => method.code === chosen) ?? readable[0];
  const others = readable.filter((method) => method.code !== current?.code);

  if (current === undefined) return null;

  return (
    <View className="flex-1 gap-4 px-4">
      <Text variant="subheading" className="text-gray-900">
        Payment
      </Text>

      <View className="flex-row items-center gap-3 rounded-2xl bg-gray-50 p-4">
        <Ionicons name={current.icon} size={20} color={colors.gray[600]} />
        <View className="flex-1">
          <Text variant="body" className="text-gray-900">
            {current.label}
          </Text>
          <Text variant="caption" className="mt-0.5 text-gray-500">
            {current.hint}
          </Text>
        </View>
      </View>

      {others.length > 0 && !open ? (
        <Pressable onPress={() => setOpen(true)} accessibilityRole="button" hitSlop={12}>
          <Text variant="caption" className="font-semibold text-primary-600">
            Pay by {others[0]?.label.toLowerCase()} instead
          </Text>
        </Pressable>
      ) : null}

      {open
        ? others.map((method) => (
            <Pressable
              key={method.code}
              onPress={() => {
                setChosen(method.code);
                setOpen(false);
              }}
              accessibilityRole="button"
              className="flex-row items-center gap-3 rounded-2xl border border-gray-200 p-4"
            >
              <Ionicons name={method.icon} size={20} color={colors.gray[500]} />
              <View className="flex-1">
                <Text variant="body" className="text-gray-900">
                  {method.label}
                </Text>
                <Text variant="caption" className="mt-0.5 text-gray-500">
                  {method.hint}
                </Text>
              </View>
            </Pressable>
          ))
        : null}

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
