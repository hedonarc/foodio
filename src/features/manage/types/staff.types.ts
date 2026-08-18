import { z } from 'zod';

export const capabilitySchema = z.enum(['kitchen', 'delivery']);

export type Capability = z.infer<typeof capabilitySchema>;

export const staffMemberSchema = z.object({
  personId: z.string(),
  displayName: z.string(),
  phone: z.string(),
  capabilities: z.array(capabilitySchema),
  /** Exactly one member of any roster. Their kitchen access cannot be revoked. */
  isOwner: z.boolean(),
});

export const staffListSchema = z.array(staffMemberSchema);

export type StaffMember = z.infer<typeof staffMemberSchema>;

export const joinCodeSchema = z.object({
  code: z.string(),
  capability: capabilitySchema,
  expiresAt: z.string(),
});

export type JoinCode = z.infer<typeof joinCodeSchema>;
