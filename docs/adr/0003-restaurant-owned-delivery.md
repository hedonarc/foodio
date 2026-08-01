---
status: accepted
---

# Restaurant-owned delivery: no courier marketplace, one Restaurant per Cart

Every Foodio delivery is performed by the Restaurant's own **Delivery Staff**. There is no platform rider pool, no dispatch, and no bidding. This is a product differentiator, but it is also a **structural constraint on the model**, and the two most important consequences are easy to get wrong if you arrive with an Uber Eats mental model:

1. **A Cart belongs to exactly one Restaurant.** Adding an item from another Restaurant replaces the Cart; it never merges. In a marketplace this is a policy choice about basket splitting. Here it is arithmetic: two Restaurants means two sets of staff driving two vehicles, which is two Orders, not one.
2. **There is no "finding a courier" Order Status.** Marketplace apps need `SEARCHING_FOR_COURIER` / `COURIER_ASSIGNED` because a rider may not exist yet. A Foodio Order goes from the kitchen to the Restaurant's own staff, so the state has no referent. Introducing it would model a business we do not run.

Delivery eligibility follows the same logic: each Restaurant defines its own **Delivery Area**, so "can this Restaurant deliver to me?" is answered per-Restaurant against the customer's Delivery Address — not against a platform coverage map. Proximity is not eligibility, which is why the glossary separates _nearby_ from **Deliverable**.

## Consequences

- `Restaurant` gains coordinates and a delivery radius; the stored `distance` field is **removed** rather than retyped. Distance is derived per-customer from their location, so storing it on the Restaurant made it wrong for everyone.
- This is the first real consumer of the location permission the onboarding flow already requests. Today that permission is requested and no coordinate is ever read — which is both a dark pattern and grounds for App Store rejection.
- Order Status vocabulary is: placed → accepted → preparing → ready → out for delivery → delivered, plus **Rejected** (Restaurant declines) and **Cancelled** (customer withdraws). Those last two are distinct events with distinct actors and must not be merged into a shared "failed" state.
- Discovery must visibly distinguish Deliverable Restaurants from ones the customer can browse but not order from. Showing a Restaurant that cannot deliver, with no signal, converts a browse into a dead end at checkout.
