/**
 * Minimal logging seam.
 *
 * AGENTS.md asks for two things that pull against each other — never swallow
 * errors, and no console output in production. Both helpers no-op outside
 * `__DEV__`, and this is the single place to forward to Sentry or similar when
 * that lands.
 */
export function logError(scope: string, error: unknown): void {
  if (!__DEV__) return;
  console.warn(`[${scope}]`, error);
}

/**
 * Development tracing. Deliberately `console.log` rather than `console.warn`:
 * a warn raises a LogBox banner across the bottom of the screen, which sits
 * exactly where the onboarding buttons are and swallows taps aimed at them.
 */
export function logDebug(scope: string, message: string): void {
  if (!__DEV__) return;
  console.log(`[${scope}] ${message}`);
}
