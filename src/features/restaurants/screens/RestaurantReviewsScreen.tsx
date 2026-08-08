import { View } from 'react-native';

import { useLocalSearchParams } from 'expo-router';

import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';

import { EmptyState, ErrorState, LoadingState, ScreenHeader } from '@/components/shared';

import { ReviewCard } from '../components/ReviewCard';
import { useRestaurantReviews } from '../hooks/useRestaurantReviews';

/** Every review, newest first, a page at a time. */
export function RestaurantReviewsScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: reviews,
    isPending,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRestaurantReviews(id ?? '');

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title={t('restaurant.reviewsTitle')} />

      {isPending ? <LoadingState className="flex-1 items-center justify-center" /> : null}
      {error ? (
        <ErrorState
          error={error}
          onRetry={refetch}
          className="flex-1 items-center justify-center px-8"
        />
      ) : null}
      {!isPending && !error && reviews?.length === 0 ? (
        <EmptyState
          message={t('restaurant.noReviews')}
          className="flex-1 items-center justify-center px-8"
        />
      ) : null}

      {reviews && reviews.length > 0 ? (
        <FlashList
          data={reviews}
          keyExtractor={(review) => review.id}
          contentContainerClassName="px-4 pb-8 pt-2"
          onEndReached={() => {
            if (hasNextPage) void fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? <LoadingState /> : null}
          renderItem={({ item: review }) => <ReviewCard review={review} />}
        />
      ) : null}
    </View>
  );
}
