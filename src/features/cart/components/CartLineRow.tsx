import { Pressable, View } from 'react-native';

import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { useCartStore } from '@/stores/cart.store';
import { colors } from '@/theme';
import { formatMoney } from '@/utils/currency';

import type { CartLine } from '../types/cart.types';

type CartLineRowProps = {
  line: CartLine;
  currency: string;
};

export function CartLineRow({ line, currency }: CartLineRowProps) {
  const { t, i18n } = useTranslation();

  const incrementLine = useCartStore((state) => state.incrementLine);
  const decrementLine = useCartStore((state) => state.decrementLine);

  const lineTotalMinor = line.unitPriceMinor * line.quantity;

  return (
    <View className="flex-row items-center border-b border-gray-100 py-3">
      <View className="mr-3 h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-200">
        <Image
          source={{ uri: line.image }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={200}
          accessibilityIgnoresInvertColors
        />
      </View>

      <View className="flex-1">
        <Text variant="bodyMedium" className="text-gray-900" numberOfLines={2}>
          {line.name}
        </Text>
        <Text variant="caption" className="mt-0.5 text-gray-400">
          {formatMoney(line.unitPriceMinor, currency, i18n.language)}
        </Text>
      </View>

      <View className="ml-3 items-end">
        <Text variant="bodyMedium" className="text-gray-900">
          {formatMoney(lineTotalMinor, currency, i18n.language)}
        </Text>
        <View className="mt-2 flex-row items-center rounded-full bg-gray-100">
          <Pressable
            onPress={() => decrementLine(line.id)}
            accessibilityRole="button"
            accessibilityLabel={t('cart.decrease', { name: line.name })}
            hitSlop={8}
            className="h-7 w-7 items-center justify-center rounded-full active:bg-gray-200"
          >
            <Ionicons
              name={line.quantity === 1 ? 'trash-outline' : 'remove'}
              size={14}
              color={colors.gray[700]}
            />
          </Pressable>
          <Text variant="caption" className="w-5 text-center font-semibold text-gray-900">
            {line.quantity}
          </Text>
          <Pressable
            onPress={() => incrementLine(line.id)}
            accessibilityRole="button"
            accessibilityLabel={t('cart.increase', { name: line.name })}
            hitSlop={8}
            className="h-7 w-7 items-center justify-center rounded-full bg-primary-500 active:bg-primary-600"
          >
            <Ionicons name="add" size={14} color={colors.white} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
