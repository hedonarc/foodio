import type { SavedAddress } from '../types/address.types';

/**
 * Which saved address is active right now: the explicitly selected one, or
 * else the most recently saved one (the list's first row — the backend
 * returns them newest first), so a signed-in customer with saved addresses
 * is never stuck re-picking one before they can check out. `null` only when
 * nothing is saved at all — the same "add a delivery address" case Checkout
 * has always had.
 */
export function resolveActiveAddress(
  addresses: readonly SavedAddress[],
  activeAddressId: string | null,
): SavedAddress | null {
  const selected = addresses.find((address) => address.id === activeAddressId);
  return selected ?? addresses[0] ?? null;
}
