import { z } from 'zod';

/**
 * Where in one Restaurant a person may work. See docs/adr/0003 — never shared.
 * Nouns, not verbs: an entitlement names a place you belong to, and the switcher
 * reads "Taco Fiesta · Kitchen" rather than joining a place to an activity.
 */
export const CAPABILITIES = ['kitchen', 'delivery'] as const;

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

/**
 * E.164. Phone is the identity in this market — see backend ADR-0007. Stored
 * and compared in this exact form, so the client normalises before sending.
 */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{7,14}$/);

export const otpCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/);

export const otpRequestFormSchema = z.object({
  phone: phoneSchema,
});

export const otpVerifyFormSchema = z.object({
  phone: phoneSchema,
  code: otpCodeSchema,
  /**
   * Only asked for, and only sent, on a phone's first sign-in — every
   * returning user leaves this blank. No `.min(1)`: a blank TextField reports
   * its value as `''`, not `undefined`, and `.min(1)` rejected that outright —
   * silently blocking the whole form from submitting, since nothing surfaced
   * the error for a field with no visible error text. The call site already
   * turns a falsy `displayName` into `undefined` before it reaches the
   * network, so an empty string reaching here is harmless.
   */
  displayName: z.string().trim().max(60).optional(),
});

export type OtpRequestFormValues = z.infer<typeof otpRequestFormSchema>;
export type OtpVerifyFormValues = z.infer<typeof otpVerifyFormSchema>;

/** Replaces the mock's `{ token, person }` — see backend ADR-0007. */
export const sessionSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
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
  | { kind: 'kitchen'; restaurantId: string }
  | { kind: 'delivery'; restaurantId: string };

export const CUSTOMER_ROLE: ActiveRole = { kind: 'customer' };

/** One entry per capability: the kitchen and delivery are different jobs. */
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

/** A remembered role the person no longer holds falls back to customer. */
export function resolveRole(person: Person | null, remembered: ActiveRole | null): ActiveRole {
  if (!person || !remembered || remembered.kind === 'customer') return CUSTOMER_ROLE;

  const held = person.entitlements.some(
    (entitlement) =>
      entitlement.restaurantId === remembered.restaurantId &&
      entitlement.capabilities.includes(remembered.kind),
  );

  return held ? remembered : CUSTOMER_ROLE;
}
