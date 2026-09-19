import { Pressable, View } from 'react-native';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { Photo, Text } from '@/components/ui';
import { AddToCartControl, type CartRestaurant } from '@/features/cart';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { colors } from '@/theme';

import type { MenuItem } from '../types/menu.types';

import { MenuPrice } from './MenuPrice';

type MenuItemCardProps = {
  item: MenuItem;
  restaurant: CartRestaurant;
};

/**
 * The dish gets the photograph the chosen design gives it — a large square
 * with the Add button sitting on its corner — on the left, as decided in
 * #196. A dish with no photograph keeps the frame, so rows stay aligned.
 */
export function MenuItemCard({ item, restaurant }: MenuItemCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const guard = useNavigationGuard();
  const soldOut = item.isAvailable === false;

  return (
    <Pressable
      onPress={() => guard(() => router.push(`/menu-item/${item.id}`))}
      accessibilityRole="button"
      accessibilityLabel={item.name}
      className="flex-row items-stretch py-3 active:opacity-70"
    >
      <View className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100">
        {item.image ? (
          <Photo uri={item.image} className="h-full w-full" />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <Ionicons name="fast-food-outline" size={28} color={colors.gray[300]} />
          </View>
        )}
        <View className="absolute bottom-1.5 right-1.5">
          <AddToCartControl
            restaurant={restaurant}
            item={{
              id: item.id,
              name: item.name,
              image: item.image,
              priceMinor: item.priceMinor,
            }}
            disabled={soldOut}
          />
        </View>
      </View>

      <View className="ml-3 flex-1 justify-between py-0.5">
        <View>
          <View className="flex-row items-center">
            <Text variant="bodyMedium" className="flex-1 text-gray-900" numberOfLines={1}>
              {item.name}
            </Text>
            {soldOut ? (
              <View className="ml-2 rounded-full bg-gray-200 px-2 py-0.5">
                <Text variant="caption" className="font-semibold text-gray-600">
                  {t('menu.soldOut')}
                </Text>
              </View>
            ) : item.isPopular ? (
              <View className="ml-2 rounded-full bg-warning-100 px-2 py-0.5">
                <Text variant="caption" className="font-semibold text-warning-700">
                  {t('menu.popularBadge')}
                </Text>
              </View>
            ) : null}
          </View>
          {item.rating !== undefined ? (
            <View className="mt-0.5 flex-row items-center">
              <Ionicons name="star" size={11} color={colors.warning[500]} />
              <Text variant="caption" className="ml-0.5 font-semibold text-warning-700">
                {item.rating.toFixed(1)}
              </Text>
            </View>
          ) : null}
          <Text variant="caption" className="mt-1 text-gray-500" numberOfLines={2}>
            {item.description}
          </Text>
        </View>
        <MenuPrice priceMinor={item.priceMinor} currency={restaurant.currency} />
      </View>
    </Pressable>
  );
}
