import { z } from 'zod';

/**
 * The whole of what t5 asks for. Everything else the API wants — the fee, the
 * estimate, the description — is defaulted server-side, because a brand new
 * owner has no evidence for any of it.
 */
export const claimFormSchema = z.object({
  name: z.string().trim().min(1).max(80),
});

export type ClaimFormValues = z.infer<typeof claimFormSchema>;
