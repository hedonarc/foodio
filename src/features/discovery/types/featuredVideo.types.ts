import { z } from 'zod';

/** No video URL yet — the "video" carousel is currently thumbnails only. */
export const featuredVideoSchema = z.object({
  id: z.string(),
  restaurantId: z.string(),
  restaurantName: z.string(),
  title: z.string(),
  thumbnail: z.string(),
});

export const featuredVideoListSchema = z.array(featuredVideoSchema);

export type FeaturedVideo = z.infer<typeof featuredVideoSchema>;
