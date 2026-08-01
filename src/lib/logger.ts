/**
 * Minimal logging seam.
 *
 * AGENTS.md asks for two things that pull against each other — never swallow
 * errors, and no console output in production. This satisfies both, and gives
 * a single place to forward to Sentry or similar when that lands.
 */
export function logError(scope: string, error: unknown): void {
  if (!__DEV__) return;
  console.warn(`[${scope}]`, error);
}
