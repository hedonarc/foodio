import { Pressable, View } from 'react-native';

import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { AddToCartControl, type CartRestaurant } from '@/features/cart';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { colors } from '@/theme';

import type { MenuItem } from '../types/menu.types';

import { MenuPrice } from './MenuPrice';

type MenuItemCardProps = {
  item: MenuItem;
  restaurant: CartRestaurant;
};

export function MenuItemCard({ item, restaurant }: MenuItemCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const guard = useNavigationGuard();

  return (
    <Pressable
      onPress={() => guard(() => router.push(`/menu-item/${item.id}`))}
      accessibilityRole="button"
      accessibilityLabel={item.name}
      className="flex-row items-start py-3 active:opacity-70"
    >
      <View className="mr-3 h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-200">
        <Image
          source={{ uri: item.image }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={200}
          accessibilityIgnoresInvertColors
        />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center">
          <Text variant="bodyMedium" className="flex-1 text-gray-900" numberOfLines={1}>
            {item.name}
          </Text>
          {item.isPopular ? (
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
        <View className="mt-2 flex-row items-center justify-between">
          <MenuPrice priceMinor={item.priceMinor} currency={restaurant.currency} />
          <AddToCartControl
            restaurant={restaurant}
            item={{
              id: item.id,
              name: item.name,
              image: item.image,
              priceMinor: item.priceMinor,
            }}
          />
        </View>
      </View>
    </Pressable>
  );
}
