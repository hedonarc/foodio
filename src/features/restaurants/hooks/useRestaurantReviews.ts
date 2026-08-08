import { useInfiniteQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';

import { fetchRestaurantReviewsPage } from '../api/review.api';

export function useRestaurantReviews(restaurantId: string) {
  const query = useInfiniteQuery({
    queryKey: queryKeys.reviews.byRestaurant(restaurantId),
    queryFn: ({ pageParam }) => fetchRestaurantReviewsPage(restaurantId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  return { ...query, data: query.data?.pages.flatMap((page) => page.items) };
}
