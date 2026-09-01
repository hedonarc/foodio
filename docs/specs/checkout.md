# Checkout Spec

## Problem Statement

The Cart could hold food but never become an Order. Nothing enforced the two conditions that decide whether an order can exist at all — is the restaurant open, and can it reach this address — even though `openingHours`, coordinates and `deliveryRadiusMeters` had been sitting in `db.json` unused since the data layer landed.

## Solution

`reviewCheckout` answers one question — _can this cart be ordered right now, and if not, why not_ — and everything else reads its output.

```ts
reviewCheckout(input): {
  blockers: CheckoutBlocker[];
  canPlaceOrder: boolean;
  subtotalMinor; deliveryFeeMinor; totalMinor;
}
```

The blockers are a discriminated union: `empty-cart`, `restaurant-unavailable`, `restaurant-closed`, `no-address`, `out-of-range` (carrying both distances), `price-changed` (carrying the affected lines).

## Decisions

**One module owns the rules.** Spread across the checkout button, the screen explaining why it is disabled, and any future "order again" entry point, these rules would drift. Behind one pure function they cannot. The screen renders blockers; it does not decide them.

**It is pure, and takes `now` as an argument.** No clock, no store, no I/O. That is what makes 19 tests possible without a screen, including the closed-restaurant and out-of-range cases that are otherwise awkward to reach.

**Totals stay on the snapshot price.** When a price changes, the total still reflects what the customer was shown, and `price-changed` reports the difference. Silently repricing at the moment of payment is the failure being designed out — see [ADR-0004](../adr/0004-cart-is-client-state.md).

**An item that has left the menu is not a price change.** There is no new price to compare against, so it is ignored rather than guessed at.

**The server owns `status` and `placedAt`.** Clients submit a `NewOrder` with neither. The mock API's middleware assigns them on `POST /orders`, and derives status from elapsed time on read, so order tracking moves without the client faking it. Status remains server state under TanStack Query, as [ADR-0004](../adr/0004-cart-is-client-state.md) requires. A real backend replaces the middleware and the client does not change.

**Terminal statuses stick.** Cancelled and rejected orders are never resumed by the timeline.

**The tracking query polls while an order is live** and stops once it reaches a terminal status.

**Cash on delivery is the only method that launches.** Card needs PCI scope and a real backend, and the restaurant-owned delivery model makes cash a legitimate first option rather than a placeholder. So one method works at launch, and the customer pays in cash at the door.

**Card ships as copy, not as a method.** Where a customer looks for card, the checkout says _coming soon_ rather than nothing: silence reads as _this app cannot take card_, and coming soon is the truth. The row is inert — not selectable, not a choice the screen can settle on — and carries no card fields, no tokenisation and no PCI surface. It is a sentence.

**The coming-soon row is the app's, not the restaurant's.** It is hardcoded in checkout, never a member of `PAYMENT_METHODS` and never something a restaurant can be listed as serving; a restaurant cannot offer a method that cannot take money. Card joins the list on the day it can be charged, and not before — which is also why the list is a list ([#127](https://github.com/hedonarc/foodio/pull/127)) and why an unknown method the server offers is skipped rather than fatal ([#130](https://github.com/hedonarc/foodio/pull/130)). That skip has its own copy, and it is a different story from card: it means _this build cannot show a method your restaurant serves_, not _we are working on it_.

**The payment record already has card's shape.** `OrderPayment` carries `authorized`, which cash never reaches because cash holds nothing — see the backend's ADR-0016. Modelling the state now costs nothing and keeps the day card arrives from being a migration; it stays unreachable until then.

**Address coordinates come from the device**, not the form. This is the first thing that reads the location permission onboarding has been requesting since the beginning — previously granted and never used, which was both a dark pattern and grounds for App Store rejection.

## Testing

19 tests over `reviewCheckout` and `distanceBetween`, covering each blocker in isolation, several at once, the boundary of the delivery radius, and totals that floats would get wrong.

Two render tests over `PaymentMethods` hold the payment shape: card is announced and the screen still offers exactly one choice, and a method this build cannot render is skipped with its own copy rather than mistaken for card.

## Out of Scope

- Taking card — the coming-soon row is the whole of card at launch
- Order history (`fetchOrders` exists; no screen consumes it yet)
- Live courier position on a map
- Editing an address book of more than one saved address
- Push notifications on status change — the permission is still requested and unused
