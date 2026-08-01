---
status: accepted
---

# The Cart lives in Zustand; the Order lives in TanStack Query

`AGENTS.md` says never duplicate server state inside Zustand, so a Cart in a Zustand store looks like a violation. It isn't, and the distinction is worth stating explicitly because the next person to read the code will reach for the rule before the reason.

**A Cart is not server state.** It is a customer's private draft: no Restaurant can see it, nothing in the business depends on it, and there is no server record it could be a stale copy of. It is client state in the same sense a half-filled form is. **An Order is server state** — it exists the moment it is submitted, the Restaurant acts on it, and its status changes without the app asking. Orders therefore belong to TanStack Query, and the Cart's entire life ends at the moment it becomes one.

## Consequences

- A Cart Line stores a **snapshot** of the Price at the time the item was added, not a live reference to the Menu Item. Prices change while a customer shops; the Cart must be re-validated against current Prices at checkout and any change surfaced before payment, rather than silently repricing under them.
- Cart Lines are keyed by their own line id, not by menu item id. That costs nothing now and is what allows two lines of the same dish with different options to coexist once modifiers exist.
- The Cart is in-memory for this release. Surviving an app restart is a genuine retention feature (abandoned-cart recovery), but it needs a storage dependency the project does not have — `expo-secure-store` is the wrong tool, being intended for secrets and capped at 2048 bytes per value. Tracked as follow-up work rather than built speculatively.
- The single-Restaurant invariant from [ADR-0003](./0003-restaurant-owned-delivery.md) is enforced in the store, so it cannot be violated by a screen that forgets to check.
