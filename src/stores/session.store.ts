import { create } from 'zustand';

import type { ActiveRole, Person } from '@/features/identity/types/identity.types';
import { CUSTOMER_ROLE, resolveRole } from '@/features/identity/types/identity.types';
import {
  getSessionToken,
  getStoredRole,
  setSessionToken,
  setStoredRole,
} from '@/services/storage/session.storage';

type SessionState = {
  token: string | null;
  person: Person | null;
  role: ActiveRole;
  /** Splash until this is true, so no screen renders against an unknown identity. */
  isHydrated: boolean;

  hydrate: (resolvePerson: (token: string) => Promise<Person | null>) => Promise<void>;
  signIn: (token: string, person: Person) => Promise<void>;
  signOut: () => Promise<void>;
  setRole: (role: ActiveRole) => Promise<void>;
};

const encodeRole = (role: ActiveRole): string =>
  role.kind === 'customer' ? 'customer' : `${role.kind}:${role.restaurantId}`;

/** Tolerates anything: a malformed value simply means ordering. */
export function decodeRole(value: string | null): ActiveRole | null {
  if (!value) return null;
  if (value === 'customer') return CUSTOMER_ROLE;

  const [kind, restaurantId] = value.split(':');
  if (!restaurantId) return null;
  if (kind !== 'serve' && kind !== 'deliver') return null;

  return { kind, restaurantId };
}

export const useSessionStore = create<SessionState>((set, get) => ({
  token: null,
  person: null,
  role: CUSTOMER_ROLE,
  isHydrated: false,

  hydrate: async (resolvePerson) => {
    const token = await getSessionToken();
    const person = token ? await resolvePerson(token) : null;

    // A token whose person no longer resolves is not a session.
    if (!person) {
      set({ token: null, person: null, role: CUSTOMER_ROLE, isHydrated: true });
      return;
    }

    const role = resolveRole(person, decodeRole(await getStoredRole()));
    set({ token, person, role, isHydrated: true });
  },

  signIn: async (token, person) => {
    await setSessionToken(token);
    await setStoredRole(null);
    set({ token, person, role: CUSTOMER_ROLE });
  },

  signOut: async () => {
    await setSessionToken(null);
    await setStoredRole(null);
    set({ token: null, person: null, role: CUSTOMER_ROLE });
  },

  setRole: async (role) => {
    // Never trust a role the person no longer holds.
    const allowed = resolveRole(get().person, role);
    await setStoredRole(encodeRole(allowed));
    set({ role: allowed });
  },
}));

export const selectIsSignedIn = (state: SessionState): boolean => state.person !== null;
