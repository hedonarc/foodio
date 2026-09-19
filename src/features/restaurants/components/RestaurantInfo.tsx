import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { colors } from '@/theme';
import { formatMoney } from '@/utils/currency';

import { useOpeningNotice } from '../hooks/useOpeningNotice';
import type { Restaurant } from '../types/restaurant.types';

import { RestaurantRating } from './RestaurantRating';
import { RestaurantReach } from './RestaurantReach';

type RestaurantInfoProps = {
  restaurant: Restaurant;
};

/**
 * Who this is, in four short rows: the name as the biggest word on the page,
 * the rating, cuisines with whether it is open, time and fee, and where it is.
 * The description lives below the menu now — people came to order, and it is
 * the last thing that decides it (#193).
 */
export function RestaurantInfo({ restaurant }: RestaurantInfoProps) {
  const { t, i18n } = useTranslation();
  const { isOpen, opensText } = useOpeningNotice(restaurant);

  const deliveryFee =
    restaurant.deliveryFeeMinor === 0
      ? t('restaurant.freeDelivery')
      : t('restaurant.deliveryFee', {
          fee: formatMoney(restaurant.deliveryFeeMinor, restaurant.currency, i18n.language),
        });

  return (
    <View className="px-4 pb-4 pt-4">
      <Text className="text-[26px] font-bold leading-8 text-gray-900" accessibilityRole="header">
        {restaurant.name}
      </Text>

      <View className="mt-1.5">
        <RestaurantRating rating={restaurant.rating} reviewCount={restaurant.reviewCount} />
      </View>

      <View className="mt-2.5 flex-row items-center justify-between">
        <Text variant="body" className="flex-1 text-gray-500" numberOfLines={1}>
          {restaurant.cuisines.join(' • ')}
        </Text>
        <View
          className={`ml-2 rounded-full px-2.5 py-1 ${isOpen ? 'bg-green-100' : 'bg-gray-100'}`}
        >
          <Text
            variant="caption"
            className={`font-semibold ${isOpen ? 'text-green-800' : 'text-gray-500'}`}
          >
            {isOpen ? t('restaurant.open') : t('restaurant.closed')}
          </Text>
        </View>
      </View>

      {opensText ? (
        <Text variant="caption" className="mt-1.5 font-medium text-gray-600">
          {opensText}
        </Text>
      ) : null}

      <View className="mt-3 flex-row flex-wrap items-center gap-4">
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={15} color={colors.gray[500]} />
          <Text variant="caption" className="ml-1.5 font-medium text-gray-600">
            {t('restaurant.deliveryEstimate', {
              min: restaurant.deliveryEstimate.minMinutes,
              max: restaurant.deliveryEstimate.maxMinutes,
            })}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="bicycle-outline" size={15} color={colors.gray[500]} />
          <Text variant="caption" className="ml-1.5 font-medium text-gray-600">
            {deliveryFee}
          </Text>
        </View>
      </View>

      <RestaurantReach restaurant={restaurant} />

      <View className="mt-2.5 flex-row items-start">
        <Ionicons name="map-outline" size={15} color={colors.gray[400]} className="mt-0.5" />
        <Text variant="caption" className="ml-1.5 flex-1 text-gray-400">
          {restaurant.address}
        </Text>
      </View>
    </View>
  );
}
