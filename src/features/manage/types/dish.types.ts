import { z } from 'zod';

/** Mirrors the server's `createMenuItemSchema` for the fields this form owns. */
export const dishFormSchema = z.object({
  name: z.string().trim().min(1, 'A dish needs a name.').max(80),
  description: z.string().trim().max(600),
  /** Rupees in the field, minor units on the wire. */
  price: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, 'Use a number, like 450 or 450.50.'),
  menuCategoryId: z.string().min(1, 'Choose a section.'),
});

export type DishFormValues = z.infer<typeof dishFormSchema>;
