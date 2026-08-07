import * as SecureStore from 'expo-secure-store';

import { logError } from '@/lib/logger';

const ACTIVE_ADDRESS_ID_KEY = 'foodio_active_address_id';

export async function getActiveAddressId(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(ACTIVE_ADDRESS_ID_KEY);
  } catch (error) {
    logError('address.storage.get', error);
    return null;
  }
}

export async function setActiveAddressId(addressId: string | null): Promise<void> {
  try {
    if (addressId === null) await SecureStore.deleteItemAsync(ACTIVE_ADDRESS_ID_KEY);
    else await SecureStore.setItemAsync(ACTIVE_ADDRESS_ID_KEY, addressId);
  } catch (error) {
    logError('address.storage.set', error);
  }
}
