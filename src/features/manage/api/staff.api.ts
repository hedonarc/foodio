import { apiClient } from '@/api/client';
import { parseResponse } from '@/api/parse';

import type { Capability, JoinCode, StaffMember } from '../types/staff.types';
import { joinCodeSchema, staffListSchema } from '../types/staff.types';

export async function fetchStaff(restaurantId: string): Promise<StaffMember[]> {
  const endpoint = `/restaurants/${restaurantId}/staff`;
  const { data } = await apiClient.get<unknown>(endpoint);
  return parseResponse(staffListSchema, data, `GET ${endpoint}`);
}

export type RevokeCapability = {
  restaurantId: string;
  personId: string;
  capability: Capability;
};

/** Returns the refreshed roster: the screen that revoked sees the new truth. */
export async function revokeCapability({
  restaurantId,
  personId,
  capability,
}: RevokeCapability): Promise<StaffMember[]> {
  const endpoint = `/restaurants/${restaurantId}/staff/${personId}/${capability}`;
  const { data } = await apiClient.delete<unknown>(endpoint);
  return parseResponse(staffListSchema, data, `DELETE ${endpoint}`);
}

export type MintJoinCode = { restaurantId: string; capability: Capability };

export async function mintJoinCode({ restaurantId, capability }: MintJoinCode): Promise<JoinCode> {
  const endpoint = `/restaurants/${restaurantId}/join-codes`;
  const { data } = await apiClient.post<unknown>(endpoint, { capability });
  return parseResponse(joinCodeSchema, data, `POST ${endpoint}`);
}
