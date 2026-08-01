---
status: accepted
---

# Money is stored as integer minor units

Every monetary value in the API and the domain is an **integer count of the currency's minor unit** (`priceMinor: 1499` for $14.99), paired with an ISO-4217 `currency` code carried on the Restaurant. Rendering a display string such as "$14.99" happens only at the view boundary, via a helper in `src/utils/currency.ts`, using the viewer's locale.

The prior model stored `price: 14.99` as a float and `deliveryFee: "$1.99"` as a pre-formatted string. Floats accumulate error across cart arithmetic (`0.1 + 0.2 !== 0.3`), producing totals that are off by pennies in a payment flow; and a string with a baked-in `$` cannot be added to anything at all, which made a cart subtotal literally uncomputable.

## Considered options

- **A `Money` value object** (`{ amountMinor, currency }`) on every price. Rejected as redundant: every Menu Item in a Restaurant shares that Restaurant's currency, so the code would be repeated on every field and every wire payload for no added safety.
- **A money library such as dinero.js.** Rejected: a runtime dependency for arithmetic that integer addition already does correctly.
- **Floats formatted at the edge.** Rejected: defers the rounding errors rather than removing them.

## Consequences

- All arithmetic (subtotal, Delivery Fee, tax, tip, discounts) is integer arithmetic and exact.
- Currency lives on the Restaurant. A Cart is scoped to one Restaurant (see [ADR-0003](./0003-restaurant-owned-delivery.md)), so a Cart can never mix currencies — the invariant that a `Money` object would have protected is already structurally guaranteed.
- Every existing price in `db.json`, and `MenuPrice.tsx`'s hardcoded `$` and `.toFixed(2)`, must be migrated. This is being done during the mock-to-`db.json` migration, when the cost is lowest.
- Zero-decimal currencies (JPY, KRW) work without special cases; the minor-unit exponent comes from `Intl.NumberFormat`, not from an assumed `100`.
