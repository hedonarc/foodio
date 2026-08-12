/**
 * PROTOTYPE — throwaway. Not wired into onboarding, not production code.
 *
 * Answers Wayfinder ticket t8, "Setting the location and the delivery area".
 * Three structurally different takes on the same job, switchable from the bar
 * at the bottom. See `app/prototype-location.tsx`.
 */
import type { Coordinates } from '@/utils/distance';

export const LAHORE: Coordinates = { latitude: 31.5204, longitude: 74.3587 };

export const MIN_RADIUS_M = 500;
export const MAX_RADIUS_M = 15_000;
export const DEFAULT_RADIUS_M = 3_000;

/** Hand-placed and approximate — enough to make a radius mean something. */
export const LANDMARKS: readonly { name: string; at: Coordinates }[] = [
  { name: 'Gulberg', at: { latitude: 31.5203, longitude: 74.3453 } },
  { name: 'Model Town', at: { latitude: 31.4841, longitude: 74.3223 } },
  { name: 'Johar Town', at: { latitude: 31.4697, longitude: 74.2728 } },
  { name: 'DHA Phase 5', at: { latitude: 31.4704, longitude: 74.4022 } },
  { name: 'Anarkali', at: { latitude: 31.5691, longitude: 74.3103 } },
  { name: 'Bahria Town', at: { latitude: 31.3668, longitude: 74.1836 } },
];

export const formatRadius = (meters: number): string =>
  meters < 1_000 ? `${meters} m` : `${(meters / 1_000).toFixed(1).replace(/\.0$/, '')} km`;
