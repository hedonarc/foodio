import { z } from 'zod';

export const openingHoursSchema = z.object({
  /** 0 is Sunday, matching Date#getDay(). */
  dayOfWeek: z.number().int().min(0).max(6),
  /** 24-hour `HH:mm`. */
  opensAt: z.string(),
  closesAt: z.string(),
});

export const restaurantReviewSchema = z.object({
  id: z.string(),
  author: z.string(),
  avatar: z.string(),
  rating: z.number(),
  comment: z.string(),
  /** ISO 8601 date. */
  postedAt: z.string(),
});

export const deliveryEstimateSchema = z.object({
  minMinutes: z.number().int(),
  maxMinutes: z.number().int(),
});

/**
 * What a restaurant list needs to know. The detail response is a superset, so
 * the two can never drift apart the way parallel hand-written types do.
 */
export const restaurantSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  cuisines: z.array(z.string()),
  rating: z.number(),
  reviewCount: z.number().int(),
  /** ISO 4217. Every price on this restaurant is denominated in it. */
  currency: z.string(),
  deliveryFeeMinor: z.number().int(),
  deliveryEstimate: deliveryEstimateSchema,
  latitude: z.number(),
  longitude: z.number(),
  /** How far this restaurant's own staff are willing to deliver. */
  deliveryRadiusMeters: z.number().int(),
  image: z.string(),
});

export const restaurantSchema = restaurantSummarySchema.extend({
  description: z.string(),
  address: z.string(),
  gallery: z.array(z.string()),
  openingHours: z.array(openingHoursSchema),
  reviews: z.array(restaurantReviewSchema),
});

export const restaurantSummaryListSchema = z.array(restaurantSummarySchema);

export type DeliveryEstimate = z.infer<typeof deliveryEstimateSchema>;
export type RestaurantReview = z.infer<typeof restaurantReviewSchema>;
export type RestaurantSummary = z.infer<typeof restaurantSummarySchema>;
export type Restaurant = z.infer<typeof restaurantSchema>;
