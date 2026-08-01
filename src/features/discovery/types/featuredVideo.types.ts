import { z } from 'zod';

/**
 * A promoted clip for a restaurant.
 *
 * Note the absence of a video URL: today this only carries a thumbnail, so the
 * "featured video" carousel is really a featured *image* carousel. Playback is
 * not part of the v2.0 ordering spine.
 */
export const featuredVideoSchema = z.object({
  id: z.string(),
  restaurantId: z.string(),
  restaurantName: z.string(),
  title: z.string(),
  thumbnail: z.string(),
});

export const featuredVideoListSchema = z.array(featuredVideoSchema);

export type FeaturedVideo = z.infer<typeof featuredVideoSchema>;
