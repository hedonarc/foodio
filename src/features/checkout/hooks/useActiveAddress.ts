import { useActiveAddressStore } from '@/stores/activeAddress.store';

import { resolveActiveAddress } from '../lib/activeAddress';
import type { SavedAddress } from '../types/address.types';

import { useAddresses } from './useAddresses';

type ActiveAddress = {
  address: SavedAddress | null;
  isLoading: boolean;
  error: unknown;
};

/** The saved address Checkout uses right now. See `resolveActiveAddress` for the rule. */
export function useActiveAddress(): ActiveAddress {
  const { data, isPending, error } = useAddresses();
  const activeAddressId = useActiveAddressStore((state) => state.activeAddressId);

  return {
    address: resolveActiveAddress(data ?? [], activeAddressId),
    isLoading: isPending,
    error,
  };
}
