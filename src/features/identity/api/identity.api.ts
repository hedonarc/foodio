import { apiClient } from '@/api/client';
import { parseResponse } from '@/api/parse';

import type { Person, Session } from '../types/identity.types';
import { personSchema, sessionSchema } from '../types/identity.types';

/** `202`: the code was sent. The server says nothing about whether the phone is known. */
export async function requestOtp(phone: string): Promise<void> {
  await apiClient.post<unknown>('/auth/otp', { phone });
}

export async function verifyOtp(
  phone: string,
  code: string,
  displayName?: string,
): Promise<Session> {
  const { data } = await apiClient.post<unknown>('/auth/verify', {
    phone,
    code,
    ...(displayName ? { displayName } : {}),
  });
  return parseResponse(sessionSchema, data, 'POST /auth/verify');
}

/**
 * The client never attaches an access token to `/auth/*` (see `api/client.ts`),
 * so a stale one from the old session cannot be presented — and rejected —
 * here.
 */
export async function refreshSession(refreshToken: string): Promise<Session> {
  const { data } = await apiClient.post<unknown>('/auth/refresh', { refreshToken });
  return parseResponse(sessionSchema, data, 'POST /auth/refresh');
}

/** Revokes the whole token family server-side. Best-effort: local sign-out never waits on it. */
export async function signOutSession(refreshToken: string): Promise<void> {
  await apiClient.post<unknown>('/auth/sign-out', { refreshToken });
}

export async function fetchMe(): Promise<Person> {
  const { data } = await apiClient.get<unknown>('/me');
  return parseResponse(personSchema, data, 'GET /me');
}

export async function updateMe(displayName: string): Promise<Person> {
  const { data } = await apiClient.patch<unknown>('/me', { displayName });
  return parseResponse(personSchema, data, 'PATCH /me');
}
