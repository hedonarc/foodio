import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';

import { changePlan, fetchPlans } from '../api/plans.api';

/** The public catalogue. Priced-in-conversation tiers are not in it. */
export function usePlans() {
  return useQuery({ queryKey: queryKeys.plans.all, queryFn: fetchPlans });
}

export function useChangePlan(restaurantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planCode: string) => changePlan(restaurantId, planCode),
    onSuccess: (subscription) => {
      queryClient.setQueryData(queryKeys.subscription.byRestaurant(restaurantId), subscription);
    },
  });
}
