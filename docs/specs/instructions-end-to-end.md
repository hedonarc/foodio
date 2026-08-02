# Instructions, end to end

**What**: a special instruction typed on the dish page survives to the placed
order — cart, checkout, and the order record.

**Cart** shows it under the line and edits it in a sheet. Saving re-applies the
identity rule, so an edit that collides with another line for the same dish
folds quantity into it. The affordance is present on lines with no note too,
reading "Add a note" — the plain line is a real line with an empty
instruction, not a line missing something.

**Checkout** shows it and does **not** edit it. Reviewing an order without
seeing "no onions" is an incomplete review; changing it is one tap back.

**Order** carries `instruction` on the line, **optional** because every order
that predates the field would otherwise fail to parse. Empty is omitted rather
than sent as `""` — on a historical record, absent and empty should not be two
ways of saying nothing.

**The mock needed nothing.** `middlewares.cjs` overwrites `status` and
`placedAt` and passes everything else through; json-server stores what arrives.

**Duplicate React keys**: `OrderStatusScreen` keyed lines by `menuItemId`,
which stops being unique the moment one dish can hold two lines. Now keyed by
index alongside it.

**Pre-existing bug fixed in passing**: `orderSchema.id` was `z.string()`, but
json-server assigns a **number** and `db.json` ships with `orders: []`. Placing
an order could never parse its own response — invisible until now only because
nobody had got past the checkout blockers. `z.coerce.string()`.

Decided in [#47](https://github.com/hedonarc/foodio/issues/47) and
[#48](https://github.com/hedonarc/foodio/issues/48).
