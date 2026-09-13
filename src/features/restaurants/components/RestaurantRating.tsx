import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { colors } from '@/theme';

type RestaurantRatingProps = {
  rating: number;
  reviewCount: number;
};

/**
 * One line under the name, the way the chosen design has it: a star, the
 * number, the count. It used to be a heading-sized block with five stars —
 * the biggest thing on a page that is about the Restaurant, not its score.
 *
 * A Restaurant nobody has reviewed is **New**, not 0.0: every Restaurant in
 * the pilot starts there, and the worst score on the scale is not what the
 * first customers should read about all of them.
 */
export function RestaurantRating({ rating, reviewCount }: RestaurantRatingProps) {
  const { t } = useTranslation();

  if (reviewCount === 0) {
    return (
      <View className="flex-row items-center">
        <Text variant="label" className="text-primary-600">
          {t('restaurant.newRating')}
        </Text>
        <Text variant="caption" className="ml-2 text-gray-400">
          {t('restaurant.noReviewsYet')}
        </Text>
      </View>
    );
  }

  return (
    <View
      className="flex-row items-center"
      accessibilityLabel={t('restaurant.ratingOutOfFive', { rating: rating.toFixed(1) })}
    >
      <Ionicons name="star" size={14} color={colors.warning[500]} />
      <Text variant="label" className="ml-1 text-gray-900">
        {rating.toFixed(1)}
      </Text>
      <Text variant="caption" className="ml-1 text-gray-400">
        {t('restaurant.reviewCount', { count: reviewCount })}
      </Text>
    </View>
  );
}
