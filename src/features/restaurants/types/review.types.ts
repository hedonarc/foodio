import { z } from 'zod';

import { restaurantReviewSchema } from './restaurant.types';

export const REVIEW_RATING_MIN = 1;
export const REVIEW_RATING_MAX = 5;
export const REVIEW_COMMENT_MAX = 1000;

/**
 * `POST /orders/:orderId/review`. The order names the restaurant, the token
 * names the author — so the body carries neither. Mirrors the backend's
 * `newReviewSchema` bounds exactly.
 */
export const newReviewSchema = z.object({
  rating: z.number().int().min(REVIEW_RATING_MIN).max(REVIEW_RATING_MAX),
  comment: z.string().max(REVIEW_COMMENT_MAX).optional(),
});

/** A posted review: the embedded shape plus the ids that anchor it. */
export const reviewSchema = restaurantReviewSchema.extend({
  restaurantId: z.string(),
  orderId: z.string(),
});

export const reviewListSchema = z.array(reviewSchema);

/**
 * What the sheet collects. `comment` stays a plain string while typing;
 * `toNewReview` drops it from the payload when it is only whitespace.
 */
export const reviewFormSchema = z.object({
  rating: z.number().int().min(REVIEW_RATING_MIN).max(REVIEW_RATING_MAX),
  comment: z.string().trim().max(REVIEW_COMMENT_MAX),
});

export type NewReview = z.infer<typeof newReviewSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export function toNewReview(values: ReviewFormValues): NewReview {
  const comment = values.comment.trim();
  return { rating: values.rating, ...(comment ? { comment } : {}) };
}
