import { z } from 'zod';

export const deliveryAddressSchema = z.object({
  label: z.string().trim().min(1).max(40),
  line1: z.string().trim().min(1).max(120),
  line2: z.string().trim().max(120).optional(),
  city: z.string().trim().min(1).max(60),
  postcode: z.string().trim().min(1).max(12),
  notes: z.string().trim().max(200).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export type DeliveryAddress = z.infer<typeof deliveryAddressSchema>;

/** What the form collects. Coordinates come from the device, not typed in. */
export const addressFormSchema = deliveryAddressSchema.omit({
  latitude: true,
  longitude: true,
});

export type AddressFormValues = z.infer<typeof addressFormSchema>;
