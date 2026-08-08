import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { submitOrderReview } from '@/features/restaurants/api/review.api';
import type { NewReview } from '@/features/restaurants/types/review.types';
import { useRatedOrdersStore } from '@/stores/ratedOrders.store';

import { isAlreadyReviewed } from '../lib/reviewSubmission';

export function useSubmitReview() {
  const queryClient = useQueryClient();
  const markRated = useRatedOrdersStore((state) => state.markRated);

  return useMutation({
    mutationFn: ({ orderId, review }: { orderId: string; review: NewReview }) =>
      submitOrderReview(orderId, review),
    onSuccess: (review, { orderId }) => {
      markRated(orderId);
      // The write moved the aggregate and the list — both caches are stale.
      void queryClient.invalidateQueries({
        queryKey: queryKeys.restaurants.detail(review.restaurantId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.byRestaurant(review.restaurantId),
      });
    },
    onError: (error, { orderId }) => {
      // A 409 is the server saying "already rated" — a state, not a failure.
      if (isAlreadyReviewed(error)) markRated(orderId);
    },
  });
}
