import { Pressable, ScrollView, View } from 'react-native';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/shared';
import { Text } from '@/components/ui';
import { useCartStore } from '@/stores/cart.store';
import { colors } from '@/theme';

import { CartLineRow } from '../components/CartLineRow';
import { CartSummary } from '../components/CartSummary';

export function CartScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const restaurant = useCartStore((state) => state.restaurant);
  const lines = useCartStore((state) => state.lines);
  const clear = useCartStore((state) => state.clear);

  const isEmpty = lines.length === 0 || restaurant === null;

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
        >
          <Ionicons name="chevron-back" size={20} color={colors.gray[900]} />
        </Pressable>
        <Text variant="subheading" className="flex-1 text-gray-900" numberOfLines={1}>
          {t('cart.title')}
        </Text>
        {isEmpty ? null : (
          <Pressable
            onPress={clear}
            accessibilityRole="button"
            accessibilityLabel={t('cart.clear')}
            hitSlop={8}
          >
            <Text variant="caption" className="font-semibold text-gray-500">
              {t('cart.clear')}
            </Text>
          </Pressable>
        )}
      </View>

      {isEmpty ? (
        <EmptyState message={t('cart.empty')} className="flex-1 items-center justify-center px-8" />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-4"
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <Text variant="caption" className="mb-2 text-gray-400">
            {t('cart.fromRestaurant', { restaurant: restaurant.name })}
          </Text>

          {lines.map((line) => (
            <CartLineRow key={line.id} line={line} currency={restaurant.currency} />
          ))}

          <CartSummary
            currency={restaurant.currency}
            deliveryFeeMinor={restaurant.deliveryFeeMinor}
          />

          <Text variant="caption" className="mt-4 text-center text-gray-400">
            {t('cart.checkoutComingSoon')}
          </Text>
        </ScrollView>
      )}
    </View>
  );
}
