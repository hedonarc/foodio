# Tab navigation

**What**: `app/(tabs)/` — Home, Cart, Orders. Cart is a tab badged with the item
count. Root detail screens (`restaurant/[id]`, `checkout`, `address`,
`order/[id]`) push over the tab bar; the tab navigator stays mounted underneath.

**Why**: decided in [#21](https://github.com/hedonarc/foodio/issues/21) (the
clip feed needs a dedicated surface, arriving as the Clips tab) and
[#31](https://github.com/hedonarc/foodio/issues/31): exactly one cart
affordance at a time. Tabs visible → the Cart tab. Tabs hidden → the floating
`CartBar`, which now has one call site (restaurant detail) and owns
`CART_BAR_CLEARANCE`.

**Safe areas**: the root stack no longer pads the tab group — the tab bar owns
the bottom edge and each tab screen its own top (`SafeAreaView edges={['top']}`).
Root detail screens keep the blanket insets from `app/_layout.tsx`.

**Deliberate absences**: no Clips tab yet (next slice, with the feed behind
it); the orders icon left the search row — it was a stopgap for having no
better home.
