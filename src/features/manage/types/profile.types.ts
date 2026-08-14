import { z } from 'zod';

/**
 * Mirrors the server's `updateRestaurantSchema` for the fields this screen
 * owns. Money is entered in rupees and stored in minor units, so the form
 * carries strings and the conversion happens once, on the way out.
 */
export const profileFormSchema = z
  .object({
    name: z.string().trim().min(1, 'A restaurant needs a name.').max(120),
    description: z.string().trim().max(1000),
    address: z.string().trim().min(1, 'Customers need somewhere to find you.').max(300),
    /** Comma-separated in the field, an array on the wire. */
    cuisines: z.string().trim().min(1, 'Name at least one kind of food.'),
    deliveryFee: z
      .string()
      .trim()
      .regex(/^\d+(\.\d{1,2})?$/, 'Use a number, like 120 or 120.50.'),
    minMinutes: z.string().trim().regex(/^\d+$/, 'Whole minutes only.'),
    maxMinutes: z.string().trim().regex(/^\d+$/, 'Whole minutes only.'),
  })
  .refine((values) => Number(values.minMinutes) <= Number(values.maxMinutes), {
    message: 'The fastest time cannot be later than the slowest.',
    path: ['maxMinutes'],
  })
  .refine((values) => Number(values.minMinutes) > 0, {
    message: 'Give customers a real estimate.',
    path: ['minMinutes'],
  });

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
