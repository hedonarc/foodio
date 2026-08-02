export { createSession, fetchPeople } from './api/identity.api';
export { usePeople } from './hooks/usePeople';
export { IdentityPickerScreen } from './screens/IdentityPickerScreen';
export type {
  ActiveRole,
  Capability,
  Entitlement,
  Person,
  RoleOption,
  Session,
} from './types/identity.types';
export { CUSTOMER_ROLE, resolveRole, roleOptionsFor, sameRole } from './types/identity.types';
