# Cart Spec

## Problem Statement

The app was a dead end: a customer could browse a menu and then do nothing with it. Every success metric except acquisition sits downstream of an order the app could not begin to place.

## Solution

A Cart — the customer's draft order — held in Zustand, with an add control on every menu item, a persistent bar back to it, and a cart screen showing lines and totals.

This is the first half of the ordering spine. Checkout and order status follow.

## Decisions

**The Cart is client state, not server state.** No restaurant can see it and there is no server record it could be a stale copy of, so it does not violate "never duplicate server state in Zustand". An Order — which the restaurant acts on and whose status changes without asking — will be server state under TanStack Query. See [ADR-0004](../adr/0004-cart-is-client-state.md).

**A Cart belongs to exactly one restaurant, enforced in the store.** `addItem` from a different restaurant replaces the Cart rather than merging. This is not a policy choice about basket splitting: two restaurants means two sets of delivery staff, which is two orders. Enforcing it in `addItem` means no screen can violate it by forgetting to check. See [ADR-0003](../adr/0003-restaurant-owned-delivery.md).

**The UI asks before replacing.** `selectIsFromOtherRestaurant` lets `AddToCartControl` raise a confirmation first, so the invariant never silently discards a customer's cart.

**Lines carry their own id, not the menu item's.** Costs nothing now, and is what allows two lines of the same dish with different options once modifiers exist. Ids come from a monotonic counter rather than randomness, so the store stays deterministic under test.

**Lines snapshot the price.** `unitPriceMinor` is what the item cost when it was added, not a live reference. Prices change while a customer shops and the Cart must not reprice under them. Re-validation against current prices belongs to checkout.

**Totals are integer arithmetic** in the restaurant's currency, so a subtotal is exact rather than off by pennies. See [ADR-0002](../adr/0002-money-as-integer-minor-units.md).

**Decrementing the last unit removes the line**, and removing the last line unbinds the restaurant. A zero-quantity line and a cart bound to a restaurant it holds nothing from are both states worth making unrepresentable.

**The cart bar appears on discovery as well as the restaurant page.** A customer who navigates back from a restaurant would otherwise have no route to what they already added.

## What is deliberately absent

**Persistence.** The Cart is in-memory and does not survive an app restart. Abandoned-cart recovery is a real retention feature, but it needs a storage dependency the project does not have — `expo-secure-store` is the wrong tool, being for secrets and capped at 2048 bytes per value. Tracked rather than built speculatively.

**Modifiers.** No option groups, sizes, or "no onions". The data model has room for them; the UI does not need them yet.

## Testing

24 store tests covering the one-restaurant invariant, line merging versus line creation, quantity changes, removal at zero, and total arithmetic including a case where floats would drift.

## Out of Scope

- Checkout and payment
- Order placement and order status
- Blocking checkout when a restaurant is closed or out of delivery range — the data exists, the gate does not
- Cart persistence across restarts
- Item modifiers
