---
status: accepted
---

# The API contract is defined by us and served by json-server

Foodio has no backend, and building one is out of scope — but shipping a real ordering flow requires loading states, error states, retries and cache invalidation, none of which can exist when screens read synchronously from `MOCK_RESTAURANTS.find(...)`. We run **`json-server@0.17.4`** as a local dev dependency serving a committed `db.json`, with a `routes.json` that maps our chosen URLs onto its resources, so the app talks real HTTP through Axios and TanStack Query from day one.

The important part is the direction of authority: **we design the contract, and json-server pretends to serve it** — not the reverse. Replacing the mock with a real backend should mean changing a base URL, not rewriting a single screen or hook.

## Considered options

- **`json-server@1.0.0-beta.15`** — the version `npm install json-server` actually resolves to. Rejected: v1 removed `--delay`, `--middlewares`, and `--routes`. Without `--delay` the API answers instantly and we are back to having no loading states, which defeats the purpose. Without `--routes`, json-server's flat resource dialect dictates our URLs (`GET /menuItems?restaurantId=x` with client-side joining) instead of the contract we want (`GET /restaurants/:id/menu`). It has also been in beta since 2024.
- **An in-app fake transport** (a promise-based adapter behind the Axios client). Rejected: needs `__DEV__`-guarded simulation code inside the shipping bundle, and never exercises real HTTP status codes, headers or timeouts.
- **A hosted BaaS (Supabase/Firebase)** — rejected as both a backend service and a dependency with real lock-in.
- **Keeping direct mock imports** — rejected: retrofitting a query layer later rewrites every screen and every data-consuming component.

## Consequences

- `0.17.4` is unmaintained. Accepted: it is a dev-only tool that never ships, and its feature set is frozen in a state that suits us.
- Middleware must be named `middlewares.cjs`, not `.js` — `package.json` declares `"type": "module"`, so a `.js` file using `module.exports` would fail to parse. This is the same hazard that forced `metro.config.js` → `metro.config.cjs`.
- `localhost` is not reachable from an Android emulator (`10.0.2.2`) or a physical device (the host's LAN IP). The API base URL must be derived at runtime rather than hardcoded in `EXPO_PUBLIC_API_URL`.
- json-server has no business logic: it will not recompute totals, validate an Order, or advance an Order Status on its own. Anything resembling server-side behaviour has to be explicitly faked in `middlewares.cjs` or acknowledged as untested until a real backend exists.
