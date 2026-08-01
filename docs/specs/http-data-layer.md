# HTTP Data Layer Spec

## Problem Statement

Every screen read data synchronously from mock arrays (`MOCK_RESTAURANTS.find(...)`). Nothing could ever be pending or fail, so the app had no loading, error, empty or retry states — the states that separate a demo from something shippable. The domain model also baked presentation into the data: prices were floats, delivery fees were `"$1.99"` strings, and opening hours were prose. A cart subtotal was literally uncomputable, and "is this restaurant open?" was unanswerable.

## Solution

Run `json-server` locally as a dev dependency (`pnpm api`) serving `mocks/db.json`, with `mocks/routes.json` mapping the URLs the app wants onto its resources. Axios and TanStack Query sit on top. Zod validates every response at the boundary, and TypeScript types are inferred from those schemas.

No backend was built. Swapping in a real API should mean changing a base URL.

## Decisions

**The contract is ours.** `routes.json` gives us `GET /restaurants/:id/menu` returning ordered categories with items embedded. Without it the client would be written against json-server's flat dialect (`/menuItems?restaurantId=x` plus client-side joining) and permanently coupled to a mock tool. See [ADR-0001](../adr/0001-json-server-owns-the-api-contract.md).

**Pinned to `json-server@0.17.4`.** v1 removed `--delay`, `--middlewares` and `--routes`. Without `--delay` the API answers instantly and there are no loading states to design.

**Money is integer minor units** (`priceMinor: 1499`), with `currency` on the restaurant. See [ADR-0002](../adr/0002-money-as-integer-minor-units.md).

**Domain remodelled during the migration**, when the cost was lowest:

| Was                                                           | Is                                                             |
| ------------------------------------------------------------- | -------------------------------------------------------------- |
| `price: 14.99`                                                | `priceMinor: 1499`                                             |
| `deliveryFee: '$1.99'`                                        | `deliveryFeeMinor: 199` + `currency`                           |
| `deliveryTime: '20-30 min'`                                   | `deliveryEstimate: { minMinutes, maxMinutes }`                 |
| `hours: [{ day: 'Mon – Thu', hours: '11:00 AM – 10:00 PM' }]` | per-day `{ dayOfWeek, opensAt, closesAt }`                     |
| `distance: '1.2 mi'`                                          | removed; `latitude`, `longitude`, `deliveryRadiusMeters` added |
| `cuisine: 'Mexican • Tacos'`                                  | `cuisines: string[]`                                           |
| `date: 'Jul 18, 2026'`                                        | `postedAt: '2026-07-18'`                                       |

**`distance` was deleted, not retyped.** It is derived per-customer from their location, so storing it on the restaurant made it wrong for everyone.

**`RestaurantPreview` is gone.** The list schema is now the base the detail schema extends, so the two cannot drift.

**Zod schemas own the types.** A contract mismatch throws an `ApiError` naming the endpoint and field, instead of surfacing as an `undefined` several components deep.

**Errors are normalised once.** The Axios interceptor converts everything to `ApiError` with a `kind` (`network`/`timeout`/`client`/`server`/`contract`). Retry is offered only when it could help — a 404 or a contract mismatch fails identically every time.

**The API base URL is derived at runtime** from Expo's `hostUri` when `EXPO_PUBLIC_API_URL` is unset, because `localhost` means the emulator itself on Android and nothing at all on a physical device.

## What this unlocked

The restaurant page shows a real **Open now / Closed** badge, because opening hours became structured data rather than prose.

Coordinates and `deliveryRadiusMeters` are the first step toward using the location permission that onboarding already requests and never reads — currently both a dark pattern and grounds for App Store rejection.

## Testing

38 Jest tests (`jest-expo`) over the new logic: money formatting, opening-hours grouping and `isOpenAt` (including periods running past midnight), error normalisation, and boundary parsing. A `test` job was added to CI, which previously had none.

CI also only triggered on PRs to `main`; the trigger list now includes release branches so a long-lived release line still gets checked.

## Out of Scope

- Cart, checkout, orders — the ordering spine this exists to support
- Delivery eligibility UI (the data is there; nothing computes distance yet)
- Video playback (`FeaturedVideo` still carries only a thumbnail)
- Search and filtering
- Authentication
- Component and hook tests — only pure logic is covered so far
