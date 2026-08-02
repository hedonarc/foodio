import { z } from 'zod';

/**
 * A customer's Clip carries the Order it came from, so "verified" is structural
 * — there is no flag that can disagree with reality, and a Clip with no Order
 * cannot claim to be a receipt.
 */
export const clipAuthorSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('restaurant') }),
  z.object({
    kind: z.literal('customer'),
    orderId: z.string(),
    displayName: z.string(),
  }),
]);

export const clipSchema = z.object({
  id: z.string(),
  restaurantId: z.string(),
  /** Denormalised: the feed card needs it and json-server cannot join. */
  restaurantName: z.string(),
  /** Present when the Clip is about one dish — lets a Menu Item show ours beside theirs. */
  menuItemId: z.string().optional(),
  /** Progressive MP4 — iOS cannot cache HLS. See docs/adr/0005. */
  mediaUrl: z.string(),
  /** Shown while the media buffers. */
  thumbnailUrl: z.string(),
  caption: z.string(),
  durationSeconds: z.number().int().positive(),
  postedAt: z.string(),
  author: clipAuthorSchema,
});

export const clipListSchema = z.array(clipSchema);

export type ClipAuthor = z.infer<typeof clipAuthorSchema>;
export type Clip = z.infer<typeof clipSchema>;

export const isCustomerClip = (clip: Clip): boolean => clip.author.kind === 'customer';
