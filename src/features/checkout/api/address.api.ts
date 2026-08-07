import { apiClient } from '@/api/client';
import { parseResponse } from '@/api/parse';

import type { DeliveryAddress, SavedAddress } from '../types/address.types';
import { savedAddressListSchema, savedAddressSchema } from '../types/address.types';

export async function fetchAddresses(): Promise<SavedAddress[]> {
  const { data } = await apiClient.get<unknown>('/me/addresses');
  return parseResponse(savedAddressListSchema, data, 'GET /me/addresses');
}

export async function createAddress(address: DeliveryAddress): Promise<SavedAddress> {
  const { data } = await apiClient.post<unknown>('/me/addresses', address);
  return parseResponse(savedAddressSchema, data, 'POST /me/addresses');
}

/** A full replacement, not a diff — the edit form always sends every field. */
export async function updateAddress(
  addressId: string,
  address: DeliveryAddress,
): Promise<SavedAddress> {
  const endpoint = `/me/addresses/${addressId}`;
  const { data } = await apiClient.patch<unknown>(endpoint, address);
  return parseResponse(savedAddressSchema, data, `PATCH ${endpoint}`);
}

export async function deleteAddress(addressId: string): Promise<void> {
  await apiClient.delete<unknown>(`/me/addresses/${addressId}`);
}
