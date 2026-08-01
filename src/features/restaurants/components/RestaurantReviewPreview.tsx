import { View } from 'react-native';

import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { colors } from '@/theme';
import { formatDate } from '@/utils/date';

import type { RestaurantReview } from '../types/restaurant.types';

type RestaurantReviewPreviewProps = {
  reviews: RestaurantReview[];
};

export function RestaurantReviewPreview({ reviews }: RestaurantReviewPreviewProps) {
  const { t, i18n } = useTranslation();

  if (reviews.length === 0) return null;

  return (
    <View className="px-4 pb-8">
      <Text variant="bodyMedium" className="mb-3 text-gray-900">
        {t('restaurant.recentReviews')}
      </Text>
      {reviews.map((review) => (
        <View key={review.id} className="mb-3 rounded-2xl bg-gray-50 p-4 border border-gray-100">
          <View className="mb-2 flex-row items-center">
            <View className="h-9 w-9 overflow-hidden rounded-full bg-gray-200">
              <Image
                source={{ uri: review.avatar }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                accessibilityIgnoresInvertColors
              />
            </View>
            <View className="ml-3 flex-1">
              <Text variant="label" className="text-gray-900">
                {review.author}
              </Text>
              <Text variant="caption" className="text-gray-400">
                {formatDate(review.postedAt, i18n.language)}
              </Text>
            </View>
            <View
              className="flex-row items-center"
              accessibilityLabel={t('restaurant.ratingOutOfFive', { rating: review.rating })}
            >
              {Array.from({ length: review.rating }).map((_, index) => (
                <Ionicons key={index} name="star" size={12} color={colors.warning[500]} />
              ))}
            </View>
          </View>
          <Text variant="body" className="text-gray-600 text-sm leading-5">
            {review.comment}
          </Text>
        </View>
      ))}
    </View>
  );
}
