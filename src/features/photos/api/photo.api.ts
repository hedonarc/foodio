import axios from 'axios';

import { apiClient } from '@/api/client';
import { parseResponse } from '@/api/parse';

import type { PhotoContentType, SignedUpload } from '../types/photo.types';
import { signedUploadSchema } from '../types/photo.types';

export type SignPhotoUpload = {
  restaurantId: string;
  contentType: PhotoContentType;
  /** Present for a dish photograph, absent for the restaurant's own. */
  menuItemId?: string;
};

export async function signPhotoUpload({
  restaurantId,
  contentType,
  menuItemId,
}: SignPhotoUpload): Promise<SignedUpload> {
  const endpoint = `/restaurants/${restaurantId}/photo-uploads`;
  const { data } = await apiClient.post<unknown>(endpoint, { contentType, menuItemId });
  return parseResponse(signedUploadSchema, data, `POST ${endpoint}`);
}

/**
 * Straight to object storage, deliberately **not** through `apiClient`.
 *
 * The signed URL carries its own scoped token, and sending Foodio's bearer
 * token to a third-party host would leak it. This is also why bytes never touch
 * our API at all — see ADR-0012 and ADR-0015.
 */
export async function uploadPhoto(
  upload: SignedUpload,
  file: Blob,
  contentType: PhotoContentType,
): Promise<void> {
  await axios.put(upload.uploadUrl, file, { headers: { 'Content-Type': contentType } });
}
