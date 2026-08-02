import { Pressable, ScrollView } from 'react-native';

import { useRouter } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, ScreenHeader } from '@/components/shared';
import { Button, Text } from '@/components/ui';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { useCartStore } from '@/stores/cart.store';

import { CartLineRow } from '../components/CartLineRow';
import { CartSummary } from '../components/CartSummary';

export function CartScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const guard = useNavigationGuard();

  const restaurant = useCartStore((state) => state.restaurant);
  const lines = useCartStore((state) => state.lines);
  const clear = useCartStore((state) => state.clear);

  const isEmpty = lines.length === 0 || restaurant === null;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <ScreenHeader
        title={t('cart.title')}
        showBack={false}
        action={
          isEmpty ? undefined : (
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
          )
        }
      />

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

          <Button onPress={() => guard(() => router.push('/checkout'))} className="mt-6">
            {t('cart.checkout')}
          </Button>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
