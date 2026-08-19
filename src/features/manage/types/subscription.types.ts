import { z } from 'zod';

export const SUBSCRIPTION_STATUSES = ['trialing', 'active', 'past_due', 'cancelled'] as const;

export const subscriptionSchema = z.object({
  planCode: z.string(),
  planName: z.string(),
  priceMinor: z.number().int(),
  currency: z.string(),
  interval: z.enum(['month', 'year']),
  status: z.enum(SUBSCRIPTION_STATUSES),
  /** Null once the trial has ended, or if there never was one. */
  trialEndsAt: z.string().nullable(),
  currentPeriodStart: z.string(),
  currentPeriodEnd: z.string(),
});

export type Subscription = z.infer<typeof subscriptionSchema>;
