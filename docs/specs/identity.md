# Identity and entitlement

**A Person** is `id`, `displayName` and nested `entitlements[]` — nothing else.
Every extra field would be unverified data dressed as real. Zero entitlements
means customer: the baseline, not a row.

**An entitlement** is one relationship per Restaurant carrying capabilities —
`(person, restaurantId, [serve, deliver])`. Delivering is a capability _inside_
a Restaurant, never a peer role, per [ADR 0003](../adr/0003-restaurant-owned-delivery.md).
Seeded in `db.json`; nobody grants themselves anything.

**Signing in** is an identity picker. It pretends nothing — a password field
would promise verification the server cannot do. It POSTs `/sessions` and
receives a token.

**The client never decides who it is.** The token attaches in a single Axios
interceptor; no call site puts a person in a URL. `mocks/middlewares.cjs`
resolves token → person and scopes server-side:

- `GET /orders` without a token is **401**.
- `GET /orders` sets `req.query.customerId` before the router, so
  `X-Total-Count` stays honest.
- `GET /orders/:id` for someone else's order is **404**, not an empty 200 the
  client has to interpret.
- `POST /orders` stamps `customerId` from the token, alongside `status` and
  `placedAt`. The client asserts none of the three.

Swapping in real auth replaces the picker and this middleware — no hook, no
component, no query key. That is [ADR 0001](../adr/0001-json-server-owns-the-api-contract.md)'s
test.

**Storage.** Token and active role in Expo Secure Store. iOS keeps Secure Store
across app uninstall and Android does not, so **explicit sign-out is required**
and "uninstall to reset" is wrong on one platform.

**Hydration.** The root splash waits for both onboarding and session, so no
screen renders against an unknown identity. A stored token is a claim: it is
resolved through the server, and a token whose person no longer resolves is
simply not a session.

Decided in [#54](https://github.com/hedonarc/foodio/issues/54)–[#61](https://github.com/hedonarc/foodio/issues/61).

## Roles change the navigator

`Stack.Protected` on the active role selects between `(tabs)`, `(serving)` and
`(delivering)` — the idiom the layout already used for onboarding, applied to a
second axis. Conditional children inside one `Tabs` was rejected: serving has
no Cart and delivering has no Menu, so a bar that swaps every tab is two bars
pretending to be one.

Switching resets to the role's home in both directions, because the screen you
were on usually does not exist in the destination. The cart survives — it is
memory-only anyway, and **sign-out**, not switching, is what clears a person's
state.

The active role persists in Secure Store and is re-resolved against current
entitlements on launch, so a revoked role falls back to ordering silently
rather than showing a dead surface.

**Staff read a Restaurant's orders, not their own.** `?forRestaurantId=` says
_which_ of your restaurants; the middleware checks the token's entitlements and
answers **403** if you do not work there. The client never asserts the right.

**Advancing an Order is not built.** Accept, reject and mark-ready are a real
workflow with decisions behind them and no charted spec, so the queue is
read-only rather than invented.
