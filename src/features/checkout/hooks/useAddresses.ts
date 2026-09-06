import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { useSessionStore } from '@/stores/session.store';

import { createAddress, deleteAddress, fetchAddresses, updateAddress } from '../api/address.api';
import type { DeliveryAddress } from '../types/address.types';

/** Addresses belong to a Person: signed out there is nothing to ask for. */
export function useAddresses() {
  const isSignedIn = useSessionStore((state) => state.person !== null);

  return useQuery({
    queryKey: queryKeys.addresses.list(),
    queryFn: isSignedIn ? fetchAddresses : skipToken,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAddress,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ addressId, address }: { addressId: string; address: DeliveryAddress }) =>
      updateAddress(addressId, address),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
    },
  });
}
