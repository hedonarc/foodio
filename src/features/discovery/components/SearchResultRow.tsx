import { Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { Photo, Text } from '@/components/ui';
import { type RestaurantSummary, RestaurantTilePlaceholder } from '@/features/restaurants';
import { colors } from '@/theme';
import { formatMoney } from '@/utils/currency';

type SearchResultRowProps = {
  restaurant: RestaurantSummary;
  onPress: () => void;
};

/** A result is a row, not a card: four of them fit where one card did. */
export function SearchResultRow({ restaurant, onPress }: SearchResultRowProps) {
  const { t, i18n } = useTranslation();

  const fee =
    restaurant.deliveryFeeMinor === 0
      ? t('restaurant.freeDelivery')
      : t('restaurant.deliveryFee', {
          fee: formatMoney(restaurant.deliveryFeeMinor, restaurant.currency, i18n.language),
        });

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={restaurant.name}
      className="flex-row items-center py-2.5 active:opacity-80"
    >
      {restaurant.image ? (
        <Photo uri={restaurant.image} className="h-16 w-16 rounded-xl" />
      ) : (
        <RestaurantTilePlaceholder name={restaurant.name} className="h-16 w-16 rounded-xl" />
      )}

      <View className="ml-3 flex-1">
        <Text variant="bodyMedium" className="text-gray-900" numberOfLines={1}>
          {restaurant.name}
        </Text>
        <Text variant="caption" className="mt-0.5 text-gray-400" numberOfLines={1}>
          {restaurant.cuisines.join(' • ')}
        </Text>
        <View className="mt-1 flex-row items-center">
          <Ionicons name="star" size={11} color={colors.warning[500]} />
          <Text variant="caption" className="ml-0.5 font-bold text-warning-700">
            {/* No reviews is New, not zero — see RestaurantRating. */}
            {restaurant.reviewCount === 0
              ? t('restaurant.newRating')
              : restaurant.rating.toFixed(1)}
          </Text>
          <Dot />
          <Text variant="caption" className="text-gray-500">
            {t('restaurant.deliveryEstimate', {
              min: restaurant.deliveryEstimate.minMinutes,
              max: restaurant.deliveryEstimate.maxMinutes,
            })}
          </Text>
          <Dot />
          <Text variant="caption" className="text-gray-500">
            {fee}
          </Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={16} color={colors.gray[300]} />
    </Pressable>
  );
}

function Dot() {
  return (
    <Text variant="caption" className="mx-1.5 text-gray-300">
      •
    </Text>
  );
}
