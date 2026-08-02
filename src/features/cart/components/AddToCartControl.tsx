import { Alert, Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { selectIsFromOtherRestaurant, selectPlainLineOf, useCartStore } from '@/stores/cart.store';
import { colors } from '@/theme';

import type { AddableMenuItem, CartRestaurant } from '../types/cart.types';

type AddToCartControlProps = {
  restaurant: CartRestaurant;
  item: AddableMenuItem;
};

/** A single add button until the item is in the cart, then a stepper. */
export function AddToCartControl({ restaurant, item }: AddToCartControlProps) {
  const { t } = useTranslation();

  // Plain-line-only: a noted line is stepped from the cart, not the menu row.
  const line = useCartStore(selectPlainLineOf(item.id));
  const heldByOtherRestaurant = useCartStore(selectIsFromOtherRestaurant(restaurant.id));
  const addItem = useCartStore((state) => state.addItem);
  const incrementLine = useCartStore((state) => state.incrementLine);
  const decrementLine = useCartStore((state) => state.decrementLine);
  const currentRestaurantName = useCartStore((state) => state.restaurant?.name);

  const handleAdd = () => {
    if (!heldByOtherRestaurant) {
      addItem(restaurant, item);
      return;
    }

    // Adding would discard the existing cart.
    Alert.alert(
      t('cart.replaceTitle'),
      t('cart.replaceMessage', { restaurant: currentRestaurantName ?? '' }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('cart.replaceConfirm'),
          style: 'destructive',
          onPress: () => addItem(restaurant, item),
        },
      ],
    );
  };

  if (!line) {
    return (
      <Pressable
        onPress={handleAdd}
        accessibilityRole="button"
        accessibilityLabel={t('cart.add', { name: item.name })}
        hitSlop={8}
        className="h-8 w-8 items-center justify-center rounded-full bg-primary-500 active:bg-primary-600"
      >
        <Ionicons name="add" size={18} color={colors.white} />
      </Pressable>
    );
  }

  return (
    <View className="flex-row items-center rounded-full bg-gray-100">
      <Pressable
        onPress={() => decrementLine(line.id)}
        accessibilityRole="button"
        accessibilityLabel={t('cart.decrease', { name: item.name })}
        hitSlop={8}
        className="h-8 w-8 items-center justify-center rounded-full active:bg-gray-200"
      >
        <Ionicons
          name={line.quantity === 1 ? 'trash-outline' : 'remove'}
          size={16}
          color={colors.gray[700]}
        />
      </Pressable>
      <Text variant="label" className="w-6 text-center text-gray-900">
        {line.quantity}
      </Text>
      <Pressable
        onPress={() => incrementLine(line.id)}
        accessibilityRole="button"
        accessibilityLabel={t('cart.increase', { name: item.name })}
        hitSlop={8}
        className="h-8 w-8 items-center justify-center rounded-full bg-primary-500 active:bg-primary-600"
      >
        <Ionicons name="add" size={16} color={colors.white} />
      </Pressable>
    </View>
  );
}
