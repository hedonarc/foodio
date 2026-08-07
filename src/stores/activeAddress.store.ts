import { create } from 'zustand';

import { getActiveAddressId, setActiveAddressId } from '@/services/storage';

type ActiveAddressState = {
  /**
   * Which saved address Checkout uses right now — a device-local preference,
   * not server state: the backend has no concept of "active", only a list
   * (`GET /me/addresses`). Persisted the same way as the remembered role, so
   * it survives a relaunch; not gated on app start like session/onboarding
   * since nothing about navigation depends on it.
   */
  activeAddressId: string | null;
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  selectAddress: (addressId: string) => void;
};

export const useActiveAddressStore = create<ActiveAddressState>((set) => ({
  activeAddressId: null,
  isHydrated: false,

  hydrate: async () => {
    const activeAddressId = await getActiveAddressId();
    set({ activeAddressId, isHydrated: true });
  },

  selectAddress: (addressId) => {
    set({ activeAddressId: addressId });
    void setActiveAddressId(addressId);
  },
}));
