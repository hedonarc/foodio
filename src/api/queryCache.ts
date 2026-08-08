import type { QueryClient } from '@tanstack/react-query';

/**
 * Set by QueryProvider once the client exists. Same wiring pattern as
 * `setAuthTokenSource` in `./client` — a plain module variable rather than an
 * import, so this module does not depend on a provider that depends on it.
 */
let queryClient: QueryClient | null = null;

export function setQueryClient(client: QueryClient): void {
  queryClient = client;
}

/**
 * Every cached response is keyed by content (`['orders', 'list']`, ...), not
 * by who asked — the server resolves identity from the token, not a client
 * key. Nothing stops a signed-in-as-someone-else cache from surviving an
 * identity change, so the session store clears it on every sign-in and
 * sign-out.
 */
export function clearQueryCache(): void {
  queryClient?.clear();
}
