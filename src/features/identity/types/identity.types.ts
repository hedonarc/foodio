import { z } from 'zod';

/** What a person may do at one Restaurant. See docs/adr/0003 — never shared. */
export const CAPABILITIES = ['serve', 'deliver'] as const;

export const capabilitySchema = z.enum(CAPABILITIES);

export const entitlementSchema = z.object({
  restaurantId: z.string(),
  capabilities: z.array(capabilitySchema).nonempty(),
});

export const personSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  /** Empty means customer — the baseline, not a row. */
  entitlements: z.array(entitlementSchema),
});

export const personListSchema = z.array(personSchema);

export const sessionSchema = z.object({
  /** A name badge, not a credential: nothing signs or verifies it. */
  token: z.string(),
  person: personSchema,
});

export type Capability = z.infer<typeof capabilitySchema>;
export type Entitlement = z.infer<typeof entitlementSchema>;
export type Person = z.infer<typeof personSchema>;
export type Session = z.infer<typeof sessionSchema>;

/**
 * What the person is currently acting as. `customer` needs no restaurant —
 * everyone can order, which is why it is the baseline rather than a row.
 */
export type ActiveRole =
  | { kind: 'customer' }
  | { kind: 'serve'; restaurantId: string }
  | { kind: 'deliver'; restaurantId: string };

export const CUSTOMER_ROLE: ActiveRole = { kind: 'customer' };

/** One entry per capability: serving and delivering are different jobs. */
export type RoleOption = {
  role: ActiveRole;
  restaurantId: string | null;
};

export function roleOptionsFor(person: Person): RoleOption[] {
  const fromEntitlements = person.entitlements.flatMap((entitlement) =>
    entitlement.capabilities.map((capability) => ({
      role: { kind: capability, restaurantId: entitlement.restaurantId } as ActiveRole,
      restaurantId: entitlement.restaurantId,
    })),
  );

  return [{ role: CUSTOMER_ROLE, restaurantId: null }, ...fromEntitlements];
}

export function sameRole(a: ActiveRole, b: ActiveRole): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === 'customer' || b.kind === 'customer') return true;
  return a.restaurantId === b.restaurantId;
}

/** A remembered role the person no longer holds falls back to ordering. */
export function resolveRole(person: Person | null, remembered: ActiveRole | null): ActiveRole {
  if (!person || !remembered || remembered.kind === 'customer') return CUSTOMER_ROLE;

  const held = person.entitlements.some(
    (entitlement) =>
      entitlement.restaurantId === remembered.restaurantId &&
      entitlement.capabilities.includes(remembered.kind),
  );

  return held ? remembered : CUSTOMER_ROLE;
}
