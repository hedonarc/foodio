# Foodio

Food discovery and delivery, where **every delivery is performed by the restaurant's own staff** rather than a third-party rider pool. That single fact changes the meaning of several terms below — read them even if you think you know them.

This file is a glossary and nothing else. Decisions live in [`docs/adr/`](./docs/adr/); architecture lives in [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

## Language

### Restaurant

**Restaurant**:
A business that prepares food, publishes a Menu, and delivers its own Orders using its own Delivery Staff. Restaurants are wholly independent — they never share staff, fees, or Delivery Areas.
_Avoid_: Vendor, merchant, store, partner

**Delivery Staff**:
A person employed by a Restaurant who delivers that Restaurant's Orders. They belong to the Restaurant, not to Foodio, and are never assigned across Restaurants.
_Avoid_: Courier, driver, rider, fleet

**Delivery Area**:
The region a Restaurant is willing to deliver to, defined by that Restaurant. There is no platform-wide coverage map.
_Avoid_: Coverage zone, service area, radius

**Delivery Fee**:
What a Restaurant charges to deliver an Order. Set by the Restaurant, which bears the cost.
_Avoid_: Shipping, service charge

**Opening Hours**:
The times a Restaurant accepts Orders, expressed in the Restaurant's own local time.
_Avoid_: Schedule, availability

**Open / Closed**:
Whether a Restaurant is currently accepting Orders. A Closed Restaurant remains discoverable and browsable — it simply cannot receive an Order.

### Menu

**Menu**:
The complete set of food one Restaurant offers, organised into Menu Categories.

**Menu Category**:
A named grouping within a Menu, such as _Popular_ or _Desserts_. Categories are for browsing only and carry no pricing or availability meaning. _Popular_ is curated, not computed — it does not reflect live order volume.
_Avoid_: Section, group, tag

**Menu Item**:
A single orderable dish belonging to exactly one Restaurant. Two Restaurants selling "Classic Burger" have two entirely separate Menu Items; there is no shared catalogue.
_Avoid_: Product, SKU, dish, food

**Price**:
What a Restaurant _currently_ charges for a Menu Item. A Price is live and changeable, and is not what any customer actually paid — see Order Line.

**Money**:
An exact amount in a stated currency. `"$1.99"` is a _rendering_ of Money for a given locale, never Money itself.
_Avoid_: Amount, cost, total (as bare types)

### Discovery

**Discovery**:
How a customer finds something to eat before they have a Restaurant in mind. Distinct from Browsing, which is what they do once inside a Restaurant.

**Deliverable**:
Describes a Restaurant that both delivers to the customer's Delivery Address and is currently Open. Only a Deliverable Restaurant can receive an Order.
_Avoid_: Nearby, available — proximity does not imply a Restaurant will deliver to you

### Clips

**Clip**:
A short video about a Restaurant's food, authored either by the Restaurant or by a customer. A Restaurant's Clip is marketing; a customer's is a receipt — the gap between the two is what Foodio exists to show.
_Avoid_: Reel, Story, Post, Video

**Clip Author**:
Who made a Clip — a Restaurant, or a customer. A customer's Clip carries the delivered Order it came from, so its credibility is structural: a Clip with no Order cannot claim to be a receipt, and there is no separate "verified" flag able to disagree with reality.

**Ours and theirs**:
When a Restaurant's Clip and a customer's Clip reference the same Menu Item, that dish can show both. This is the comparison at its sharpest — the food as advertised, beside the food as delivered.

### Ordering

**Cart**:
A customer's draft order before it is placed. Private to the customer, never seen by a Restaurant, and belonging to exactly one Restaurant — adding an item from a different Restaurant replaces the Cart rather than merging into it.
_Avoid_: Basket, bag, order (before submission)

**Cart Line**:
One Menu Item in a Cart, with a quantity.

**Order**:
A Cart that has been submitted to a Restaurant. This is the moment of commitment: the Order becomes visible to the Restaurant and can no longer be freely edited.
_Avoid_: Purchase, transaction, checkout (as a noun)

**Order Line**:
One Menu Item within an Order, capturing the amount charged **at the time the Order was placed**. An Order Line never follows a Menu Item's current Price.

**Order Status**:
Where an Order has reached in its life — accepted or rejected, prepared, handed to Delivery Staff, delivered. There is deliberately no "finding a courier" stage, because the Restaurant delivers its own Orders.

**Rejected**:
A _Restaurant_ declining an Order.
_Avoid_: Failed, declined order (ambiguous with Cancelled)

**Cancelled**:
A _customer_ withdrawing an Order. Never collapse Rejected and Cancelled into one state — different actors, different causes.

**Delivery Address**:
Where the customer wants an Order delivered. It decides whether a Restaurant is Deliverable, so it is needed _before_ checkout, not merely at the end of it.
_Avoid_: Shipping address, location

**Checkout**:
The act of turning a Cart into an Order. Always a verb — the noun for what comes out is an Order.

**Blocker**:
A reason a Cart cannot become an Order right now: no Delivery Address, a Closed Restaurant, an address outside the Delivery Area, or a Price that has changed since the item was added. Blockers are listed together, not one at a time, so a customer sees everything standing between them and their food.
