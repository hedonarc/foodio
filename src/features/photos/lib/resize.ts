/**
 * Longest edge after shrinking. Comfortably more than a phone screen needs at
 * any size the app shows a photograph, and a normal picture lands well under
 * 500KB at this size — which matters because the connection being spent is the
 * restaurant owner's upload, not the customer's download.
 */
export const MAX_EDGE = 1600;

export type Dimensions = { width: number; height: number };

/**
 * What to pass the manipulator, or `undefined` when the picture is already
 * small enough to leave alone.
 *
 * Only the longest edge is given, so the other is derived and the aspect ratio
 * cannot drift. Constraining both is how a photograph ends up subtly stretched.
 */
export function resizeTo({
  width,
  height,
}: Dimensions): { width: number } | { height: number } | undefined {
  if (width <= 0 || height <= 0) return undefined;
  if (width <= MAX_EDGE && height <= MAX_EDGE) return undefined;

  return width >= height ? { width: MAX_EDGE } : { height: MAX_EDGE };
}
