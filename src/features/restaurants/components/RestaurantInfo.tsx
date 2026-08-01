import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { colors } from '@/theme';
import { formatMoney } from '@/utils/currency';
import { isOpenAt } from '@/utils/openingHours';

import type { Restaurant } from '../types/restaurant.types';

type RestaurantInfoProps = {
  restaurant: Restaurant;
};

export function RestaurantInfo({ restaurant }: RestaurantInfoProps) {
  const { t, i18n } = useTranslation();

  const isOpen = isOpenAt(restaurant.openingHours, new Date());

  const deliveryFee =
    restaurant.deliveryFeeMinor === 0
      ? t('restaurant.freeDelivery')
      : t('restaurant.deliveryFee', {
          fee: formatMoney(restaurant.deliveryFeeMinor, restaurant.currency, i18n.language),
        });

  return (
    <View className="px-4 py-4">
      <View className="flex-row items-center justify-between">
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

      <View className="mt-3 flex-row items-center flex-wrap gap-4">
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={15} color={colors.gray[500]} />
          <Text variant="caption" className="ml-1.5 text-gray-600 font-medium">
            {t('restaurant.deliveryEstimate', {
              min: restaurant.deliveryEstimate.minMinutes,
              max: restaurant.deliveryEstimate.maxMinutes,
            })}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="bicycle-outline" size={15} color={colors.gray[500]} />
          <Text variant="caption" className="ml-1.5 text-gray-600 font-medium">
            {deliveryFee}
          </Text>
        </View>
      </View>

      <Text variant="body" className="mt-4 text-gray-600 leading-relaxed">
        {restaurant.description}
      </Text>

      <View className="mt-3 flex-row items-start">
        <Ionicons name="map-outline" size={15} color={colors.gray[400]} className="mt-0.5" />
        <Text variant="caption" className="ml-1.5 text-gray-400 flex-1">
          {restaurant.address}
        </Text>
      </View>
    </View>
  );
}
