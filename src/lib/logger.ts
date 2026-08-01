/** Dev-only, so errors are never swallowed and never ship to production. */
export function logError(scope: string, error: unknown): void {
  if (!__DEV__) return;
  console.warn(`[${scope}]`, error);
}
