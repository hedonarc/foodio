import type { Coordinates } from '@/utils/distance';
import { distanceBetween } from '@/utils/distance';

/**
 * The radii a restaurant may choose from.
 *
 * A short list rather than a slider: t8 found a slider is a fiddly drag next to
 * a map that also wants drags, and the useful values are not a continuum. The
 * ceiling matches the server's own — anything above it is refused there.
 */
export const RADIUS_CHOICES = [500, 1_000, 2_000, 3_000, 5_000, 8_000, 12_000, 15_000] as const;

/** Where the map opens when a restaurant has no point of its own yet. */
export const LAHORE: Coordinates = { latitude: 31.5204, longitude: 74.3587 };

export const formatRadius = (meters: number): string =>
  meters < 1_000 ? `${meters} m` : `${(meters / 1_000).toFixed(1).replace(/\.0$/, '')} km`;

/**
 * The chips to show for a restaurant whose radius is not one of the choices.
 *
 * A restaurant created through the API carries whatever radius it was given —
 * 3,500 m is a real seeded value. Rounding that to the nearest chip would make
 * the screen disagree with the record, arm Save on a screen nobody touched,
 * and quietly cut 500 m of reach on the first save. So the stored value joins
 * the list in its own right, in order, exactly as the hours editor keeps an
 * off-grid time.
 */
export function radiusChoicesFor(meters: number): number[] {
  const choices: number[] = [...RADIUS_CHOICES];
  if (choices.includes(meters)) return choices;

  return [...choices, meters].sort((a, b) => a - b);
}

/**
 * A move small enough to be the map settling rather than the owner deciding.
 *
 * `onCameraMove` fires continuously, and the returned centre drifts by a metre
 * or two even when nothing was touched. Without this the Save button would arm
 * itself on a screen nobody interacted with.
 */
const SETTLE_METERS = 5;

export function hasChanged(
  saved: { point: Coordinates; radiusMeters: number },
  draft: { point: Coordinates; radiusMeters: number },
): boolean {
  if (draft.radiusMeters !== saved.radiusMeters) return true;
  return distanceBetween(saved.point, draft.point) > SETTLE_METERS;
}

/**
 * How far the pin has been dragged from where the restaurant is on record.
 *
 * Shown, not blocked. Moving a kitchen across the city is legitimate and rare;
 * doing it by accident while pinching the map is neither, and the only
 * difference between them is whether the owner meant it.
 */
export const FAR_MOVE_METERS = 2_000;

export function movedFar(saved: Coordinates, draft: Coordinates): boolean {
  return distanceBetween(saved, draft) > FAR_MOVE_METERS;
}

/**
 * A zoom that fits the chosen circle on screen.
 *
 * Picking 15 km and seeing the same three streets says nothing; the circle is
 * the whole explanation of the radius (t8), so it has to be visible. Halving
 * the radius is one zoom level, which is what the log is doing.
 */
export function zoomForRadius(meters: number): number {
  return 14.6 - Math.log2(Math.max(meters, 1) / 500);
}
