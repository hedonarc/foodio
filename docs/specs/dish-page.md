# The dish page

**What**: `menu-item/[id]` — a bigger look at one dish, plus the two things the
menu row cannot express: **quantity before adding**, and a **special
instruction**.

**Reached by tapping the row.** `MenuItemCard` was a plain `View`; it is now a
`Pressable` with `AddToCartControl` nested inside it. The inner control claims
the touch, so `+` adds without navigating — verified on a physical device
rather than assumed, since a press that both adds and navigates is the worst
outcome available here.

**The `+` is a plain-line-only control**, per
[cart line identity](https://github.com/hedonarc/foodio/issues/44). It means
"one more, as listed"; an instruction is attached from this page. That is why
the shortcut survives — it is a narrower act, not a lesser one.

**Route sits at the root stack** beside `restaurant/[id]`, so it covers the tab
bar and inherits the root `contentStyle` insets. Unlike `clip/[id]`, it
overrides nothing — that override is exactly what caused
[the viewer's inset bug](https://github.com/hedonarc/foodio/pull/42).

**One restaurant per cart** still holds: adding from a dish page while a cart is
held by another restaurant raises the same replace warning the row does.

**Require cycles**: both the store's `sameLine` import and the screen's
`useRestaurant` import must be **deep**, not through a feature barrel. Barrels
here reach back into the importing feature, and Metro warns at runtime rather
than failing the build — so this is caught by reading logcat, not by CI.

Decided in [#45](https://github.com/hedonarc/foodio/issues/45).
