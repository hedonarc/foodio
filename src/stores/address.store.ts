import { create } from 'zustand';

import type { DeliveryAddress } from '@/features/checkout';

type AddressState = {
  address: DeliveryAddress | null;
  setAddress: (address: DeliveryAddress) => void;
  clearAddress: () => void;
};

/** Client state: a draft until it is copied onto an Order. */
export const useAddressStore = create<AddressState>((set) => ({
  address: null,
  setAddress: (address) => set({ address }),
  clearAddress: () => set({ address: null }),
}));
