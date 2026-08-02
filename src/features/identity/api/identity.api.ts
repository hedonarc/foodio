import { apiClient } from '@/api/client';
import { parseResponse } from '@/api/parse';

import type { Person, Session } from '../types/identity.types';
import { personListSchema, sessionSchema } from '../types/identity.types';

export async function fetchPeople(): Promise<Person[]> {
  const { data } = await apiClient.get<unknown>('/people');
  return parseResponse(personListSchema, data, 'GET /people');
}

/** Issued, never verified — but issued by the server, which is the point. */
export async function createSession(personId: string): Promise<Session> {
  const { data } = await apiClient.post<unknown>('/sessions', { personId });
  return parseResponse(sessionSchema, data, 'POST /sessions');
}
