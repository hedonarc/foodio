import { Pressable, View } from 'react-native';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { colors } from '@/theme';

import type { RestaurantReview } from '../types/restaurant.types';

import { ReviewCard } from './ReviewCard';

type RestaurantReviewPreviewProps = {
  restaurantId: string;
  reviews: RestaurantReview[];
};

/** The newest few reviews, and the door into all of them. */
export function RestaurantReviewPreview({ restaurantId, reviews }: RestaurantReviewPreviewProps) {
  const { t } = useTranslation();
  const router = useRouter();

  if (reviews.length === 0) return null;

  return (
    <View className="px-4 pb-8">
      <View className="mb-3 flex-row items-center justify-between">
        <Text variant="bodyMedium" className="text-gray-900">
          {t('restaurant.recentReviews')}
        </Text>
        <Pressable
          onPress={() => router.push(`/restaurant/${restaurantId}/reviews`)}
          accessibilityRole="button"
          className="flex-row items-center active:opacity-70"
        >
          <Text variant="label" className="text-primary-700">
            {t('restaurant.seeAllReviews')}
          </Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary[700]} />
        </Pressable>
      </View>
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </View>
  );
}
