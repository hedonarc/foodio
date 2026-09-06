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
 * A Restaurant nobody has reviewed is **New**, not 0.0.
 *
 * Zero reviews used to render as the worst score the scale has, under five
 * empty stars — and every Restaurant in the pilot starts there, so that is what
 * the first customers would read about all of them. `New` occupies the same
 * block at the same weight, so nothing moves when the first review lands.
 */
export function RestaurantRating({ rating, reviewCount }: RestaurantRatingProps) {
  const { t } = useTranslation();

  if (reviewCount === 0) {
    return (
      <View className="flex-row items-center border-t border-gray-100 px-4 py-3">
        <Text variant="heading" className="mr-2 text-gray-900">
          {t('restaurant.newRating')}
        </Text>
        <Text variant="caption" className="text-gray-400">
          {t('restaurant.noReviewsYet')}
        </Text>
      </View>
    );
  }

  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <View className="flex-row items-center px-4 py-3 border-t border-gray-100">
      <Text variant="heading" className="text-gray-900 mr-2">
        {rating.toFixed(1)}
      </Text>
      <View className="flex-row items-center mr-2">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Ionicons key={`full-${i}`} name="star" size={16} color={colors.warning[500]} />
        ))}
        {hasHalf && <Ionicons name="star-half" size={16} color={colors.warning[500]} />}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Ionicons key={`empty-${i}`} name="star-outline" size={16} color={colors.gray[300]} />
        ))}
      </View>
      <Text variant="caption" className="text-gray-400">
        {t('restaurant.reviewCount', { count: reviewCount })}
      </Text>
    </View>
  );
}
