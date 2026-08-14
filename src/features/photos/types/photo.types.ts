import { z } from 'zod';

/**
 * The three the bucket accepts. Anything else is refused at presign, before the
 * owner spends their upload allowance finding out.
 */
export const PHOTO_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export type PhotoContentType = (typeof PHOTO_CONTENT_TYPES)[number];

export const signedUploadSchema = z.object({
  /** Absolute. PUT the bytes here, with no Authorization header. */
  uploadUrl: z.string(),
  /** Goes into `image` once the bytes have landed. */
  publicUrl: z.string(),
  path: z.string(),
  expiresAt: z.string(),
});

export type SignedUpload = z.infer<typeof signedUploadSchema>;
