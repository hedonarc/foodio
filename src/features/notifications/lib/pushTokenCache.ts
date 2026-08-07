/**
 * The last push token this device successfully registered. A plain module
 * variable rather than a store: sign-out needs to fire deregistration
 * synchronously, before local session state clears, so the API client's
 * request interceptor still finds a valid access token — waiting on a fresh
 * `getExpoPushTokenAsync()` call at sign-out time would lose that race.
 * Mirrors `api/client.ts`'s own plain-variable pattern for the same
 * avoid-a-store-dependency reason.
 */
let registeredPushToken: string | null = null;

export function setCachedPushToken(token: string): void {
  registeredPushToken = token;
}

export function getCachedPushToken(): string | null {
  return registeredPushToken;
}

export function clearCachedPushToken(): void {
  registeredPushToken = null;
}
