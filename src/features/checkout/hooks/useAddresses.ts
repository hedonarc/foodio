import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';

import { createAddress, deleteAddress, fetchAddresses, updateAddress } from '../api/address.api';
import type { DeliveryAddress } from '../types/address.types';

export function useAddresses() {
  return useQuery({
    queryKey: queryKeys.addresses.list(),
    queryFn: fetchAddresses,
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
