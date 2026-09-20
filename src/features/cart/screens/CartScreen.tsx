import { Pressable, ScrollView, View } from 'react-native';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, ScreenHeader } from '@/components/shared';
import { Button, Text } from '@/components/ui';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { selectItemCount, selectTotalMinor, useCartStore } from '@/stores/cart.store';
import { colors } from '@/theme';
import { formatMoney } from '@/utils/currency';

import { CartLineRow } from '../components/CartLineRow';
import { CartSummary } from '../components/CartSummary';

export function CartScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const guard = useNavigationGuard();

  const restaurant = useCartStore((state) => state.restaurant);
  const lines = useCartStore((state) => state.lines);
  const itemCount = useCartStore(selectItemCount);
  const totalMinor = useCartStore(selectTotalMinor);
  const clear = useCartStore((state) => state.clear);

  const isEmpty = lines.length === 0 || restaurant === null;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <ScreenHeader
        title={t('cart.title')}
        showBack={false}
        action={
          isEmpty ? undefined : (
            <View className="flex-row items-center gap-3">
              <Text variant="caption" className="text-gray-500">
                {t('cart.items', { count: itemCount })}
              </Text>
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
            </View>
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
          {/* Whose food, and when: what every card on Home says, on the screen
              where the customer decides. Snapshot, like the price — see #203. */}
          <Text variant="label" className="mb-2 text-gray-600">
            {t('cart.header', {
              restaurant: restaurant.name,
              estimate: t('restaurant.deliveryEstimate', {
                min: restaurant.deliveryEstimate.minMinutes,
                max: restaurant.deliveryEstimate.maxMinutes,
              }),
            })}
          </Text>

          {lines.map((line) => (
            <CartLineRow key={line.id} line={line} currency={restaurant.currency} />
          ))}

          {/* The Cart is a tab: without this, adding a second dish means Home
              and finding the Restaurant again (#204). */}
          <Pressable
            onPress={() => guard(() => router.push(`/restaurant/${restaurant.id}`))}
            accessibilityRole="button"
            accessibilityLabel={t('cart.addMore')}
            className="flex-row items-center border-b border-gray-100 py-4 active:opacity-70"
          >
            <View className="h-6 w-6 items-center justify-center rounded-full border-2 border-primary-500">
              <Ionicons name="add" size={14} color={colors.primary[500]} />
            </View>
            <Text variant="label" className="ml-3 flex-1 text-primary-600">
              {t('cart.addMore')}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.gray[400]} />
          </Pressable>

          <CartSummary
            currency={restaurant.currency}
            deliveryFeeMinor={restaurant.deliveryFeeMinor}
          />
        </ScrollView>
      )}

      {/* Below the scroll, not in it: with more than four lines the button
          was off screen, and it named no amount (#205). Same footer as the
          dish page's Add button. */}
      {isEmpty ? null : (
        <View className="border-t border-gray-100 px-4 pb-5 pt-3">
          <Button onPress={() => guard(() => router.push('/checkout'))}>
            {t('cart.checkoutWithTotal', {
              total: formatMoney(totalMinor, restaurant.currency, i18n.language),
            })}
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
}
