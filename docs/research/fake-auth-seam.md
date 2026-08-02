# What json-server can honestly fake about a session

Research for [#57](https://github.com/hedonarc/foodio/issues/57) (parent: [#53](https://github.com/hedonarc/foodio/issues/53)). Establishes what `json-server@0.17.4` can genuinely enforce, what Expo Secure Store on SDK 57 will and will not keep, and where the seam sits so that swapping in a real backend changes a base URL, not every screen ([ADR 0001](../adr/0001-json-server-owns-the-api-contract.md)).

Every claim below is labelled:

| Label           | Meaning                                                                                            |
| --------------- | -------------------------------------------------------------------------------------------------- |
| **[DOC]**       | Stated in the SDK 57 versioned docs or json-server's own README. Cited.                            |
| **[SRC]**       | Proven by reading — or, where marked, by **running** — the installed source. Cited with file path. |
| **[COMMUNITY]** | Third-party package or practice. Not a guarantee.                                                  |
| **[INFERENCE]** | Our reasoning from the above. Not documented. Treat as a hypothesis.                               |

Primary sources: the installed `node_modules/json-server@0.17.4` and `node_modules/expo-secure-store@57.0.1`, <https://docs.expo.dev/versions/v57.0.0/sdk/securestore/>, <https://docs.expo.dev/router/advanced/authentication/>, and `github.com/expo/expo` at branch `sdk-57`.

**Everything in §0–§2 marked "measured" was produced by running `json-server@0.17.4` locally** with this repo's real `routes.json`, a seeded `orders` collection and a probe middleware, then curling it. Those are observations, not readings.

---

## Headline

**json-server can fake more than expected, and the honest ceiling is higher than "the client filters".** A middleware sees the `Authorization` header, can reject with a real 401 before the router runs, can scope a collection to the requester **server-side**, can enforce ownership on `/orders/:id` with a real 404, and can serve endpoints that do not exist in `db.json` at all. What it cannot do is _verify_ anything: there is no password hashing, no signature, no expiry, no revocation. The token is a name badge, not a credential.

That distinction is exactly the one the seam should encode. **The lie to avoid is not "the token is fake" — it is "the client knows who it is".** Every question below reduces to keeping identity on the wire and out of the query builder.

---

## 0. Where a `--middlewares` function actually sits

**[SRC]** The pipeline is assembled in `createApp` (`node_modules/json-server/lib/cli/run.js:34-67`), in this exact order:

```
defaults  →  rewriter        →  middlewares    →  pause(--delay)  →  router
(cors,       (routes.json)      (middlewares      (400ms)            (db.json
 static,                         .cjs)                                resources)
 logger,
 bodyParser)
```

Four consequences, all measured:

**a. The body is already parsed.** `bodyParser` is inside `defaults`, which runs first (`lib/server/defaults.js:69-71`, `lib/server/body-parser.js`). That is why `middlewares.cjs` can already rewrite `req.body.status` on POST. `body-parser.json` is configured with `limit: '10mb'`.

**b. The middleware sees the _rewritten_ URL, not the one the client asked for. [SRC — measured]** `routes.json` rewriting happens _before_ the middleware. Probing `GET /restaurants/r-1/menu`:

```json
{
  "url": "/menuCategories?restaurantId=r-1&_embed=menuItems&_sort=position",
  "originalUrl": "/menuCategories?restaurantId=r-1&_embed=menuItems&_sort=position",
  "path": "/menuCategories",
  "authorization": "Bearer tok-u1"
}
```

`req.originalUrl` is overwritten too — the pretty URL is **gone** by the time the middleware runs. **[INFERENCE]** So any path-based auth rule must be written against json-server's internal resource names (`/menuCategories`), not against the public contract we designed (`/restaurants/:id/menu`). That is a maintenance trap: adding a rewrite silently changes which rule matches. Guard on resource names, and keep `routes.json` and the auth rules in one reviewer's field of view.

**c. A middleware short-circuit bypasses `--delay` entirely. [SRC — measured]** With the server started at `--delay 400`:

| request                              | status | time        |
| ------------------------------------ | ------ | ----------- |
| `GET /orders` (no `Authorization`)   | 401    | **0.0014s** |
| `GET /orders` (valid token)          | 200    | 0.406s      |
| `POST /sessions` (middleware-served) | 201    | **0.0096s** |
| `POST /login` (unhandled → router)   | 404    | 0.403s      |

`pause(argv.delay)` is registered _after_ the middlewares (`run.js:61-63`), so anything the middleware answers itself returns instantly. **[INFERENCE]** A sign-in that resolves in 10ms never exercises the spinner, the disabled button, or the double-submit guard — the three things a sign-in screen exists to get right. If a fake session endpoint is built, it must add its own delay. **This already affects the repo today**: `MOCK_FAIL_RATE` 503s and `x-mock-fail` responses also skip the delay, so the error states are being tested against an instant failure that production will never produce.

**d. A throw in the middleware returns an HTML 500, not JSON. [SRC — measured]** An uncaught `ReferenceError` produced `Content-Type: text/html` with a stack trace in a `<pre>`. **[INFERENCE]** `toApiError` (`src/api/errors.ts`) handles this acceptably — `readServerMessage` returns null on a non-object payload and it falls through to `messageForStatus(500)` — but the real message is lost. Auth middleware code needs its own try/catch if failures are to stay legible.

---

## 1. Can it read `Authorization` and return 401?

**Yes, completely. [SRC — measured]**

`req.get('authorization')` returns the header verbatim — confirmed in the probe above. This is not a json-server feature; the middleware is a plain Express 4 handler (`express@4.22.2` installed, from json-server's `^4.17.1` range), and it already uses `req.get('x-mock-fail')` today.

Returning 401 short-circuits cleanly:

```
HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8

{"error":{"status":401,"message":"Not authenticated."}}
```

**[SRC]** The shape matters and already works: `readServerMessage` in `src/api/errors.ts` reads `error.message` out of exactly this envelope, and `MESSAGES[401] = 'Not authenticated.'` is _already defined_ in `mocks/middlewares.cjs:16` — currently reachable only via `x-mock-fail: 401`. The 401 vocabulary is pre-wired; nothing consumes it yet.

**[SRC — measured]** CORS is not an obstacle. `defaults` mounts `cors({ origin: true, credentials: true })` (`lib/server/defaults.js:27-32`), and a preflight carrying `Access-Control-Request-Headers: authorization` returns `204` with `Access-Control-Allow-Headers: authorization`. Irrelevant on native, relevant for `pnpm web`.

**[SRC — measured] A middleware can also serve endpoints that do not exist in `db.json` at all.** `POST /sessions` — with no `sessions` key in `db.json` — returned `201` with a token body, and `400` for a missing field, purely from the middleware. Unhandled unknown routes fall through to json-server's catch-all and return `404 {}` (`lib/server/router/index.js:79-85`).

**[SRC — measured] Do _not_ back a session endpoint with a `db.json` collection.** A `POST` to a real collection persists to the file on disk (measured: `orders` went from 3 entries to 4, via lowdb's `FileSync` adapter, `lib/server/router/index.js:22-24` and `router/write.js`). A `sessions` collection would therefore append every dev login into a committed file. Serve it from the middleware and keep it in memory.

---

## 2. Can it scope a collection to the requester?

**Yes — and there are three mechanisms with materially different honesty. [SRC — measured]**

Seeded `orders`: `o1` (u1), `o2` (u2), `o3` (u1). Unscoped `GET /orders` returns all three.

### (a) Mutate `req.query` before the router — the good one

```js
if (req.method === 'GET' && req.path === '/orders') req.query.customerId = userId;
```

**[SRC]** Works because Express 4 assigns `req.query` as an own, writable property, and json-server's `list()` handler filters straight off `req.query` (`lib/server/router/plural.js:98-131`). Measured: `tok-u1` → `[o1, o3]`, `tok-u2` → `[o2]`.

### (b) Wrap `res.jsonp` after the router — the one already in use

The technique `progressed()` uses today for order status (`mocks/middlewares.cjs:73-76`). It works — measured `[o1, o3]` — but it filters the _response_, after json-server has already counted.

### (c) Check ownership in the middleware against the live db — for item routes

**[SRC — measured]** `req.app.db` is reachable from the middleware at request time. `createApp` sets `app.db = router.db` (`run.js:65`), and although the middleware is registered before that line runs, `req.app` resolves at request time, so the lowdb chain is available:

```js
const order = req.app.db.get('orders').getById(id).value();
if (!order || order.customerId !== userId) return res.status(404).jsonp(errorBody(404));
```

Measured: u1 reading `o2` → **404**; u1 reading `o1` → **200** with the order.

### The comparison that decides it

|                                | `X-Total-Count` under `_page`/`_limit` | `GET /orders/o2` as u1            |
| ------------------------------ | -------------------------------------- | --------------------------------- |
| (a) `req.query` mutation       | **2 — correct**                        | **200 with u2's order — an IDOR** |
| (b) `res.jsonp` wrap           | **3 — lies**                           | `200` with body `null`            |
| (c) middleware ownership check | n/a (item routes)                      | **404 — correct**                 |

Both single-mechanism answers are wrong in a way that would be caught in code review of a real API:

- **(a) leaks item routes.** json-server's `show()` handler (`plural.js:187-205`) reads `req.params.id` and ignores `req.query` entirely, so a query filter protects the collection and nothing else.
- **(b) corrupts pagination.** `X-Total-Count` is set inside `list()` before the response is written (`plural.js:141-144`), so a post-filter cannot correct it. Any future infinite scroll built on that header would page through phantom results.
- **(b) also returns `200` with `null`.** **[INFERENCE]** That is worse than it looks: `parseResponse` (`src/api/parse.ts`) would reject `null` against `orderSchema` and throw `ApiError('contract', ...)`. A missing order would surface to the user as _"Unexpected response from GET /orders/o2"_ — a schema-drift message for what is really a permission failure.

**Recommendation: (a) for collections + (c) for item routes.** Together they give correct counts, a real 404 on someone else's order, and no client-side filtering anywhere.

### What client-filtering would teach — and why a real API would punish it

**[SRC]** The client is currently _already correct_ by accident. `fetchOrders()` (`src/features/checkout/api/order.api.ts:18-21`) calls:

```
GET /orders?_sort=placedAt&_order=desc
```

No identity in the URL. The contract already reads "the server returns the orders I am allowed to see". **[INFERENCE]** Scoping server-side therefore requires **zero client change** — which is the ADR 0001 test passing.

The alternative — `GET /orders?customerId=${me}` — is a one-line change that costs three things:

1. **It makes the client the authority on identity.** A real API derives the subject from the token and _ignores_ a `customerId` parameter; sending one that disagrees is either silently overridden or a 403. The habit produces a request whose meaning inverts when the backend becomes real.
2. **It bakes identity into the cache key.** TanStack Query keys would carry `customerId`, so the parameter propagates into every hook signature and every invalidation call — the opposite of a base-URL-sized swap.
3. **It has no answer for `GET /orders/:id`.** You cannot query-filter an item route. The client would either fetch and compare `customerId` in JS — deciding permission on the device, which is precisely the thing a permission is not — or leave it open.

**[INFERENCE]** The strong form: _a fake server that scopes badly is still teaching a true shape; a client that filters is teaching a false one._ Only the second survives into production as a bug.

**[SRC] One schema consequence.** `orderSchema` (`src/features/checkout/types/order.types.ts`) has **no `customerId` field today**, and `db.json` ships `orders: []`. There is nothing to scope _by_ yet — adding an owner to the Order model is a prerequisite for any of this, and belongs in the map's decisions.

### A community shortcut, and why not

**[COMMUNITY]** [`json-server-auth`](https://github.com/jeremyben/json-server-auth) implements exactly this — JWT sign-up/login plus Unix-style permission digits (`640` etc.), with private routes checking that the token's `sub` matches the resource's `userId`. It mounts as a json-server middleware and declares `peerDependencies: { "json-server": "*" }`.

**[SRC]** Its npm `latest` is **2.1.0, published 2021-07-21** — five years stale, and it pulls in `bcryptjs` and `jsonwebtoken@^8`. **[INFERENCE]** Reject it. It is more machinery than the ~30 lines above, it introduces real crypto into a mock whose entire premise is that there is none, and its permission model is a second contract to learn that no real backend will match. Read it for the ownership-check idea; do not install it.

---

## 3. The Axios seam

**[SRC] The interceptor seam already exists and is already load-bearing** (`src/api/client.ts`):

```ts
apiClient.interceptors.request.use((config) => {
  const baseURL = resolveApiUrl();
  if (!baseURL) throw new ApiError('config', API_URL_HELP);
  config.baseURL = baseURL;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
);
```

- **Attaching a token**: the request interceptor is the place, alongside the existing per-request `baseURL` resolution. **[INFERENCE]** The comment above it — _"Per request, not at import: throwing during module evaluation killed the app"_ — argues the token should be read the same way. But `SecureStore.getItemAsync` is async and this interceptor is sync; making it async is legal in Axios but adds an await to every request. **[INFERENCE]** Prefer holding the token in the auth store (memory) and having the _store_ own the Secure Store round-trip at hydrate/sign-in, exactly as `useOnboardingStore.hydrate()` already does. The interceptor then stays synchronous.

- **Handling 401**: **[SRC] nothing handles 401 today.** `toApiError` maps any `status < 500` to `ApiError('client', ...)` with `isRetryable === false`, and `messageForStatus` has no 401 branch — a 401 with no server message would read _"That request could not be completed."_ The response interceptor is where a 401 becomes a sign-out. **[INFERENCE]** `ApiErrorKind` should gain an `auth` member rather than overloading `client`, so screens can distinguish "you are signed out" from "that was a bad request" without string-matching a message.

- **[INFERENCE] There is no refresh flow to build.** Token refresh is the usual reason for a queue-and-retry response interceptor, and json-server cannot expire anything — so a 401 can only mean "the stored token is not one this middleware knows". Sign out and route to sign-in; do not build retry machinery that has nothing to retry against.

---

## 4. Expo Secure Store on SDK 57

**[SRC]** Installed and pinned: `expo-secure-store@57.0.1`; `node_modules/expo/bundledNativeModules.json:80` pins `~57.0.1`, so `expo install` resolves the same. **[DOC]** Platforms: `['android', 'ios', 'tvos', 'expo-go']`.

**[SRC]** The repo already uses it, correctly, in `src/services/storage/onboarding.storage.ts`. The auth work extends an existing pattern rather than introducing one.

### Size limit

**[DOC]** Verbatim, from `docs/pages/versions/unversioned/sdk/securestore.mdx` on `sdk-57` and the published v57 page:

> Large payloads can be rejected by the underlying platform. Historically, some iOS releases refused values above roughly 2048 bytes. Expo does not enforce a limit, so make sure to handle native errors if you plan to store very large strings.

**[SRC]** Confirmed by grep: there is **no** size constant in `src/SecureStore.ts`, `ios/SecureStoreModule.swift`, or `android/.../SecureStoreModule.kt`. The only JS-side validation is that the value is a string. **[INFERENCE]** Note the hedging — "historically", "roughly", "does not enforce". This is documented as _a platform may reject you_, not as a number to design to. For a fake session (an id and a role) it is irrelevant; it would only bite if a whole user profile or a real JWT with fat claims were stored. Store an opaque token, not a payload.

### Keys are charset-restricted

**[SRC]** `ensureValidKey` throws: _"Keys must not be empty and contain only alphanumeric characters, `.`, `-`, and `_`."_ So `foodio:session` throws at runtime; `foodio_session` is fine. The existing `foodio_onboarding_status` key already respects this.

### Survival across reinstall — the platforms disagree

**[DOC]** Verbatim:

> - **On Android:** Data saved using `expo-secure-store` **will not be preserved upon app uninstallation**.
> - **On iOS:** Data saved using `expo-secure-store` **will persist across app uninstallations** if the app is reinstalled with the same bundle ID. […] Keep in mind that this is not guaranteed and you should never rely on this implementation detail.

**[INFERENCE]** This is the constraint that actually binds, and it binds in the awkward direction. **Deleting the app does not sign you out on iOS.** A tester reinstalling to "start clean" gets the old session back; the same tester on Android gets a signed-out app. That asymmetry will be reported as a bug at least once, and any QA script of the form "uninstall to reset" is wrong on iOS. The app needs an explicit sign-out affordance, and the role-switcher work needs it _early_ — resetting entitlement by reinstalling will not work.

**[DOC]** Android Auto Backup is handled: the config plugin defaults `configureAndroidBackup: true` and excludes the `SecureStore` shared-prefs entry, "as it's impossible to decrypt them after restoring the backup — app's entries are deleted from the Android Key Store when the app is uninstalled." **[INFERENCE]** Nothing to do unless a custom backup config is later added, but it is worth knowing the exclusion is not accidental.

### No passcode, no biometrics

**[DOC]** The default is `keychainAccessible: SecureStore.WHEN_UNLOCKED`, which has no passcode requirement. **[INFERENCE]** So the plain path — `setItemAsync` / `getItemAsync` with no options, which is what this repo already does — works on a device with no passcode and no enrolled biometrics. There is no failure mode to design around unless options are opted into.

Two options change that, and both should be **declined** for a fake session:

- **[DOC]** `WHEN_PASSCODE_SET_THIS_DEVICE_ONLY`: _"the user must have set a passcode in order to store an entry. If the user removes their passcode, the entry will be deleted."_
- **[DOC]** `requireAuthentication: true` prompts on every access. **[SRC]** On Android, `AuthenticationHelper.assertBiometricsSupport()` throws `AuthenticationException` when `BiometricManager.canAuthenticate(BIOMETRIC_STRONG)` returns `BIOMETRIC_ERROR_NONE_ENROLLED` — message: _"No biometrics are currently enrolled"_ — and separately for no hardware, security-update-required, unsupported, and unknown. **[DOC]** Its data is also invalidated when biometrics change: _"any data protected with the `requireAuthentication` option set to `true` will become inaccessible if there are changes to the user's biometric settings, such as adding a new fingerprint."_ **[DOC]** And it _"is not supported in Expo Go when biometric authentication is available due to a missing `NSFaceIDUsageDescription` key"_.

**[SRC]** `canUseBiometricAuthentication()` exists to test for this before writing. **[INFERENCE]** Use it only if biometric-gated sessions are ever wanted; for a fake token, gating it behind Face ID is theatre with real failure modes on emulators.

### Web is a stub

**[SRC]** `src/ExpoSecureStore.web.ts` is literally `export default {}`, and `isAvailableAsync()` is `return !!ExpoSecureStore.getValueWithKeyAsync` — so it returns `false` on web and every call throws on the missing method. `pnpm web` is in `package.json`. **[DOC]** The Expo Router auth guide handles this by branching to `localStorage` on web (§5). **[INFERENCE]** If web is meant to keep working, the storage service needs the same `Platform.OS === 'web'` branch. `onboarding.storage.ts` currently swallows the failure via `logError` and returns null, which degrades to "never onboarded" — survivable there, not survivable for a session.

### Sync vs async

**[DOC]** `getItem`/`setItem` exist and _"block the JavaScript thread, so the application may not be interactive"_ — the note is scoped to `requireAuthentication: true`, but blocking is blocking. **[INFERENCE]** Stay on the async pair, as the repo already does, and pay the cost once at hydrate.

---

## 5. Is there a documented Expo pattern to copy?

**Yes — [DOC] <https://docs.expo.dev/router/advanced/authentication/>, and this repo is already 80% of the way to it.**

The guide ships a complete, deliberately fake provider. Its `signIn` is, verbatim:

```tsx
signIn: () => {
  // Perform sign-in logic here
  setSession('xxx');
},
```

**[DOC]** Labelled: _"This provider uses a mock implementation. You can replace it with your own authentication provider."_ The pieces are `SessionProvider` + `useSession` in `ctx.tsx`, a `useStorageState` hook that writes to `SecureStore` on native and `localStorage` on web, a `SplashScreenController` that holds the splash screen while the session hydrates, and route protection via:

```tsx
<Stack.Protected guard={!!session}>
  <Stack.Screen name="(app)" />
</Stack.Protected>
<Stack.Protected guard={!session}>
  <Stack.Screen name="sign-in" />
</Stack.Protected>
```

**[SRC] `Stack.Protected` is available** in the installed `expo-router@57.0.9` (`build/layouts/StackClient.d.ts`), as are `Tabs.Protected` and `Drawer.Protected`.

**[SRC] The repo already implements this exact shape for onboarding** — `app/_layout.tsx` renders paired `<Stack.Protected guard={...}>` blocks driven by a Zustand store that hydrates from Secure Store, holding a spinner while `isHydrated` is false. **[INFERENCE]** So the copy is structural, not literal: keep the repo's Zustand store (AGENTS.md mandates Zustand for authentication, and the guide's React-Context version would be a second state mechanism doing the same job), and take from the guide only (i) the paired-guard route shape, which is already in use, (ii) the splash-until-hydrated behaviour, which is currently an `ActivityIndicator` and could become `SplashScreen.preventAutoHideAsync`, and (iii) the web branch in the storage service. Two hydration gates — onboarding and session — will need composing into one guard, which is a real design question the map should answer.

**[DOC]** The guide also documents a modal sign-in variant, where routes render underneath and must handle unauthenticated data loading. **[INFERENCE]** That variant is the one to reach for _if_ anonymous browsing is decided in favour — which #53 lists as unspecified.

**[DOC]** `/guides/authentication/` (the page the mock provider points at as the real replacement) is about OAuth via `expo-auth-session`. Not installed here, and out of scope per #53.

---

## 6. The ticket's proposition: is a magic link more honest than a fake password?

**The evidence supports it, and more strongly than the framing claims. [INFERENCE]**

The argument is not aesthetic. A password field is a **verification** affordance: it exists to assert that the server checked something only the user could know. §1 establishes that json-server can check nothing — no hashing, no comparison against a stored digest, no rate limit, no lockout. A password box that always passes therefore renders a promise the whole stack is structurally incapable of keeping, and it does it in the one place users have been trained to read as a security boundary.

It also costs real code that must later be deleted. React Hook Form + Zod validation for a password (AGENTS.md mandates both), a "wrong password" error state that can never fire, a forgot-password affordance with nothing behind it, and — the sharp end — a real password briefly living in JS memory and in form state for no reason at all. **[SRC]** The current `MESSAGES` table in `mocks/middlewares.cjs` has no 403 and no "invalid credentials" entry; inventing one means inventing a rejection the server cannot produce, which means faking the _failure_ too, which is where fake-auth codebases go to die.

A magic link — or a plain "continue as…" identity picker — asserts nothing false. It says _pick who you are_, which is exactly what the middleware does when it maps a token to a user id. **[INFERENCE]** For this repo the identity-picker form is the better fit: #53's destination is a **role switcher**, and a dev affordance that lists _"customer · restaurant staff · delivery"_ makes the entitlement model visible on day one, whereas email-based magic links imply an account directory json-server is not keeping.

**One qualification the evidence forces.** Honest-fake does not mean _client-side_ fake. If "pick who you are" is implemented by writing a role into Zustand and never telling the server, it is the same lie in a different place — the client would then be the authority on identity, which §2 argues against. The picker must POST to the middleware and receive a token back; the token must ride the `Authorization` header; the middleware must scope on it. That round trip is the entire point, and it is the part that survives the backend swap.

---

## 7. Where this touches #53's assumptions

- **"json-server […] cannot do real auth."** True, but the map's framing slightly undersells it. It cannot _verify_; it can _enforce_, server-side, once it has been told who is asking. Scoping, 401s, and item-level 404s are all reachable. The decision "can the server scope orders?" should be recorded as **yes**, not as a client workaround.
- **"Sessions go in Expo Secure Store, never AsyncStorage."** Correct and already the repo's habit — but Secure Store is **not** a clean-slate-on-reinstall store on iOS. Any decision that assumes uninstall resets identity is wrong on one of the two platforms.
- **Role is a permission, not a mode.** §2 supports this mechanically: the middleware is the only place that can turn a token into an entitlement without the client asserting it. If entitlement is computed on the device, the switcher is decoration.
- **New: the Order model has no owner.** `orderSchema` has no `customerId`, and `db.json` seeds `orders: []`. Nothing can be scoped until an owner exists on the Order — a prerequisite the map does not currently list.
- **New: the mock's error paths skip `--delay`.** Pre-existing, and it means the app's failure states have never been seen at realistic latency. Worth its own ticket independent of auth.

---

## What I could not settle by reading

1. **Whether iOS actually rejects values over ~2048 bytes on current iOS versions.** The docs hedge ("historically", "roughly") and there is no constant in the source. Only a device test settles it. Low stakes if the token stays opaque.
2. **Whether Secure Store data really survives reinstall on a current iOS build.** The docs say yes and then say _"this is not guaranteed and you should never rely on this implementation detail"_. Both cannot be designed around simultaneously; the safe read is "assume it survives, never depend on it". Needs one uninstall/reinstall on a real device.
3. **How two hydration gates compose.** Onboarding and session both gate the root navigator and both hydrate asynchronously. Whether that is one combined guard, nested `Stack.Protected` blocks, or a single splash controller is a design decision, not a fact to look up.
4. **Whether anonymous browsing is allowed.** This determines whether the middleware's 401 applies to `/orders` only or to `/restaurants` too, and therefore how much of §2 gets written. #53 lists it as unspecified; it is the fork everything else hangs off.
5. **Whether `req.app.db` is stable across a `--watch` reload.** Measured working on a running server; `run.js` rebuilds the app on `db.json` change (`server.destroy(() => start())`), and I did not verify that a middleware holding no reference behaves after a reload. It should, since `req.app` resolves per request — but that is inference, not observation.
6. **What a restaurant-staff token should scope _to_.** Customers scope by `customerId`; staff presumably scope by `restaurantId`, which means two different filters against the same collection and possibly a different route. Cannot be settled until restaurant mode is specified (#53, "not yet specified").
7. **Nothing was measured on a device.** Every Secure Store claim here is doc- or source-derived. The json-server findings are the opposite — those were run.
