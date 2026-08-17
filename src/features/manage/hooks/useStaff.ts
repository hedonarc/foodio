import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';

import { fetchStaff, mintJoinCode, revokeCapability } from '../api/staff.api';
import type { StaffMember } from '../types/staff.types';

export function useStaff(restaurantId: string) {
  return useQuery({
    queryKey: queryKeys.staff.byRestaurant(restaurantId),
    queryFn: () => fetchStaff(restaurantId),
    enabled: restaurantId !== '',
  });
}

/**
 * Not optimistic. Revoking someone's access is the kind of thing you want to
 * see confirmed rather than assumed, and the server has three refusals of its
 * own — the owner's kitchen, the last kitchen, and a capability they never
 * held. Guessing the answer here would mean guessing those too.
 */
export function useRevokeCapability(restaurantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeCapability,
    onSuccess: (roster: StaffMember[]) => {
      queryClient.setQueryData(queryKeys.staff.byRestaurant(restaurantId), roster);
    },
  });
}

/**
 * Minting does not change the roster — nobody has joined yet. The list is left
 * alone deliberately: showing a pending row would claim something that has not
 * happened, and there is no way to withdraw a code once minted.
 */
export function useMintJoinCode() {
  return useMutation({ mutationFn: mintJoinCode });
}
